import React, { useContext, useEffect, useRef, useState } from 'react';
import './Tray.css';
import TrayButton, {
  TYPE_MUTE_CAMERA,
  TYPE_MUTE_MIC,
  TYPE_SCREEN,
  TYPE_LEAVE,
  TYPE_CHAT,
} from '../TrayButton/TrayButton';
import recordButton from './record.svg'
import recordingButton from './recording.svg'
import InputSelector from '../InputSelector/InputSelector';
import Chat from '../Chat/Chat';
import CallObjectContext from '../../../CallObjectContext';
import { logDailyEvent } from '../../../logUtils';
import DailyIframe from '@daily-co/daily-js';
import MyContext from '../../../MyContext';
import SessionStateContext from '../../../SessionStateContext';
function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
}

/**
 * Gets [isCameraMuted, isMicMuted, isSharingScreen].
 * This function is declared outside Tray() so it's not recreated every render
 * (which would require us to declare it as a useEffect dependency).
 */
function getStreamStates(callObject) {
  let isCameraMuted,
    isMicMuted,
    isSharingScreen,
    isRecording = false;
  if (
    callObject &&
    callObject.participants() &&
    callObject.participants().local
  ) {
    const localParticipant = callObject.participants().local;
    isCameraMuted = !localParticipant.video;
    isMicMuted = !localParticipant.audio;
    isSharingScreen = localParticipant.screen;
    isRecording =  localParticipant.record;

  }
  return [isCameraMuted, isMicMuted, isSharingScreen, isRecording];
}


/**
 * Props:
 * - onClickLeaveCall: () => ()
 * - disabled: boolean
 */
export default function Tray(props) {
  const callObject = useContext(CallObjectContext);
  const { session } = useContext(SessionStateContext);
  const [ sessionState,setSessionState] = session;
  const { myStateArray, 
    setName, 
    setRole,
    setUserList,
    setViewMode,
    setCamOnAtSessionStart,
    setMicOnAtSessionStart,
    setAmAdmin, 
  } = useContext(MyContext);
const [ myState,setMyState ] = myStateArray;
  const [isCameraMuted, setCameraMuted] = useState(false);
  const [isMicMuted, setMicMuted] = useState(false);
  const [isSharingScreen, setSharingScreen] = useState(false);
  const [isRecording, setRecording] = useState(false);
  const [displayChat, setChatDisplay] = useState(false);
  const [highlightedChat, setChatHighlight] = useState(false);
  const forceUpdate = useForceUpdate();
  const micCaret = React.createRef();
  const micSettings = React.createRef();
  const camCaret = React.createRef();
  const camSettings = React.createRef();
  const recordingToggle = React.createRef();

  

  window.updateTray = () => {
    forceUpdate();
  }

  const [showMicSettings,setShowMicSettings] = useState(false);
  const [showCamSettings,setShowCamSettings] = useState(false);


  function toggleCamera() {
    callObject.setLocalVideo(isCameraMuted);
  }

  function toggleMic() {
    callObject.setLocalAudio(isMicMuted);
  }

  function screenAlreadyShared() {
    let screenShareExists = false;
    let ps = callObject.participants();
    for (const p in ps) {
      if(!!ps[p].screenVideoTrack) {screenShareExists=true};
    }
    return screenShareExists;
  }
  


  useEffect(()=> {

    document.addEventListener("mousedown", handleClickOutside);


 return function cleanup() {
    document.removeEventListener("mousedown", handleClickOutside);
    };
  })

  const handleClickOutside = (event) => {
    console.log('handling click');
    if (micSettings.current &&
      !micSettings.current.contains(event.target) &&
      !micCaret.current.contains(event.target)
    ) {
      setShowMicSettings(false);
    } else if (camSettings.current &&
      !camSettings.current.contains(event.target) &&
      !camCaret.current.contains(event.target)
    ) {
      setShowCamSettings(false);
    } 
    
  }

  function toggleSharingScreen() {
    if(!isSharingScreen && screenAlreadyShared()) {
      alert(`There is already a screenshare in progress`);
      return;
    }
    isSharingScreen
      ? callObject.stopScreenShare()
      : callObject.startScreenShare();
  }

    

  function leaveCall() {
    props.onClickLeaveCall && props.onClickLeaveCall();
  }


  function toggleRecording() {
    recordingToggle.current.src = isRecording ? recordButton : recordingButton;
    isRecording 
      ? callObject.stopRecording() 
      : callObject.startRecording();
  }

  function toggleChat() {
    setChatDisplay(!displayChat);
    if (highlightedChat) {
      setChatHighlight(!highlightedChat);
    }
  }

  function handleNewChat() {
    setChatHighlight(!highlightedChat);
  }

  // function openScreenShareWindow () {
  //   window.open("http://" + window.location.host + "/share","test","width=300, height=300");
  // }


   /**
   * Start listening for changes on sessionState, to turn cam + mic on and off
  //  */
  useEffect(()=> {
   if (sessionState.isActive) {
      if (!myState.role.includes('Shadow') && !myState.role.includes('Seller') && !myState.role.includes('Buyer')) {
        setMicOnAtSessionStart(callObject.localAudio());   //"remember" if cam + mic were on or off before session started
        setCamOnAtSessionStart(callObject.localVideo());
        callObject.setLocalAudio(false);
        callObject.setLocalVideo(false);
      }
   } else if (!sessionState.isActive) {
        !callObject.localAudio() && callObject.setLocalAudio(myState.micOnAtSessionStart);
        !callObject.localVideo() && callObject.setLocalVideo(myState.camOnAtSessionStart);
        setMicOnAtSessionStart(null);
        setCamOnAtSessionStart(null);
   }

  },[sessionState.isActive,myState.role]);

    /**
   * Turn mic on and off when 
  //  */

  /**
   * Start listening for participant changes when callObject is set (i.e. when the component mounts).
   * This event will capture any changes to your audio/video mute state.
   */
  useEffect(() => {
    if (!callObject) return;

    function handleNewParticipantsState(event) {
      event && logDailyEvent(event);
      const [isCameraMuted, isMicMuted, isSharingScreen, isRecording] = getStreamStates(
        callObject
      );
      setCameraMuted(isCameraMuted);
      setMicMuted(isMicMuted);
      setSharingScreen(isSharingScreen);
      setRecording(isRecording);
    }

    // Use initial state
    handleNewParticipantsState();

    // Listen for changes in state
    callObject.on('participant-updated', handleNewParticipantsState);

    // Stop listening for changes in state
    return function cleanup() {
      callObject.off('participant-updated', handleNewParticipantsState);
    };
  }, [callObject]);



  return (
    <div className={myState.amAdmin && myState.sidebar ? "tray-with-sidebar" : "tray"}>

      <TrayButton
        type={TYPE_MUTE_CAMERA}
        // disabled={props.camDisabled}
        highlighted={isCameraMuted}
        onClick={toggleCamera}
      />
      
      {/* {!props.camDisabled && */}
      <div onClick={()=>{setShowCamSettings(!showCamSettings)}}  style={{position:'absolute',left:'57px', bottom:'23px'}}>
        <p className="caret" ref={camCaret}>^</p>
                {showCamSettings ? 
                (<InputSelector type='video' page='main' ref={camSettings}/>)
                : 
                null}
      </div>
      {/* } */}
      
      <TrayButton
        type={TYPE_MUTE_MIC}
        // disabled={props.micDisabled}
        highlighted={isMicMuted}
        onClick={toggleMic}
      />
      {/* {!props.micDisabled && */}
        <div onClick={()=>{setShowMicSettings(!showMicSettings)}}  style={{position:'absolute',left:'123px', bottom:'23px'}}>
        

        <p className="caret" ref={micCaret}>^</p>
                {showMicSettings ? 
                (<InputSelector type='audio' page='main' ref={micSettings}/>)
                : 
                null}
                
        </div>
      {/* } */}

      {DailyIframe.supportedBrowser().supportsScreenShare && myState.amAdmin && (
        <TrayButton
          type={TYPE_SCREEN}
          // disabled={props.disabled}
          highlighted={isSharingScreen}
          // onClick={openScreenShareWindow} //LIVESTORM PILOT CHANGE: deleted video share
          onClick={toggleSharingScreen}      //LIVESTORM PILOT CHANGE: added normal screenshare
        />
      )}
      <TrayButton
        type={TYPE_CHAT}
        // disabled={props.disabled}
        highlighted={highlightedChat}
        onClick={toggleChat}
      />
      <Chat onClickDisplay={displayChat} notification={handleNewChat} />
      
        



      {/* Display room status and either my role or room selector +  */}
          <div className='status-display'>

            <div style={{height:'30px'}}>
               Roleplay:  &nbsp;            
                            {sessionState.isActive ? 
                              <div className='display-card active'>Live</div>
                              :
                              <div className='display-card paused'>Paused</div>
                            }
              </div>

            <div className='vertical-line'></div>

            {/* if session is paused or I have a role, display my role, otherwise show room selector */}
            {!sessionState.isActive || (myState.role!=='Admin' && myState.role!=='Attendee')
            
                ?   ( <div style={{height:'30px'}}>
                            My Role: &nbsp;
                            {myState.role=='Admin' || myState.role=='Attendee' 

                            ? <span className='display-card role'> 
                                Viewer
                              </span>
                            : <span className='display-card role'> 
                                {myState.role.match(/\D/g).join('')} 
                              </span>
                            
                            }
                       </div>
                    )
            : ( <div className='my-view'>
                        My View: &nbsp;
                            <span > 
                              <form action = ''>
                                <fieldset style={{border:'none'}}>
                                    <select className='my-view-selector' value={myState.viewMode} onChange = {(e)=>setViewMode(e.target.value)}>
                                        <option value = 'Seller'>Seller</option>
                                        {sessionState.roleOf.Shadow1 && <option value = 'Shadow1' selected>Shadow 1</option>}
                                        {sessionState.roleOf.Shadow2 && <option value = 'Shadow2'>Shadow 2</option>}
                                        {sessionState.roleOf.Shadow3 && <option value = 'Shadow3'>Shadow 3</option>}
                                        {sessionState.roleOf.Shadow4 && <option value = 'Shadow4'>Shadow 4</option>}
                                        {sessionState.roleOf.Shadow5 && <option value = 'Shadow5'>Shadow 5</option>}
                                        {sessionState.roleOf.Shadow6 && <option value = 'Shadow6'>Shadow 6</option>}
                                        {sessionState.roleOf.Seller && sessionState.roleOf.Shadow1 && <option value = 'All'>All</option>}
                                        {sessionState.roleOf.Shadow1 ||
                                          sessionState.roleOf.Shadow2 ||
                                          sessionState.roleOf.Shadow3 ||
                                          sessionState.roleOf.Shadow4 ||
                                          sessionState.roleOf.Shadow5 ||
                                          sessionState.roleOf.Shadow6 &&
                                          <option value = 'All'>All</option>}
                                    </select>
                                </fieldset>
                              </form>
                            </span>
                  </div>
              )
            
              
            }
                            
          
             


          </div>

          {/* <img 
          ref={recordingToggle}
          src={recordButton}
          onClick={toggleRecording}
          width={55}
          height={37}
          className='recording-button'
          /> */}

            <TrayButton
              type={TYPE_LEAVE}
              disabled={props.disabled}
              newButtonGroup={true}
              highlighted={true}
              onClick={leaveCall}
            />

      
    </div>
  );
}
