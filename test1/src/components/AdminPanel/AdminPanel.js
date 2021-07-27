import React, { useContext, useEffect, useState } from 'react';
import CallObjectContext from '../../CallObjectContext';
import NameContext from '../../NameContext';
import { logDailyEvent } from '../../logUtils';
import {Fragment} from 'react';
import './AdminPanel.css';



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
  const myName = useContext(NameContext);
  const [isCameraMuted, setCameraMuted] = useState(false);
  const [isMicMuted, setMicMuted] = useState(false);
  const [isSharingScreen, setSharingScreen] = useState(false);
  const [displayChat, setChatDisplay] = useState(false);
  const [highlightedChat, setChatHighlight] = useState(false);

  function toggleCamera() {
    callObject.setLocalVideo(isCameraMuted);
  }

  function toggleMic() {
    callObject.setLocalAudio(isMicMuted);
  }

  function toggleSharingScreen() {
    isSharingScreen
      ? callObject.stopScreenShare()
      : callObject.startScreenShare();
  }

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
  let playingAudio=false;

    async function togglePractice () {
        document.getElementById('play-pause').innerHTML = playingAudio ? 'Play practice audio' : 'Pause practice audio';
        var selection = document.getElementById('practice-audio');
        var recipient = document.getElementById('audio-target');
        var track = selection.value;
        var name = recipient.value;

        var command = !playingAudio ? 'play' : 'pause';
        var instructions = {
          type: 'instructions',
          recipients: name,
          target: track,
          action: command,
        }
        callObject.sendAppMessage(instructions,'*');
        playingAudio = !playingAudio ? true : false;
      }

  return (

                    // ??????? fix these two styles
        <div className="admin-panel" style={{width: '10%'}}>
        <div id='controlbar' class='control-bar' style={{left:'-15%'}}>
                 

                <div style={{flexGrow:'2'}}></div>
                {/* <!-- Who Admin sees during a session --> */}
                <div style={{visibility:'visible', flexGrow:'1', textAlign: 'center'}} id='my-view'>
                    <form action = ''>
                        <fieldset style={{border:'none'}}>
                        <select id = 'view-mode'
                        onchange = "setViewMode()" style={{outline:'none', position: 'relative', borderRadius: '20px', height:'30px', width:'100px', bottom:'-22px', cursor:'pointer', backgroundColor: '#2196F3', color:'white'}}>
                        <option value = 'All'>All</option>
                        <option value = 'Room1'>Room1</option>
                        <option value = 'Room2'>Room2</option>
                        <option value = 'Actors'>Actors</option>
                        <option value = 'Participants'>Participants</option>
                        <option value = '1s'>Both 1s</option>
                        <option value = '2s'>Both 2s</option>
                        <option value = 'None'>None</option>
                        </select>
                        </fieldset>
                        </form>
                        <p style={{position:'relative', bottom: '3px'}}>My view</p>
                </div>
                


                

                {/* <!-- Play recordings for users to practice Seconding --> */}
                <div style={{display:'inline-flex', textAlign: 'center', flexDirection: 'column', justifyContent: 'flex-end'}}>
                
                <span style={{bottom: '-35px', color: 'green', fontSize: '16px', fontFamily:'Verdana, Geneva, Tahoma, sans-serif'}}>
                <button onclick='togglePractice()' id='play-pause'>Play practice audio</button>
                </span>

                <div style={{height:'25px'}}>
                        <form action = ''>
                        <fieldset style={{border:'none'}}>
                        <select id = 'audio-target'
                        style={{outline:'none', borderRadius: '20px', height:'20px', width:'120px', cursor:'pointer', backgroundColor:'green', color:'white'}}>
                            <option value = 'both'>Both Actors</option>
                        </select>
                        </fieldset>
                        </form>
                </div>
                
                {/* Recordings for Seconding */}
                <div style={{height:'30px'}}>
                <form action = ''>
                    <fieldset style={{border:'none'}}>
                    <select id = 'practice-audio'
                    style={{outline:'none', borderRadius: '20px', height:'20px', width:'120px',  cursor:'pointer', backgroundColor:'green', color:'white'}}>
                    <option value = 'mono0'>Sublet</option>
                    <option value = 'mono1'>Online Classes</option>
                    <option value = 'mono2'>Zombie Dream</option>
                    <option value = 'mono3'>Stopping Being Vegetarian</option>
                    <option value = 'mono4'>Excellence</option>
                    <option value = 'mono5'>Potatoes</option>
                    <option value = 'mono6'>Wire Room </option>
                    <option value = 'mono7'>Church</option>
                    <option value = 'mono8'>Gertens</option>
                    <option value = 'mono9'>Raymond</option>
                    <option value = 'mono10'>Wedding Speech</option>
                    <option value = 'mono11'>Audio Engineer</option>
                    <option value = 'mono12'>Arizona</option>
                    <option value = 'dialogue1'>S + M Two Weeks Away (dialogue)</option>
                    <option value = 'dialogue2'>S + M Doing with my Life (dialogue)</option>
                    <option value = 'dialogue3'>S + M (FULL)</option>
                    <option value = 'dialogue4'>B + L (short dialogue)</option>
                    <option value = 'dialogue5'>B + L (longer dialogue)</option>
                    <option value = 'dialogue6'>Charlotte+Seth(dialogue)</option>
                    <option value = 'dialogue7'>Ron+Brenda(dialogue)</option>
                </select>
                </fieldset>
                </form>
            </div>
            

            
        </div>


            
                {/* <!-- start / stop session --> */}
                <div style={{flexGrow:'1', textAlign: 'center'}}>
                    <label class="switch" style={{position:'relative', height:'30px', width:'60px', cursor:'pointer', bottom:'-30px'}}>
                        <input type="checkbox" id='state' />
                        <span class="slider round"></span>
                    </label>
                    <p style={{position:'relative', bottom: '-15px'}}>Session active</p>
                    </div>


                    {/* <!-- start / stop recording --> */}
                <div style={{flexGrow:'1', textAlign: 'center'}}>
                <label class="switch" style={{position:'relative', height:'30px', width:'60px', cursor:'pointer', bottom:'-30px'}}>
                    <input type="checkbox" id='recording' />
                    <span class="slider round red"></span>
                </label>
                <p style={{position:'relative', bottom: '-15px'}}>Recording</p>
            </div>

        </div>
        </div>  

    
  );
  
}
