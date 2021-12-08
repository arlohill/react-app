import React, { useEffect, useState, useCallback } from 'react';
import Call from '../Call/Call';
import StartScreen from '../StartScreen/StartScreen';
import api from '../../api';
import './App.css';
import Tray from '../Tray/Tray';
import CallObjectContext from '../../CallObjectContext';
// import MyInfoContext from '../../MyInfoContext';
import SessionContext from '../../SessionContext';
import { roomUrlFromPageUrl, pageUrlFromRoomUrl } from '../../urlUtils';
import DailyIframe from '@daily-co/daily-js';
import { logDailyEvent } from '../../logUtils';
import setSubscriptions from '../../hooks/setSubscriptions';
import { sendState } from '../AdminPanel/AdminFunctions';
import audioPlayer from '../../hooks/AudioPlayer';



const STATE_IDLE = 'STATE_IDLE';
const STATE_CREATING = 'STATE_CREATING';
const STATE_JOINING = 'STATE_JOINING';
const STATE_JOINED = 'STATE_JOINED';
const STATE_LEAVING = 'STATE_LEAVING';
const STATE_ERROR = 'STATE_ERROR';




export default function App() {
  const [appState, setAppState] = useState(STATE_IDLE);
  const [roomUrl, setRoomUrl] = useState(null);
  const [callObject, setCallObject] = useState(null);


  if (!window.pass.includes(window.myP)) {
    //redirect if password is wrong
    window.location.href = "http://secondbody.co"
  }

  window.setViewMode = (viewMode) => {
    viewMode && console.log ('Changing view mode to: ' + viewMode);
    setSubscriptions(callObject,viewMode)
  }


  
  /**
   * Creates a new call room.
   */
  const createCall = useCallback(() => {
    setAppState(STATE_CREATING);
    return api
      .createRoom()
      .then((room) => room.url)
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


/*   
ARLO NOTE:
      Below is where the trouble is. myInfo.name is set via a child component, <StartScreen>, 
      and it successfully changes myInfo.name (I've confirmed since it's pinned to the Window).
      The below works... the first time. But then callObject.participants().local.user_name gets "stuck", 
      so if you exit and leave, or even refresh the page, it never changes. Weird behavior
*/

  const startJoiningCall = useCallback((url) => {
    // if(!initialInputs) {return}
    const newCallObject = DailyIframe.createCallObject({ 
      subscribeToTracksAutomatically: false, 
    });
    setRoomUrl(url);
    setCallObject(newCallObject);
    setAppState(STATE_JOINING);
    if(window.initialInputs) {
      console.log('initial audio: ' + window.initialInputs[0] + '. Initial video: ' + window.initialInputs[1])
    newCallObject.join({ userName:window.myName, url, audioSource: window.initialInputs[0],videoSource:window.initialInputs[1]});  //another way I've tried to do it--is this correct?
    } else {
      navigator.mediaDevices.getUserMedia({audio:true,video:true}).then((mediaStream)=>{
        if(mediaStream){
          let localAudio = mediaStream.getAudioTracks();
          let localVideo = mediaStream.getVideoTracks();
          if(localAudio && localAudio.length > 0 && localVideo && localVideo.length > 0)
              {
                newCallObject.join({ userName:window.myName, url, audioSource: localAudio[0], videoSource:localVideo[0]});
              }
        }else{
          //say something to user, like you don't have any mic or you should allow use mic to this website
        }
      })
    }
    console.log('joining the call as ' + window.myName);  //this sometimes displays myInfo.name, sometimes not
    const pageUrl = pageUrlFromRoomUrl(roomUrl)+'&N='+window.myName+'&R='+window.myRole;
    // let connector = '?';
    // if (pageUrl.includes('?roomUrl=')) {let connector = '&'};
    // if (window.myName) {
    //   if (pageUrl === window.location.href) return;
    //   window.history.replaceState(null, null, pageUrl + connector + "R=" + window.myRole + "&N=" + window.myName);
    // } else if (window.myRole) {
    //   if (pageUrl === window.location.href) return;
    //   window.history.replaceState(null, null, pageUrl + connector + "R=" + window.myRole);
    // } else {
    //   if (pageUrl === window.location.href) return;
    //   window.history.replaceState(null, null, pageUrl);
    // }
  }, []); 



  /**
   * Starts leaving the current call.
   */
  const startLeavingCall = useCallback(() => {
    if (!callObject) return;
    // If we're in the error state, we've already "left", so just clean up
    if (appState === STATE_ERROR) {
      callObject.destroy().then(() => {
        setRoomUrl(null);
        setCallObject(null);
        setAppState(STATE_IDLE);
        window.initialize();
      });
    } else {
      setAppState(STATE_LEAVING);
      callObject.leave();
      window.initialize();    
    }
  }, [callObject, appState]);

  /**
   * If a room's already specified in the page's URL when the component mounts,
   * join the room.
   */
  useEffect(() => {
    const url = roomUrlFromPageUrl();
    url && window.initialInputs && startJoiningCall(url);
  }, [startJoiningCall]);

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
    
    if (window.myName) {
      if (pageUrl.indexOf('?') > -1){
        pageUrl += '&N=' + window.myName;
      }else{
        pageUrl += '?N=' + window.myName;
      }
    }
    if (window.myRole) {
      if (pageUrl.indexOf('?') > -1){
        pageUrl += '&R=' + window.myRole;
      }else{
        pageUrl += '?R=' + window.myRole;
      }
    }
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
   * Uncomment to attach call object to window for debugging purposes.
   */
  useEffect(() => {
    window.callObject = callObject;
  }, [callObject]); // Only re-run the effect if callObject changes

  
 function getState () {
    if (window.sessionState.isKnown == true) {
        clearInterval(window.stateRequest);            
        return;
    }
    // if (window.adminPresent) {
        callObject.sendAppMessage("State please?", '*'); 
        console.log('Requesting meeting state...');
    
}

 

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
          window.userList.push(window.myName);
          if(window.myName==""){callObject.leave();}
          if (window.myRole=="Admin") {
            window.sessionState.isKnown=true;
          } else {
            window.sessionState.isKnown = false;
            window.stateRequest = setInterval(()=>{getState()},2500);
          }

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

          let participants = callObject.participants();
      
          //handle sessionState updates
          if (e.data.constructor === Object && e.data.type=="sessionState") {

            const setSubs = () => {setSubscriptions(callObject)}
                  
            //temporarily commented out
                  // if (e.data.isKnown==false)   //probably redundant. only use received sessionState if isKnown = true
                  //     {return;}
                  // else if (e.data.isKnown==true && typeof(stateRequest)!='undefined') {   //if state is known, stop asking for state
                  //     clearInterval(stateRequest);
                  // }
      
              let priorSessionState = window.sessionState;
              window.sessionState=e.data;
              let needToSetSubs=false;
                
      
                  // change my role if it has been updated in sessionState
                  if (window.sessionState.roleOf!=priorSessionState.roleOf) 
                    {
                      let myNewRole = 'Attendee'; //default, if no role assigned
                      for (const key in window.sessionState.roleOf) {
                          if(window.sessionState.roleOf[key]==window.myName) {
                              myNewRole = key;
                          }
                      }
                      if (myNewRole!=window.myRole) {
                          window.myRole = myNewRole;
                            if (window.myRole.includes('1')) {
                                window.myNumber=1;
                            } else if (window.myRole.includes('2')) {
                                window.myNumber=2;
                            }
                        }
                          if(window.sessionState.isActive){
                              activateSession();  //rebuild UI for the newly assigned role, mid-session
                          } 
                          needToSetSubs=true;
                    }


      
                      //create or delete rooms according to assignments of Thirds
                      // if (window.sessionState.roleOf.Room3A!='') {
                      //     !$("#view-mode option[value=Room3").length>0 && $("#view-mode").append("<option value='Room3'>Room3</option>");
                      //   } else {
                      //     $("#view-mode option[value=Room3").remove();
                      //   }
      
                      // if (window.sessionState.roleOf.Room4A!='') {
                      //     !$("#view-mode option[value=Room4").length>0 && $("#view-mode").append("<option value='Room4'>Room4</option>");
                      //   } else {
                      //     $("#view-mode option[value=Room4").remove();
                      //   }
      
                      // if (window.sessionState.roleOf.Room5A!='') {
                      //     !$("#view-mode option[value=Room5").length>0 && $("#view-mode").append("<option value='Room5'>Room5</option>");
                      //   } else {
                      //     $("#view-mode option[value=Room5").remove();
                      //   }
                      
                  //determine if need to reset subs
                  if (priorSessionState.isActive !== window.sessionState.isActive ||
                      priorSessionState.AdminVisible!==window.sessionState.AdminVisible ) 
                      {
                          needToSetSubs = true;
                      }
      
                  //now, reset subscriptions if necessary
                  if (needToSetSubs) {
                    if (!priorSessionState.isActive && window.sessionState.isActive && window.myRole=='Attendee' || window.myRole=='Admin') {
                      setSubscriptions(callObject,'Room1')
                    }
                    else {
                      setSubs();
                    }
                  }
                  
                  //when session starts
                  if (priorSessionState.isActive == false && window.sessionState.isActive == true) {
                      activateSession();
                      if (window.myRole=='Attendee' || window.myRole=='Admin') {
                        }
                  }
                  //when session is paused
                  else if (priorSessionState.isActive == true && window.sessionState.isActive == false) {
                      pauseSession();
                      window.setViewMode(null);
                  } 
            }

            else if (e.data.constructor === Object && e.data.type=="instructions" && e.data.recipient==callObject.participants().local.session_id) {
              audioPlayer(e.data.target,e.data.action)
            }


            else if (e.data=="State please?") {
              if (window.amAdmin) {
                sendState(window.sessionState,callObject);
              }
            } 
          }
          //not used in this module, since there's no timer
          
          // if none of the above, just overlay the message
          // else if (e.data.constructor !== Object) {    
          //     overlayMessage(e.data,10000);
          // }

          async function activateSession() {
            switch (window.myRole) {
                case 'Attendee':
                    // $("#cam-instructions").fadeOut(500);
                    // $("#cam-image").fadeOut(500);
                    // $("#mic-instructions").fadeOut(500);
                    // $("#mic-image").fadeOut(500);
                    // $('#show-qr-code').fadeOut(500);
                    // $('#get-prompt').fadeOut(500);
                    // document.getElementById('my-view').style.visibility='visible';
                    // $('#my-view').fadeIn(500);
                    window.camWasOn = callObject.localVideo();
                    if (window.camWasOn) {
                        // toggleCam()
                    }
                    // $('#view-mode').val('Room1').trigger("change");
                    // document.getElementById("overlay").className = "superimposed-text-attendees";
                    // document.getElementById("overlay-text").className = "overlay-text-attendees";
                    break;
        
                case 'Participant1':
                case 'Participant2':
                    // $("#cam-instructions").fadeIn(500);
                    // $("#cam-image").fadeIn(500);
                    // $("#mic-instructions").fadeIn(500);
                    // $("#mic-image").fadeIn(500);
                    // $('#show-qr-code').fadeOut(500);
                    // $('#get-prompt').fadeIn(500);
                    // $('#my-view').fadeOut(500);
                    // document.getElementById('my-view').style.visibility='hidden';
                    // document.getElementById("overlay").className = "superimposed-text";
                    // document.getElementById("overlay-text").className = "overlay-text";
                    // displayName();
                    // closeChat();
                    break;
        
                case 'Actor1':
                case 'Actor2':
                case 'Room3A':
                case 'Room3B':
                case 'Room4A':
                case 'Room4B':
                case 'Room5A':
                case 'Room5B':
                    // $("#cam-instructions").fadeIn(500);
                    // $("#cam-image").fadeIn(500);
                    // $("#mic-instructions").fadeIn(500);
                    // $("#mic-image").fadeIn(500);
                    // $('#show-qr-code').fadeIn(500);
                    // $('#get-prompt').fadeOut(500);
                    // $('#my-view').fadeOut(500);
                    // document.getElementById('my-view').style.visibility='hidden';
                    // document.getElementById("overlay").className = "superimposed-text";
                    // document.getElementById("overlay-text").className = "overlay-text";
                    // displayName();
                    // closeChat();
                    break;
                
                default:
                    break;
            }
        }
          
          async function pauseSession() {
            // $("#cam-instructions").fadeIn(500);
            // $("#cam-image").fadeIn(500);
            // $("#mic-instructions").fadeIn(500);
            // $("#mic-image").fadeIn(500);
            // $('#show-qr-code').fadeIn(500);
            // $('#get-prompt').fadeOut(500);
            // document.getElementById('get-prompt').style.visibility='hidden';
            // $('#my-view').fadeOut(500);
            // if (window.camWasOn && !callObject.localVideo()) {toggleCam()}; // turn back on cam if it was noted as on before session
          }


      
    } //end handleAppMessage

    callObject.on('app-message', handleAppMessage);

    return function cleanup() {
      callObject.off('app-message', handleAppMessage);
    };
  }, [callObject]);

  /**
   * Show the call UI if we're either joining, already joined, or are showing
   * an error.
   */
  const showCall = [STATE_JOINING, STATE_JOINED, STATE_ERROR].includes(
    appState
  );

  /**
   * Only enable the call buttons (camera toggle, leave call, etc.) if we're joined
   * or if we've errored out.
   *
   * !!!
   * IMPORTANT: calling callObject.destroy() *before* we get the "joined-meeting"
   * can result in unexpected behavior. Disabling the leave call button
   * until then avoids this scenario.
   * !!!
   */
  const enableCallButtons = [STATE_JOINED, STATE_ERROR].includes(appState);

  /**
   * Only enable the start button if we're in an idle state (i.e. not creating,
   * joining, etc.).
   *
   * !!!
   * IMPORTANT: only one call object is meant to be used at a time. Creating a
   * new call object with DailyIframe.createCallObject() *before* your previous
   * callObject.destroy() completely finishes can result in unexpected behavior.
   * Disabling the start button until then avoids that scenario.
   * !!!
   */
  const enableStartButton = appState === STATE_IDLE;

  return (
    //  <SessionContext.Provider value={[sessionState,setSessionState]}>

      /* <MyInfoContext.Provider value={[myInfo,setMyInfo]}> */


    <div className="app">
    
      {(showCall) ? (
        // NOTE: for an app this size, it's not obvious that using a Context
        // is the best choice. But for larger apps with deeply-nested components
        // that want to access call object state and bind event listeners to the
        // call object, this can be a helpful pattern.
        <CallObjectContext.Provider value={callObject}>
          <Call roomUrl={roomUrl} />
          <Tray
            disabled={!enableCallButtons}
            onClickLeaveCall={startLeavingCall}
          />
        </CallObjectContext.Provider>
      ) : (
        <StartScreen
          // disabled={!enableStartButton}
          onClick={() => {
            createCall().then((url) => startJoiningCall(url));
          }}
        />
      )}
    </div>
    /* </MyInfoContext.Provider> */
    // </SessionContext.Provider>

  );
}
