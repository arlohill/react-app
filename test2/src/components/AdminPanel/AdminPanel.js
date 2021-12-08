import React, { useContext, useEffect, useState } from 'react';
import CallObjectContext from '../../CallObjectContext';
import NameContext from '../../NameContext';
import { logDailyEvent } from '../../logUtils';
import './AdminPanel.css';
import setSubscriptions from '../../hooks/setSubscriptions';
import audioPlayer from '../../hooks/AudioPlayer';

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
  const myName = useContext(NameContext);
  const [isCameraMuted, setCameraMuted] = useState(false);
  const [isMicMuted, setMicMuted] = useState(false);
  const [isSharingScreen, setSharingScreen] = useState(false);
  const [displayChat, setChatDisplay] = useState(false);
  const [highlightedChat, setChatHighlight] = useState(false);
  const setSubs = () => {setSubscriptions(callObject)};  
  const forceUpdate = useForceUpdate();
  window.updateAdminPanel=forceUpdate;
  const [playButtonText, setPlayButtonText] = useState('Play practice audio');
  const [targetRecording, setTargetRecording] = useState('monologue1') ///////HAVE TO CHANGE THIS IN TWO PLACES

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
    window.sessionState.isActive = !window.sessionState.isActive;
    sendState();
    if (window.sessionState.isActive && !window.myRole.includes('Actor') && !window.myRole.includes('Participant')) {
      setSubscriptions(callObject,'Room1')
    }
    else {
      setSubs();

    }
  }

  function togglePractice() {
    let recipientA = window.sessionState.roleOf.Actor1 && window[window.sessionState.roleOf.Actor1 + '_SessionID'];
    let recipientB = window.sessionState.roleOf.Actor2 && window[window.sessionState.roleOf.Actor2 + '_SessionID'];
    if(window.sessionState.roleOf.Actor1==window.myName) {recipientA='me'}
    if(window.sessionState.roleOf.Actor2==window.myName) {recipientB='me'}

    if (!recipientA && !recipientB) {return}

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
      console.log(`Sent ${action} request to ${window.sessionState.roleOf.Actor1}`);
    }
    if (recipientB) {
      if(recipientB!='me') {
        callObject.sendAppMessage(instructionsB,recipientB);
      }
      else if(recipientB=='me') {
        audioPlayer(targetRecording+'B',action);
      }
      console.log(`Sent ${action} request to ${window.sessionState.roleOf.Actor2}`);
    }
      
    window.audioIsPlaying=(!window.audioIsPlaying);
    setPlayButtonText(!window.audioIsPlaying ? 'Play practice audio' : 'Pause practice audio');


  }




  let handleRoleChange = (e) => {
    window.sessionState.roleOf[e.target.id]=e.target.value;
    console.log (e.target.id + ' is now: ' + window.sessionState.roleOf[e.target.id]);
    sendState();

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
            // activateSession();  //rebuild UI for the newly assigned role, mid-session
        } 
        setSubs();
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

        <div className="admin-panel" style={{position:'relative',margin:'auto',width:'100%',height:'80px'}}>
                 

              
                


                

                {/* <!-- Play recordings for users to practice Seconding --> */}
          <div style={{position:'absolute',left:'50px',top:'12px',textAlign: 'center', flexDirection: 'column', justifyContent: 'flex-end'}}>
                
                    <span style={{bottom: '0px', color: 'green', fontSize: '16px', fontFamily:'Verdana, Geneva, Tahoma, sans-serif'}}>
                    <button onClick={togglePractice} id='play-pause'>{playButtonText}</button>
                    </span>

                   
       
                    {/* Recordings for Seconding */}
                    <div style={{height:'30px'}}>
                    <form action = ''>
                        <fieldset style={{border:'none'}}>
                        <select id = 'practice-audio' onChange={(e) => {setTargetRecording (e.target.value); console.log('***CHANGED TO ' + e.target.value)}}
                        style={{outline:'none', borderRadius: '20px', height:'20px', width:'130px',  cursor:'pointer', backgroundColor:'green', color:'white'}}>
                        <option value = 'monologue1'>What makes CEB different (mono)</option>    
                        {/* ///IF DEFAULT VALUE CHANGES ABOVE, ALSO HAVE TO CHANGE IT IN setTargetRecording HOOK */}
                        <option value = 'monologue2'>Searching for PAGA Claims (mono)</option>
                        <option value = 'monologue3'>Audio Engineer (mono)</option>
                        <option value = 'monologue4'>IBM Garage (mono)</option>
                        <option value = 'dialogue1'>Ethics (dialogue)</option>
                        <option value = 'dialogue2'>CoursePass (dialogue)</option>
                    </select>
                    </fieldset>
                    </form>
                </div> 
        </div>

        {/* END PRACTICE AUDIO */}

       


            
               


                    {/* <!-- start / stop recording --> */}
                {/* <div style={{flexGrow:'1', textAlign: 'center'}}>
                <label class="switch" style={{position:'relative', height:'30px', width:'60px', cursor:'pointer', bottom:'-30px'}}>
                    <input type="checkbox" id='recording' />
                    <span class="slider round red"></span>
                </label>
                <p style={{position:'relative', bottom: '-15px'}}>Recording</p>
            </div> */}

            {/* <!-- Assign who will be the participants + actors --> */}
    <div id='role-assignments' class='role-assignments' style={{}}>

          {/* (<span style={{color:'red'}}>Person A:</span> + <span style={{color:'grey'}}>played by:</span>) */}

          <div className='column'>

              <div className='RoleName-and-Dropdown'>
                      <div className='RoleName'>
                        <p>
                          Person A:
                        </p>
                      </div>

                      <div className='dropdown'>
                          <p>
                            <form>
                              <select className='selector' id="Participant1" onChange={handleRoleChange}>
                                <option value={null}></option>
                                {window.userList && window.userList.length>0 && window.userList.map((user) => <option value={user}>{user}</option>)}
                              </select>
                              </form>
                            </p>
                      </div>
              </div>

              <div className='RoleName-and-Dropdown'>
                        <div className='RoleName'>
                          <p>
                            Actor A:
                          </p>
                        </div>

                        <div className='dropdown'>
                      <p>
                      <form>
                      <select className='selector' id="Actor1" onChange={handleRoleChange}>
                          <option value={null}></option>
                          {window.userList && window.userList.length>0 && window.userList.map((user) => <option value={user}>{user}</option>)}
                          </select>
                        </form>
                      </p>
                  </div>
              </div>
      </div>

      <div className='column'>

          <div className='RoleName-and-Dropdown'>
                  <div className='RoleName'>
                    <p>
                      Person B:
                    </p>
                  </div>

                  <div className='dropdown'>
                      <p>
                        <form>
                        <select className='selector' id="Participant2" onChange={handleRoleChange}>
                          <option value={null}></option>
                          {window.userList && window.userList.length>0 && window.userList.map((user) => <option value={user}>{user}</option>)}
                          </select>
                          </form>
                        </p>
                  </div>
          </div>

          <div className='RoleName-and-Dropdown'>
                    <div className='RoleName'>
                      <p>
                        Actor B:
                      </p>
                    </div>

                <div className='dropdown'>
                <p>
                <form>
                <select className='selector' id="Actor2" onChange={handleRoleChange}>                    
                <option value={null}></option>
                    {window.userList && window.userList.length>0 && window.userList.map((user) => <option value={user}>{user}</option>)}
                    </select>
                  </form>
                </p>
              </div>
          </div>
    </div>

    

    </div>  
    {/* END ROLE assignments */}

     {/* <!-- start / stop session --> */}
     <div style={{textAlign: 'center',width:'100px', position:'absolute',right:'70px',bottom:'0px'}}>
                    <label class="switch" style={{position:'relative', left:'30px',height:'30px', width:'60px',bottom:'-13px', cursor:'pointer'}}>
                        <input type="checkbox" id='state' onChange={toggleSessionActive}/>
                        <span class="slider round"></span>
                    </label>
                    <p style={{position:'relative', left:'30px', bottom: '0px'}}>Session active</p>
                    </div>

    </div>
        

    
  );
  
}
