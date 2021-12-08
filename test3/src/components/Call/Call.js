import React, { useEffect, useContext, useReducer, useCallback, useState } from 'react';
import './Call.css';
import Tile from '../Tile/Tile';
import CallObjectContext from '../../CallObjectContext';
import MyContext from '../../MyContext';
// import SessionContext from '../../SessionContext';
import CallMessage from '../CallMessage/CallMessage';
import {
  initialCallState,
  CLICK_ALLOW_TIMEOUT,
  PARTICIPANTS_CHANGE,
  CAM_OR_MIC_ERROR,
  FATAL_ERROR,
  callReducer,
  isLocal,
  isScreenShare,
  containsScreenShare,
  getMessage,
} from './callState';
import { logDailyEvent } from '../../logUtils';
import setSubscriptions from '../../hooks/setSubscriptions';
function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
}

export default function Call() {
  const callObject = useContext(CallObjectContext);
  // const [ sessionState, setSessionState ] = useContext(SessionContext);
  // const [ myInfo, setMyInfo ] = useContext(MyInfoContext);
  const [callState, dispatch] = useReducer(callReducer, initialCallState);
  const forceUpdate = useForceUpdate();
  const { myState } = useContext(MyContext);
  const [ my,setMy] = myState;


  window.updateCall = () => {
    forceUpdate();
  }

  /**
   * Start listening for participant changes, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) return;

    const events = [
      'participant-joined',
      'participant-updated',
      'participant-left',
    ];

   

    function handleNewParticipantsState(e) {
      e && logDailyEvent(e);
      dispatch({
        type: PARTICIPANTS_CHANGE,
        participants: callObject.participants(),
      });
      if(e && e.action!='participant-updated') {
        setSubscriptions(callObject);
        console.log("setting subscriptions because: " + e.action);
          
          let thisUserName = e.participant.user_name;
          let thisSessionID = e.participant.session_id;

          if (e.action=="participant-joined" || e.action=="participant-left") {
            window.event=e;
            updateUserList();
          }

          function updateUserList() {

            const getUserName = setInterval(
              ()=>{
                    if (thisUserName) 
                      {getUserList();
                      clearInterval(getUserName);
                      }
                  },100);

              function getUserList() {
                window.adminPresent=false;
              let ps=callObject.participants(); 
              window.userList=[]; 
              for (const p in ps) {
                let thisUserName = ps[p].user_name;
                let thisSessionId = ps[p].session_id;
                window.userList.push(thisUserName);      //add  each user_name to UserList
                window[thisUserName+'_SessionID'] = thisSessionId;
                if (thisUserName.includes('_Admin') && p!=='local') {
                  window.adminPresent=true;
                }
              }; 
              window.userList.sort();       //alphebetize that list 

              console.log(`now the userList is: ${window.userList}`);  //print userList

              if(typeof(window.updateAdminPanel)!=='undefined') {window.updateAdminPanel()};
              }
              
            }

          

          console.log('Admin present: ' + window.adminPresent);
          console.log('UserList: ' + window.userList);
      }
      
    }

    


    // Use initial state
    handleNewParticipantsState();

    // Listen for changes in state
    for (const event of events) {
      callObject.on(event, handleNewParticipantsState);
      // callObject.on("joined-meeting",()=>{

      //     callObject.setUserName('testName');
      //     console.log(`********Setting my user name as ${'TestName'}`);

      // })
    }

    // Stop listening for changes in state
    return function cleanup() {
      for (const event of events) {
        callObject.off(event, handleNewParticipantsState);
      }
    };
  }, [callObject]);

  /**
   * Start listening for call errors, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) return;

    function handleCameraErrorEvent(event) {
      logDailyEvent(event);
      dispatch({
        type: CAM_OR_MIC_ERROR,
        message:
          (event && event.errorMsg && event.errorMsg.errorMsg) || 'Unknown',
      });
    }

    // We're making an assumption here: there is no camera error when callObject
    // is first assigned.

    callObject.on('camera-error', handleCameraErrorEvent);

    return function cleanup() {
      callObject.off('camera-error', handleCameraErrorEvent);
    };
  }, [callObject]);

  /**
   * Start listening for fatal errors, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) return;

    function handleErrorEvent(e) {
      logDailyEvent(e);
      dispatch({
        type: FATAL_ERROR,
        message: (e && e.errorMsg) || 'Unknown',
      });
    }

    // We're making an assumption here: there is no error when callObject is
    // first assigned.

    callObject.on('error', handleErrorEvent);

    return function cleanup() {
      callObject.off('error', handleErrorEvent);
    };
  }, [callObject]);

  /**
   * Start a timer to show the "click allow" message, when the component mounts.
   */
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch({ type: CLICK_ALLOW_TIMEOUT });
    }, 2500);

    return function cleanup() {
      clearTimeout(t);
    };
  }, []);

  const numberOfSubs = window.currentSubs && window.currentSubs.filter(function (str) {return str.indexOf('_AUDIO') === -1}).filter(function (str) {return str.indexOf('_AUDIO') === -1}).filter(function (str) {return str.indexOf(window.myName) === -1}).length //number of subs, not counting audio-only or my name


  useEffect(()=>{
window.numberOfSubs =numberOfSubs;
  },[numberOfSubs])



 

  function getTiles() {
    let largeTiles = [];
    let smallTiles = [];
    Object.entries(callState.callItems).forEach(([id, callItem]) => {


      const isAudioOnly = () => {
        if(!callItem.audioTrackState || !callItem.videoTrackState) {return}
        return (callItem.audioTrackState.subscribed && !callItem.videoTrackState.subscribed);
      }

      const isLarge =
        isScreenShare(id) ||
        (!isLocal(id) && !containsScreenShare(callState.callItems)) 
        || (isLocal(id) && numberOfSubs && numberOfSubs>1 && !containsScreenShare(callState.callItems))   //videoTrackState()

        
      const tile = (
        <Tile
          key={id}
          videoTrackState={callItem.videoTrackState}
          audioTrackState={callItem.audioTrackState}
          isLocalPerson={isLocal(id)}
          isAudioOnly={isAudioOnly()}
          isLarge={isLarge}
          disableCornerMessage={isScreenShare(id)}
          isScreenShare={isScreenShare(id)}
          // onClick={
          //   isLocal(id)
          //     ? null
          //     : () => {
          //         sendHello(id);
          //       }
          // }
        />
      );
      if (isLarge) {
        largeTiles.push(tile);
      } else {
        smallTiles.push(tile);
      }
    });
    
    return [largeTiles, smallTiles];
  }

  const [largeTiles, smallTiles] = getTiles();

  
  /**
   * DELETE: Attached tiles objects to window for debugging purposes.
   */
  useEffect(() => {
    // console.log('re-rendered');
    // console.log('Userlist: ' + window.userList);
    window.largeTiles = largeTiles;
    window.smallTales = smallTiles;
    window.add = function(n=1) {
      for(let i=0;i<n;i++) {
        callObject.addFakeParticipant()
      }
    };
    
  }); 


   // attach callState to window for debugging
   useEffect(() => {
    window.callState = callState;
  }, [callState]); 


  const message = getMessage(callState);
  return (
    <div className={window.amAdmin ? "call-with-sidebar" : "call"}>
                                      {/* add # of tiles to class name. alternative: {largeTiles.length}*/}
      <div className={`large-tiles count-${(containsScreenShare(callState.callItems)&&'1')||numberOfSubs && numberOfSubs+1}`}>   
        {
          !message
            ? largeTiles
            : null /* Avoid showing large tiles to make room for the message */
        }
      </div>
      <div className="small-tiles">{smallTiles}</div>
      {message && (
        <CallMessage
          header={message.header}
          detail={message.detail}
          isError={message.isError}
        />
      )}
    </div>
  );
}
