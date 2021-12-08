import React, { useContext, useEffect, useState } from 'react';
import CallObjectContext from '../../CallObjectContext';
import { logDailyEvent } from '../../logUtils';
import './AdminPanel.css';
import setSubscriptions from '../../hooks/setSubscriptions';
import audioPlayer from '../../hooks/AudioPlayer';
import RoleSelector from '../RoleSelector/RoleSelector';
import RoleContainer from '../RoleContainer/RoleContainer';
import SessionStateContext from '../../SessionStateContext';

// import { sendState } from '../AdminPanel/AdminFunctions'
// import SessionContext from '../../SessionContext';



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
export default function AdminPanel(props) {
  const callObject = useContext(CallObjectContext);
  // const [sessionState, setSessionState ] = useContext(SessionContext);
  const [isCameraMuted, setCameraMuted] = useState(false);
  const [isMicMuted, setMicMuted] = useState(false);
  const [isSharingScreen, setSharingScreen] = useState(false);
  const [displayChat, setChatDisplay] = useState(false);
  const [highlightedChat, setChatHighlight] = useState(false);
  const { session } = useContext(SessionStateContext);
  const [ sessionState,setSessionState] = session;
  const setSubs = () => {setSubscriptions(callObject)};  
  const forceUpdate = useForceUpdate();
  window.updateAdminPanel=forceUpdate;
  const [playButtonText, setPlayButtonText] = useState('Play');
  const [targetRecording, setTargetRecording] = useState('monologue1') ///////HAVE TO CHANGE THIS IN TWO PLACES
  const training = React.createRef();
  const trainingToggle = React.createRef();

  useEffect(() => {           //listen for participants leaving or joining and update component
    if (!callObject) return;

    const events = [
      'participant-joined',
      'participant-left',
      'joined-meeting',
    ];

    for (const event of events) {
      callObject.on(event, () => setTimeout(()=>forceUpdate(),100));
    }

    return function cleanup() {
      for (const event of events) {
        callObject.off(event, () => setTimeout(()=>forceUpdate(),100));
      }
    };

  }, [callObject]);



const sendState = () => {
    console.log ("Sending current state...");
    callObject.sendAppMessage(window.sessionState, '*'); 
}

  useEffect(()=> {
    window.sendState = sendState;
  },[sendState]);


  function toggleSessionActive() {
    setSessionState((prevState)=>({
      ...prevState,
      isActive: !prevState.isActive
      }));
    window.sessionState.isActive=!window.sessionState.isActive;
    sendState();
    //set ViewMode when session is started by host. 
    if (window.sessionState.isActive && !window.myRole.includes('Shadow') && !window.myRole.includes('Seller') && !window.myRole.includes('Buyer')) 
    {
      if (window.sessionState.roleOf.Shadow1)
        {window.setViewMode('Shadow1');}
      else if (window.sessionState.roleOf.Shadow2)    //fallbacks in case shadow1 is not assigned
        {window.setViewMode('Shadow2');}
      else if (window.sessionState.roleOf.Shadow3)
        {window.setViewMode('Shadow3');}
      else if (window.sessionState.roleOf.Shadow4)
        {window.setViewMode('Shadow4');}
      else
        {window.setViewMode('Seller');}
      window.camWasOn = callObject.participants().local.video ? true : false;
      window.micWasOn = callObject.participants().local.audio ? true : false;
      callObject.setLocalVideo(false);
      callObject.setLocalAudio(false);
    }
    else {
      console.log('***SettingSubs***');
      console.log('Current viewmode is: ' + window.viewMode);
      setSubs();
      console.log('And now viewmode is: ' + window.viewMode);
    }
    if (!window.sessionState.isActive) {
      callObject.setLocalVideo(true);
      callObject.setLocalAudio(true);
    }
  }

  function togglePractice() {
    let recipientA = window.sessionState.roleOf.Shadow1 && window[window.sessionState.roleOf.Shadow1 + '_SessionID'];
    let recipientB = window.sessionState.roleOf.Shadow2 && window[window.sessionState.roleOf.Shadow2 + '_SessionID'];
    if(window.sessionState.roleOf.Shadow1==window.myName) {recipientA='me'}
    if(window.sessionState.roleOf.Shadow2==window.myName) {recipientB='me'}

    if (!recipientA && !recipientB) {console.log('no recipients.'); return}

    const action = window.audioIsPlaying ? 'pause' : 'play';
    const instructionsA = {
      type: 'instructions',
      target: targetRecording,
      action: action,
      recipient: recipientA,
    }
    const instructionsB = {
      type: 'instructions',
      target: targetRecording + 'B',
      action: action,
      recipient: recipientB
    }

    if (recipientA) {
      if(recipientA!='me') {
        callObject.sendAppMessage(instructionsA,recipientA);
      }
      else if(recipientA=='me') {
        audioPlayer(targetRecording,action);
      }
      console.log(`Sent ${action} request to ${window.sessionState.roleOf.Shadow1}`);
    }
    if (recipientB) {
      if(recipientB!='me') {
        callObject.sendAppMessage(instructionsB,recipientB);
      }
      else if(recipientB=='me') {
        audioPlayer(targetRecording+'B',action);
      }
      console.log(`Sent ${action} request to ${window.sessionState.roleOf.Shadow2}`);
    }
      
    window.audioIsPlaying=(!window.audioIsPlaying);
    setPlayButtonText(!window.audioIsPlaying ? 'Play' : 'Pause');


  }


  function toggleTrainingMode () {
    training.current.classList.toggle('hidden');
    trainingToggle.current.innerText = training.current.classList.contains('hidden') ? 'Show Practice' : 'X';
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


    /* // Play practice audio for users */

    

  return (
<div>
  <div className="admin-panel">

    {/* BEGIN ROLE SELECTORS SECTION*/}
      <div className="role-selector-section">


          {/* Buyer selector */}
          <div className="selector-box">
            Buyer(s)

              <RoleSelector 
                role="Buyer1"
                selectedRoles='selectedRoles'
              />
              <RoleSelector 
                role="Buyer2"
                selectedRoles='selectedRoles'
              />
              <RoleSelector 
                role="Buyer3"
                selectedRoles='selectedRoles'
              />
          </div>
          
          {/* Seller Selector */}
          <div className="selector-box">
            Seller
              <RoleSelector 
                  role="Seller"
                  selectedRoles='selectedRoles'
                />
          </div>

          {/* Shadow selector */}
          <div className="selector-box">
            Seller's shadow(s)
              <RoleSelector 
                  role="Shadow1"
                  selectedRoles='selectedRoles'
                />
                <RoleSelector 
                  role="Shadow2"
                  selectedRoles='selectedRoles'
                />
                <RoleSelector 
                  role="Shadow3"
                  selectedRoles='selectedRoles'
                />
                <RoleSelector 
                  role="Shadow4"
                  selectedRoles='selectedRoles'
                />
            </div>

          {/* Unassigned (working) */}
          {/* <div className="selector-box">
            Unassigned
            <RoleContainer
            />
           </div> */}


        </div>
    {/* END ROLE SELECTORS SECTION */}


    





    {/* <!-- BEGIN START / STOP TOGGLE --> */}
        <div className='session-toggle'>
                        <label class="switch">
                            <input type="checkbox" id='state' checked={sessionState.isActive} onChange={toggleSessionActive}/>
                            <span class="slider round"></span>
                        </label>
                        <p>Session active</p>
        </div>
     {/* <!-- END START / STOP TOGGLE --> */}


     

    </div>
// ***End admin panel***

{/* START TRAINING AUDIO SECTION */}

<div className='practice-audio hidden' ref={training}>
    Practice audio
        
                    {/* Recordings for Seconding */}
                    <div style={{height:'30px',margin:'auto'}}>
                    <form action = ''>
                        <fieldset style={{border:'none'}}>
                        <select class='practice-audio-dropdown' onChange={(e) => {setTargetRecording (e.target.value); console.log('***CHANGED TO ' + e.target.value)}}
                        >
                        <option value = 'monologue1'>What makes CEB different (mono)</option>    
                        {/* ///IMPORTANT: IF DEFAULT VALUE CHANGES ABOVE, ALSO HAVE TO CHANGE IT IN setTargetRecording HOOK */}
                        <option value = 'monologue2'>Searching for PAGA Claims (mono)</option>
                        <option value = 'monologue3'>Audio Engineer (mono)</option>
                        <option value = 'monologue4'>IBM Garage (mono)</option>
                        <option value = 'dialogue1'>Ethics (dialogue)</option>
                        <option value = 'dialogue2'>CoursePass (dialogue)</option>
                    </select>
                    </fieldset>
                    </form>
                </div> 
                  <span style={{color: 'green', fontSize: '16px', fontFamily:'Verdana, Geneva, Tahoma, sans-serif'}}>
                      <button onClick={togglePractice} id='play-pause'>{playButtonText}</button>
                    </span>
    </div>

    {/* END TRAINING AUDIO SECTION */}

<div className='training-toggle' ref={trainingToggle} onClick={toggleTrainingMode}>Show Practice</div>
</div>
    
  );
  
}
