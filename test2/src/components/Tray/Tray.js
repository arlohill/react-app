import React, { useContext, useEffect, useState } from 'react';
import './Tray.css';
import TrayButton, {
  TYPE_MUTE_CAMERA,
  TYPE_MUTE_MIC,
  TYPE_SCREEN,
  TYPE_LEAVE,
  TYPE_CHAT,
} from '../TrayButton/TrayButton';
import InputSelector from '../InputSelector/InputSelector';
import Chat from '../Chat/Chat';
import AdminPanel from '../AdminPanel/AdminPanel';
import CallObjectContext from '../../CallObjectContext';
import { logDailyEvent } from '../../logUtils';
import DailyIframe from '@daily-co/daily-js';
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
    isSharingScreen = false;
  if (
    callObject &&
    callObject.participants() &&
    callObject.participants().local
  ) {
    const localParticipant = callObject.participants().local;
    isCameraMuted = !localParticipant.video;
    isMicMuted = !localParticipant.audio;
    isSharingScreen = localParticipant.screen;
  }
  return [isCameraMuted, isMicMuted, isSharingScreen];
}

/**
 * Props:
 * - onClickLeaveCall: () => ()
 * - disabled: boolean
 */
export default function Tray(props) {
  const callObject = useContext(CallObjectContext);
  const [isCameraMuted, setCameraMuted] = useState(false);
  const [isMicMuted, setMicMuted] = useState(false);
  const [isSharingScreen, setSharingScreen] = useState(false);
  const [displayChat, setChatDisplay] = useState(false);
  const [highlightedChat, setChatHighlight] = useState(false);
  const forceUpdate = useForceUpdate();
  const micCaret = React.createRef();
  const micSettings = React.createRef();
  const camCaret = React.createRef();
  const camSettings = React.createRef();

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

  // function toggleSharingScreen() {

    
  //   isSharingScreen
  //     ? callObject.stopScreenShare()
  //     : navigator.mediaDevices.getDisplayMedia({
  //       video: true,
  //       audio: true,
  //     }).then((stream)=>callObject.startScreenShare({
  //       mediaStream:stream}))
  //       // share getDisplayMedia stream
  //       // mediaStream: window.screenStream,

  //       // share getDisplayMedia audio track only
        
  //       // mediaStream: window.screenStream,

  //       // share local cam via screen stream
  //       // mediaStream: window.localCam,

  //       // share only audio from local cam via screen stream
  //       // mediaStream: new MediaStream(window.localCam.getAudioTracks()),
  //     // });
  // }

  function leaveCall() {
    props.onClickLeaveCall && props.onClickLeaveCall();
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

  function openScreenShareWindow () {
    window.open("http://" + window.location.host + "/share","test","width=300, height=300");

  }



  /**
   * Start listening for participant changes when callObject is set (i.e. when the component mounts).
   * This event will capture any changes to your audio/video mute state.
   */
  useEffect(() => {
    if (!callObject) return;

    function handleNewParticipantsState(event) {
      event && logDailyEvent(event);
      const [isCameraMuted, isMicMuted, isSharingScreen] = getStreamStates(
        callObject
      );
      setCameraMuted(isCameraMuted);
      setMicMuted(isMicMuted);
      setSharingScreen(isSharingScreen);
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
    <div className="tray">
      <TrayButton
        type={TYPE_MUTE_CAMERA}
        // disabled={props.disabled}
        highlighted={isCameraMuted}
        onClick={toggleCamera}
      />
      
      <div onClick={()=>{setShowCamSettings(!showCamSettings)}}  style={{position:'absolute',left:'55px', bottom:'23px',}}>
        <p className="caret" ref={camCaret}>^</p>
                {showCamSettings ? 
                (<InputSelector type='video' page='main' ref={camSettings}/>)
                : 
                null}
      </div>
      
      <TrayButton
        type={TYPE_MUTE_MIC}
        // disabled={props.disabled}
        highlighted={isMicMuted}
        onClick={toggleMic}
      />
      <div onClick={()=>{setShowMicSettings(!showMicSettings)}}  style={{position:'absolute',left:'125px', bottom:'23px'}}>
      {/* <img src={Caret} style={{position:'absolute',left:'52px', bottom:'42px', height:'18px',fontSize:'15px'}} /> */}
      
      <p className="caret" ref={micCaret}>^</p>
              {showMicSettings ? 
              (<InputSelector type='audio' page='main' ref={micSettings}/>)
              : 
              null}
              
      </div>
      {DailyIframe.supportedBrowser().supportsScreenShare && window.amAdmin && (
        <TrayButton
          type={TYPE_SCREEN}
          // disabled={props.disabled}
          highlighted={isSharingScreen}
          onClick={openScreenShareWindow}
          // onClick={toggleSharingScreen}
        />
      )}
      <TrayButton
        type={TYPE_CHAT}
        // disabled={props.disabled}
        highlighted={highlightedChat}
        onClick={toggleChat}
      />
      <Chat onClickDisplay={displayChat} notification={handleNewChat} />
      
      {window.amAdmin && (
        <AdminPanel
      />
      )}

      {/* <!-- Control who you see during a session --> */}
      {window.sessionState && window.sessionState.isActive && (window.myRole=='Attendee' || window.myRole=='Admin') && (
        <div style={{zIndex:'999', height:'80px',bottom:'10px',overflow:'hidden',visibility:'visible', flexGrow:'1', textAlign: 'center', position:'absolute', left:'50%', transform:'translateX(-50%)'}} id='my-view'>
          <form action = ''>
              <fieldset style={{border:'none'}}>
              <select id = 'view-mode' onChange = {(e)=>window.setViewMode(e.target.value)} style={{outline:'none', position: 'relative', borderRadius: '20px', height:'30px', width:'100px', bottom:'-22px', cursor:'pointer', backgroundColor: '#2196F3', color:'white'}}>
              <option value = 'Room1'>Room1</option>
              <option value = 'Room2'>Room2</option>
              <option value = 'All'>All</option>
              {/* <option value = 'Actors'>Actors</option>
              <option value = 'Participants'>Participants</option>
              <option value = '1s'>Both 1s</option>
              <option value = '2s'>Both 2s</option>
              <option value = 'None'>None</option> */}
              </select>
              </fieldset>
              </form>
              <p style={{position:'relative', bottom: '3px'}}>My view</p>
      </div>
      )}
      

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
