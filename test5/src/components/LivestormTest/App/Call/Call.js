import React, { useEffect, useContext, useReducer, useCallback, useState } from 'react';
import './Call.css';
import { GrMenu } from "react-icons/gr";
import { IoCloseSharp } from "react-icons/io5";



import Tile from '../Tile/Tile';
import CallObjectContext from '../../../../CallObjectContext';
import MyContext from '../../../../MyContext';
import SessionStateContext from '../../../../SessionStateContext';
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
import { logDailyEvent } from '../../../../logUtils';
import useSetSubscriptions from '../../../../hooks/setSubscriptions';
function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
}

export default function Call() {
  useSetSubscriptions();

  const callObject = useContext(CallObjectContext);
  const { session } = useContext(SessionStateContext);
  const [ sessionState,setSessionState] = session;
  const [callState, dispatch] = useReducer(callReducer, initialCallState);
  const forceUpdate = useForceUpdate();
  const { myStateArray, 
          setRole,
          setSidebar,
          setUserList,
          setViewMode,
          setCamOnAtSessionStart,
          setMicOnAtSessionStart,
          setAdminPresent,
          setNumber,
        } = useContext(MyContext);
  const [ myState ] = myStateArray;

  const toggleSidebar = ()=>setSidebar(!myState.sidebar);

  window.toggleSidebar = toggleSidebar;



 





 /**
   * Set default viewmode and turn cam on/off when session begins or my role changes
   */
  useEffect(()=> {


    if (sessionState.isActive) {

        switch (myState.role) {
          case 'Attendee':
          case 'Admin':
              //reset to default viewMode
              if (sessionState.roleOf.Shadow1)
              {setViewMode('Shadow1');}
              else if (sessionState.roleOf.Shadow2)    //fallbacks in case shadow1 is not assigned
                {setViewMode('Shadow2');}
              else if (sessionState.roleOf.Shadow3)
                {setViewMode('Shadow3');}
              else if (sessionState.roleOf.Shadow4)
                {setViewMode('Shadow4');}
              else if (sessionState.roleOf.Shadow5)
              {setViewMode('Shadow5');}
              else if (sessionState.roleOf.Shadow6)
              {setViewMode('Shadow6');}
              else
                {setViewMode('Seller');}
              
              //when session starts up, "remember" if cam + mic were on or off
              if(myState.camOnAtSessionStart && myState.camOnAtSessionStart===null) {
                setMicOnAtSessionStart(callObject.localAudio());
                setCamOnAtSessionStart(callObject.localVideo());
              }
              //and turn off cam and mic 
              callObject.setLocalAudio(false);
              callObject.setLocalVideo(false);
              break;
          case 'Seller':
          case 'Buyer1':
          case 'Buyer2':
          case 'Buyer3':
          case 'Buyer4' :
          case 'Shadow1':
          case 'Shadow2':
          case 'Shadow3':
          case 'Shadow4':
          case 'Shadow5':
          case 'Shadow6':
            //when session starts, "remember" if cam + mic were on or off
            if(myState.camOnAtSessionStart===null) {
              setMicOnAtSessionStart(callObject.localAudio());
              setCamOnAtSessionStart(callObject.localVideo());
            }
            //turn on cam and mic
            callObject.setLocalAudio(true);
            callObject.setLocalVideo(true);
        }
    }

    else if (!sessionState.isActive) {
      !callObject.localAudio() && callObject.setLocalAudio(myState.micOnAtSessionStart);
      !callObject.localVideo() && callObject.setLocalVideo(myState.camOnAtSessionStart);
      setMicOnAtSessionStart(null);
      setCamOnAtSessionStart(null);
    }

  },[sessionState.isActive,myState.role]);


   /**
   * Update my role according to sessionState changes
   */
   useEffect(()=> {
    let myNewRole = 'Attendee'; //default, if no role assigned
    for (const key in sessionState.roleOf) {
        if(sessionState.roleOf[key]==myState.name) {
            myNewRole = key;
        }
    }
    if (myNewRole!==myState.role) {
        setRole(myNewRole);
          if (myNewRole.includes('1')) {
              setNumber(1);
          } else if (myNewRole.includes('2')) {
              setNumber(2);
          }
      }
   },[sessionState.roleOf])
      

   const getUserList = useCallback(()=>{

      return new Promise((resolve)=>{
  
          console.log('*****UPDATING PARTICIPANT LIST******');
          let userListIncludesAdmin=false;   //default
          let ps=callObject.participants(); 
          let workingUserList = {
              names: [myState.name],
              sessionIdFor: {},
          }
      
          for (const p in ps) {
              if (p!=='local') {
                  let thisUserName = ps[p].user_name;
                  let thisSessionId = ps[p].session_id;
                  workingUserList.names.push(thisUserName);      //add each user_name with its sessionID to UserList
                  workingUserList.sessionIdFor[thisUserName] = thisSessionId;
                  console.log('***ADDING: ' + thisUserName);
                  if (thisUserName.includes('_Admin')) {
                      userListIncludesAdmin = true;
                  } 
              };
          };
      
          userListIncludesAdmin ? console.log('Admin IS present') : console.log('Admin IS NOT present');
          workingUserList.names.sort();       //alphebetize that list 
          console.log(`here's the userList: ${workingUserList.names}`);
          resolve([workingUserList,userListIncludesAdmin]);
      });

   },[callObject,myState]);


const checkIfAdminPresent = useCallback(()=> {

    return new Promise((resolve) => {
      let adminAlreadyPresent = false;
      let ps=callObject.participants();
      const lookForMoreParticipants = setInterval (()=>{  //This interval should be redundant, but checking to make sure a dummy user doesn't pop up first
        if  (Object.keys(ps).length > 1
              || (Object.keys(ps).length <= 1 && ps.local.user_name == myState.name)  
        ) {
              clearInterval(lookForMoreParticipants);
              for (const p in ps) {
                let thisUserName = ps[p].user_name;
                if (thisUserName.includes('_Admin') && p!=='local') {
                  adminAlreadyPresent = true;
                }
                console.log(`Participant present: ${thisUserName}`);
              }
              resolve (adminAlreadyPresent);
        } else {return;}
      },500)
    })
  },[callObject,myState]);

  


  /**
   * Start listening for participant changes, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) return;

   


  ///END TEMP//////

    const events = [
      'participant-joined',
      'participant-updated',
      'participant-left',
      'joined-meeting',
    ];

   

    function handleNewParticipantsState(e) {
      e && logDailyEvent(e);
      dispatch({
        type: PARTICIPANTS_CHANGE,
        participants: callObject.participants(),
      });

      if(e && e.action!='participant-updated') {

          window.updated=e;
          
          if (e.action=="participant-joined" || e.action=="participant-left") {
            window.event=e;
            
            setTimeout(update,50);  //wait is necessary to avoid 'dummy' userName

            function update() {
              getUserList()
              .then(([workingUserList,userListIncludesAdmin])=>{
                  setUserList(workingUserList);
                  setAdminPresent(userListIncludesAdmin);
                  // if (sessionState.isKnown === null) {
                  //   if(myState.amAdmin) {   //determine if there's a prior session state
                  //     setSessionState((prev)=>({
                  //       ...prev,
                  //       isKnown: userListIncludesAdmin ? false : true,   //if an admin is already present, make joining admin request a state update
                  //     }));

                  //     let isKnown = userListIncludesAdmin ? false : true;
                  //     console.log('just set IS KNOWN to: ' + isKnown);
                  //   }
                  // } else {      //for non-admins
                  //   setSessionState((prev)=>({
                  //     ...prev,
                  //     isKnown: false,
                  //   }));
                  // }
                });
            }
           

          } else if(e.action=='joined-meeting') {
            console.log('*****I JOINED THE MEETING');
            getUserList()
                .then(([workingUserList,userListIncludesAdmin])=>{
                  setUserList(workingUserList);
                  if(myState.amAdmin && !userListIncludesAdmin) {
                    checkIfAdminPresent().then((adminAlreadyPresent)=>{
                      setSessionState((prev)=>({
                        ...prev,
                        isKnown: adminAlreadyPresent ? false : true,   //if an admin is already present, make joining admin request a state update
                      }));
                    })
                  }

              });
          }        
      } 
    }

    // Use initial state
    handleNewParticipantsState();

    // Listen for changes in state
    for (const event of events) {
      callObject.on(event, handleNewParticipantsState);
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

  ///todo: fix this
  // const numberOfSubs = window.currentSubs && window.currentSubs.filter(function (str) {return str.indexOf('_AUDIO') === -1}).filter(function (str) {return str.indexOf('_AUDIO') === -1}).filter(function (str) {return str.indexOf(window.myName) === -1}).length //number of subs, not counting audio-only or my name


//   useEffect(()=>{
// window.numberOfSubs =numberOfSubs;
// console.log('*****NUMBER OF SUBS:'+numberOfSubs);
//   },[numberOfSubs])



 

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
        || (isLocal(id) && window.numberOfSubs && window.numberOfSubs>1 && !containsScreenShare(callState.callItems))   //videoTrackState()

        
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

          <div className={myState.amAdmin && myState.sidebar ? "call-with-sidebar" : "call"}>

          {myState.amAdmin && 
          (
            <div className='sidebar-toggle' onClick={toggleSidebar}>
            {myState.sidebar ? <IoCloseSharp size='25px'/>:<GrMenu size='19px' style={{marginTop:'3px'}}/>}
            </div>
          )}
          

                                            {/* add # of tiles to class name. alternative: {largeTiles.length}*/}
            <div className={`large-tiles ${containsScreenShare(callState.callItems)? 'screenshare': ''} ${containsScreenShare(callState.callItems)&&myState.sidebar ? 'with-sidebar':''} count-${(containsScreenShare(callState.callItems)&&'1')||window.numberOfSubs && window.numberOfSubs+1}`}>   
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
