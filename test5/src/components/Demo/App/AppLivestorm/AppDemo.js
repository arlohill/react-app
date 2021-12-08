import React, { useEffect, useState, useCallback } from 'react';
import Call from '../Call/Call';
import StartScreen from '../StartScreen/StartScreen';
import api from '../../../../apiDemo';
import './AppDemo.css';
import Tray from '../Tray/Tray';
import CallObjectContext from '../../../../CallObjectContext';
import SessionStateContext from '../../../../SessionStateContext';
import MyContext from '../../../../MyContext'
import { roomUrlFromPageUrl, pageUrlFromRoomUrl } from '../../../../urlUtils';


import Daily from '@daily-co/daily-js';
import { logDailyEvent } from '../../../../logUtils';
import audioPlayer from '../../../../hooks/AudioPlayer';
import AdminPanel from '../AdminPanel/AdminPanel';




const STATE_IDLE = 'STATE_IDLE';
const STATE_CREATING = 'STATE_CREATING';
const STATE_JOINING = 'STATE_JOINING';
const STATE_JOINED = 'STATE_JOINED';
const STATE_LEAVING = 'STATE_LEAVING';
const STATE_ERROR = 'STATE_ERROR';




export default function AppLivestorm(props) {
  const [hideHeader, setHideHeader] = props.headerState;
  const [appState, setAppState] = useState(STATE_IDLE);
  const [roomUrl, setRoomUrl] = useState(null);
  const [callObject, setCallObject] = useState(null);
  const array = ['SB','Prep','Angelina'];  

  const [sessionState, setSessionState] = useState({
                                                    type: 'sessionState',
                                                    isKnown:false,
                                                    isActive:false,
                                                    AdminVisible:false,
                                                    hasAnUpdate: false,
                                                    roleOf: {
                                                              Buyer1: '',
                                                              Buyer2: '',
                                                              Buyer3: '',
                                                              Buyer4: '',
                                                              Seller: '',
                                                              Shadow1: '',
                                                              Shadow2: '',
                                                              Shadow3: '',
                                                              Shadow4: '',
                                                              Shadow5: '',
                                                              Shadow6: '',
                                                            },
                                                    chatHistory:[],
                                                    });


  const [myState, setMyState] = useState({
                                name: 'Username',
                                role: window.myRole,
                                sidebar:true,
                                amAdmin: true,   //LIVESTORM PILOT CHANGE: setting all users to admin — to undo, change to: window.amAdmin
                                userList: {
                                  names:[],
                                  sessionIdFor: {},
                                },
                                adminPresent: false,
                                viewMode: null,
                                audioIsPlaying: false,
                                camOnAtSessionStart: null,
                                micOnAtSessionStart: null,
                                number: null,
                              });

  const setName = (newName) => {
    setMyState(prev=>({
      ...prev,
      name: newName,
    }));
  };

  const setSidebar = (boolean) => {
    setMyState(prev=>({
      ...prev,
      sidebar: boolean,
    }));
  }

  const setViewMode = (newViewMode) => {
    setMyState(prev=>({
      ...prev,
      viewMode:newViewMode,
    }));
  };

  const setRole = (newRole) => {
    setMyState(prev=>({
      ...prev,
      role:newRole,
    }));
  };

  const setUserList = (newUserList) => {
    setMyState(prev=>({
      ...prev,
      userList:newUserList,
    }));
  };

  const setAmAdmin = (boolean) => {
    setMyState(prev=>({
      ...prev,
      amAdmin:boolean,
    }));
  };

  const setAdminPresent = (boolean) => {
    setMyState(prev=>({
      ...prev,
      adminPresent:boolean,
    }));
  };

  const setMicOnAtSessionStart = (boolean) => {
    setMyState(prev=>({
      ...prev,
      micOnAtSessionStart:boolean,
    }));
  };

  const setCamOnAtSessionStart = (boolean) => {
    setMyState(prev=>({
      ...prev,
      camOnAtSessionStart:boolean,
    }));
  };

  const setNumber = (newNum) => {
    setMyState(prev=>({
      ...prev,
      number: newNum,
    }));
  };

  

 //check password

 if (!array.includes(window.myP)) {
  //redirect if password is wrong
  window.location.href = "http://secondbody.co"
}



  
  /**
   * Creates a new call room.
   */
  const createCall = useCallback(() => {
    setAppState(STATE_CREATING);
    setHideHeader(true);
    return api
      .createRoom()
      .then((room) => room)
      .catch((error) => {
        console.log('Error creating room', error);
        setRoomUrl(null);
        setAppState(STATE_IDLE);
      });
  }, []);



  /**
   * Starts joining an existing call.
   *
   * NOTE: In this demo we show how to completely clean up a call with destroy(),
   * which requires creating a new call object before you can join() again.
   * This isn't strictly necessary, but is good practice when you know you'll
   * be done with the call object for a while and you're no longer listening to its
   * events.
   */


  const startJoiningCall = useCallback((url,token) => {

    const join = async() => {
      const newCallObject = Daily.createCallObject({ 
        subscribeToTracksAutomatically: false, 
        url:url,
        token:token,
      });
      setRoomUrl(url);
      setCallObject(newCallObject);
      setAppState(STATE_JOINING); 
      await newCallObject.startCamera();
      await newCallObject.setUserName(myState.name);


      if(window.initialInputs) {
        console.log('initial audio: ' + window.initialInputs[0] + '. Initial video: ' + window.initialInputs[1]);
        newCallObject.join({
                              audioSource: window.initialInputs[0],
                              videoSource:window.initialInputs[1],
                              }); 
   
      } else {
        navigator.mediaDevices.getUserMedia({audio:true,video:true}).then((mediaStream)=>{
          if(mediaStream){
            let localAudio = mediaStream.getAudioTracks();
            let localVideo = mediaStream.getVideoTracks();
            if(localAudio && localAudio.length > 0 && localVideo && localVideo.length > 0)
                {
                  newCallObject.join({ audioSource: localAudio[0], videoSource:localVideo[0]});
                }
          }else{
            //message e.g. you need a mic to join
          }
        })
      }



      console.log('joining the call as ' + myState.name); 
      const pageUrl = pageUrlFromRoomUrl(roomUrl)+'&N='+myState.name+'&R='+myState.role;
     
    }
    
    join();
    
  }, [myState.name]); 



  /**
   * Starts leaving the current call.
   */
  const startLeavingCall = useCallback(() => {
    if (!callObject) return;
    callObject.stopRecording();   // in case meeting is being recorded
    // If we're in the error state, we've already "left", so just clean up
    if (appState === STATE_ERROR) {
      callObject.destroy().then(() => {
        setRoomUrl(null);
        setCallObject(null);
        setAppState(STATE_IDLE);
        window.initialize();
        setHideHeader(false);

      });
    } else {
      setAppState(STATE_LEAVING);
      callObject.leave();
      window.initialize();   
      setHideHeader(false); 
    }
  }, [callObject, appState]);

  /**
   * If a room's already specified in the page's URL when the component mounts,
   * join the room.
   */
  // useEffect(() => {
  //   const url = roomUrlFromPageUrl();
  //   url && window.initialInputs && startJoiningCall(url);
  // }, [startJoiningCall]);

  /**
   * Update the page's URL to reflect the active call when roomUrl changes.
   *
   * This demo uses replaceState rather than pushState in order to avoid a bit
   * of state-management complexity. See the comments around enableCallButtons
   * and enableStartButton for more information.
   */
  useEffect(() => {
    let pageUrl = pageUrlFromRoomUrl(roomUrl);
    window.pageUrl=pageUrl;
    
    // if (myState.name) {
    //   if (pageUrl.indexOf('?') > -1){
    //     pageUrl += '&N=' + myState.name;
    //   }else{
    //     pageUrl += '?N=' + myState.name;
    //   }
    // }

    //append role to URL — LIVESTORM PILOT CHANGE: TOOK THIS OUT
    // if (myState.role) {
    //   if (pageUrl.indexOf('?') > -1){
    //     pageUrl += '&R=' + window.myRole;
    //   }else{
    //     pageUrl += '?R=' + window.myRole;
    //   }
    // }
    
    if (window.myP) {
      if (pageUrl.indexOf('?') > -1){
        pageUrl += '&P=' + window.myP;
      }else{
        pageUrl += '?P=' + window.myP;
      }
    }
    if (pageUrl === window.location.href) return;
    window.history.replaceState(null, null, pageUrl);
  }, [roomUrl]);


  /**
   * Attach call object to window for debugging purposes.
   */
  useEffect(() => {
    window.callObject = callObject;
  }, [callObject]); 

    /**
   * Attach myState object to window for debugging purposes.
   */
     useEffect(() => {
      window.myState = myState;
    }, [myState]); 

     /**
   * Attach userList to window for debugging
   */
  useEffect (()=> {
    window.userList=myState.userList;
  },[myState.userList])

 /**
   * Attach sessionState to window for debugging
   */
  useEffect(()=> {
    window.sessionState=sessionState;
},[sessionState]);

useEffect(()=>{
  if (!callObject) {return;}
  window.record = () => {
    callObject.startRecording();
  }
  window.stop = () => {
    callObject.stopRecording();
  }
},[appState]);



  
//Ask for State when Admin becomes present and State is not known
useEffect(()=>{
  let stateRequest;
  if(!callObject) {return;}
  if(!sessionState.isKnown && myState.adminPresent) {
    stateRequest = setInterval(getState,1000);
    function getState() {
      if (sessionState.isKnown) {
        clearInterval(stateRequest);            
        return;
      }
      callObject.sendAppMessage("State please?", '*'); 
      console.log('Requesting meeting state...');
    }
  }
  //cleanup before useEffect runs the next time
  return function cleanup() {
    stateRequest && clearInterval(stateRequest);
  }

},[sessionState.isKnown,myState.adminPresent]);



 

  /**
   * Update app state based on reported meeting state changes.
   *
   * NOTE: Here we're showing how to completely clean up a call with destroy().
   * This isn't strictly necessary between join()s, but is good practice when
   * you know you'll be done with the call object for a while and you're no
   * longer listening to its events.
   */
  useEffect(() => {
    if (!callObject) return;

    const events = ['joined-meeting', 'left-meeting', 'error'];

    function handleNewMeetingState(event) {
      event && logDailyEvent(event);
      switch (callObject.meetingState()) {
        case 'joined-meeting':
          setAppState(STATE_JOINED);
          callObject.setNetworkTopology({ topology: 'sfu' });
          // window.userList.push(window.myName);
          console.log('*****JOINED MEETING');
          // if(myState.name==""){callObject.leave();}
          break;
        case 'left-meeting':
          callObject.destroy().then(() => {
            setRoomUrl(null);
            setCallObject(null);
            setAppState(STATE_IDLE);
            clearInterval(window.stateRequest);
            window.initialize();
          });
          break;
        case 'error':
          setAppState(STATE_ERROR);
          break;
        default:
          break;
      }
    }

    // Use initial state
    handleNewMeetingState();

    // Listen for changes in state
    for (const event of events) {
      callObject.on(event, handleNewMeetingState);
    }

    // Stop listening for changes in state
    return function cleanup() {
      for (const event of events) {
        callObject.off(event, handleNewMeetingState);
      }
    };
  }, [callObject]);

  /**
   * Listen for app messages from other call participants.
   */
  useEffect(() => {
    if (!callObject) {
      return;
    }

    function handleAppMessage(e) {
      if (e) {
        logDailyEvent(e);
        console.log(`received app message from ${e.fromId}: `, e.data);
      
          //handle sessionState updates
          if (e.data.constructor === Object && e.data.type=="sessionState") {
            let newSessionState = e.data;
            newSessionState.hasAnUpdate = false; //so it won't trigger another sendState() effect
            setSessionState(newSessionState);
                
            }

            //TODO AUDIO TEST
            else if (e.data.constructor === Object && e.data.type=="instructions" && e.data.recipient==callObject.participants().local.session_id) {
              audioPlayer(e.data.target,e.data.action)
            }


            else if (e.data=="State please?") {
              console.log('*******Received state request');
              if (myState.amAdmin && sessionState.isKnown) {
                console.log ("Sending current state...");
                callObject.sendAppMessage(sessionState, '*'); 
              }
            } 
          }
      
      
    } //end handleAppMessage

    callObject.on('app-message', handleAppMessage);

    return function cleanup() {
      callObject.off('app-message', handleAppMessage);
    };
  }, [callObject,sessionState]);


  /**
   * Show the call UI if we're either joining, already joined, or are showing
   * an error.
   */
  const showCall = [STATE_JOINING, STATE_JOINED, STATE_ERROR].includes(
    appState
  );




  return (


    <div className="app">
      <SessionStateContext.Provider 
      value={{session: [sessionState,setSessionState]}}
      >
        <MyContext.Provider 
        value={{
        myStateArray: [myState,setMyState], 
        setName: setName, 
        setRole: setRole, 
        setSidebar: setSidebar,
        setUserList: setUserList,
        setViewMode: setViewMode, 
        setCamOnAtSessionStart: setCamOnAtSessionStart, 
        setMicOnAtSessionStart: setMicOnAtSessionStart,
        setAdminPresent: setAdminPresent,
        setAmAdmin: setAmAdmin,
        setNumber: setNumber,
        }}
        >

        {(showCall) ? (
          // NOTE: for an app this size, it's not obvious that using a Context
          // is the best choice. But for larger apps with deeply-nested components
          // that want to access call object state and bind event listeners to the
          // call object, this can be a helpful pattern.
          <CallObjectContext.Provider value={callObject}>

            <Call roomUrl={roomUrl} />
            <Tray
              onClickLeaveCall={startLeavingCall}
            />
            {myState.amAdmin && 
                (<AdminPanel/>)
            }
          </CallObjectContext.Provider>
        ) : (
         <StartScreen
            // disabled={!enableStartButton}
            onClick={() => {
              createCall().then((room) => startJoiningCall(room.url,room.token));
            }}
          />
         
        )}
        </MyContext.Provider>
      </SessionStateContext.Provider>
    </div>


  );
}