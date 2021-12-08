import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Tile.css';
function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
}

function getTrackUnavailableMessage(kind, trackState) {
  if (!trackState) return;
  switch (trackState.state) {
    case 'blocked':
      if (trackState.blocked.byPermissions) {
        return `${kind} permission denied`;
      } else if (trackState.blocked.byDeviceMissing) {
        return `${kind} device missing`;
      }
      return `${kind} blocked`;
    case 'off':
      if (trackState.off.byUser) {
        return `${kind} muted`;
      } else if (trackState.off.byBandwidth) {
        return `${kind} muted to save bandwidth`;
      }
      return `${kind} off`;
    case 'sendable':
      return `${kind} not subscribed`;
    case 'loading':
      return `${kind} loading...`;
    case 'interrupted':
      return `${kind} interrupted`;
    case 'playable':
      return null;
  }
}

/**
 * Props
 * - videoTrackState: DailyTrackState?
 * - audioTrackState: DailyTrackState?
 * - isLocalPerson: boolean
 * - isAudioOnly: boolean
 * - isLarge: boolean
 * - disableCornerMessage: boolean
 * - onClick: Function
 * -isScreenShare: boolean
 */
export default function Tile(props) {
  const videoEl = useRef(null);
  const audioEl = useRef(null);
  const forceUpdate = useForceUpdate();

  window.updateTile = () => {
    forceUpdate();
  }

  const videoTrack = useMemo(() => {
    return props.videoTrackState && props.videoTrackState.state === 'playable' && (props.isLocalPerson || props.videoTrackState.subscribed === true)
      ? props.videoTrackState.track
      : null;
  }, [props.videoTrackState]);

  const subscribed = useMemo(() => {
    //should be considered "subscribed" if video track is non-local + subscribed (even if the cam is off, to render black background), OR if it's local and cam is on
    return props.videoTrackState && ( (props.isLocalPerson && props.videoTrackState.state === 'playable') || props.videoTrackState.subscribed);
  }, [props.videoTrackState]);

  const audioTrack = useMemo(() => {

    if (!props.audioTrackState || !props.audioTrackState.track || props.audioTrackState.state !== 'playable' || props.audioTrackState.subscribed === false) 
        {return null;}
    // if(props.disableCornerMessage) {console.log('Is a screen share');}
    if (props.isAudioOnly) {
      props.audioTrackState.track.isFiltered=true;
    } else {props.audioTrackState.track.isFiltered=false;}
    if (props.isScreenShare) {
      props.audioTrackState.track.isScreenShare=true;
    } else {props.audioTrackState.track.isScreenShare=false;}
    return props.audioTrackState.track
  }, [props.audioTrackState]);

  const videoUnavailableMessage = useMemo(() => {
    return getTrackUnavailableMessage('video', props.videoTrackState);
  }, [props.videoTrackState]);

  const audioUnavailableMessage = useMemo(() => {
    return getTrackUnavailableMessage('audio', props.audioTrackState);
  }, [props.audioTrackState]);

  /**
   * When video track changes, update video srcObject
   */
  useEffect(() => {
    videoEl.current &&
      (videoEl.current.srcObject = new MediaStream([videoTrack]));
  }, [videoTrack]);

  /**
   * When audio track changes, update audio srcObject
   */
  useEffect(() => {
    if(audioEl.current) {


     ///////////////TODO START TEMP DELETED PORTION



      if(audioTrack.isFiltered) {
        console.log('**FILTERING LIVE TRACK**')

          ///******audiocontext creation section///

          //create audio stream
          window.stream= new MediaStream([audioTrack]);

          //workaround for bug in Chrome, see: https://bit.ly/3ryn1fW
                window.mutedAudio = window.mutedAudio || new Audio(); 
                window.mutedAudio.muted = true;
                if(!window.mutedAudio.srcObject) {window.mutedAudio.srcObject = window.stream;}
                window.mutedAudio.paused && window.mutedAudio.play(); 

          //create Audio Context and destination
          window.audioCtx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
         window.audioSourceNode = window.audioCtx.createMediaStreamSource(window.stream);
          if (typeof(window.destination)=='undefined'){window.destination = window.audioCtx.createMediaStreamDestination();}

          //gain Node
          if (typeof(window.gainNode)=='undefined') {window.gainNode = window.audioCtx.createGain();}
          //panner Node
          if (typeof(window.panNode)=='undefined') {window.panNode = window.audioCtx.createStereoPanner()}


          //*****end audiocontext creation section


              //adjust nodes
              window.gainNode.gain.value=1;
              window.panNode.pan.value=1;      
              //Pipe source through nodes to destination
            window.audioSourceNode.connect(window.gainNode).connect(window.panNode).connect(window.destination);

            //Attach to the audio element
          audioEl.current.srcObject = window.destination.stream;
        
      } 
      else if(audioTrack.isScreenShare) {

        //for everyone, just piping the received audio (which was the left channel of the original video) straight through
        console.log('***GETTING SCREENSHARE AUDIO')
        ///***With audiocontext:  */
        // window.audioSourceNode.connect(destination);


        ///without Audiocontext:////
        audioEl.current.srcObject = new MediaStream([audioTrack]);



      }
      else {      //For normal live tracks
        console.log('***NOT FILTERING: LIVE TRACK***')

         //Pipe source *straight* to destination, through audiocontext
        // window.audioSourceNode.connect(gainNode).connect(destination);

        //without audiocontext
        audioEl.current.srcObject = new MediaStream([audioTrack]);

      }

      ///END TODO TEMP DELETED PORTION


       //when above is deleted:
      //  audioEl.current.srcObject = new MediaStream([audioTrack]);

          


     

  

      // for debugging
      // window.destination=destination; 
      // window.audioTrack=audioTrack;
      // window.audioEl = audioEl;

      }
      
  }, [audioTrack,window.sessionState]);

  function getVideoComponent() {
    return videoTrack && <video autoPlay muted playsInline ref={videoEl} />;

    
  }

  function getAudioComponent() {
    return (
      !props.isLocalPerson &&
      audioTrack && <audio autoPlay playsInline ref={audioEl} > </audio>
    );
  }

  function getOverlayComponent() {
    // Show overlay when video is unavailable. Audio may be unavailable too.
    return videoTrack && (
      videoUnavailableMessage && (
        <p className="overlay">
          {videoUnavailableMessage}
          {/* {audioUnavailableMessage && (
            <>
              <br />
              {audioUnavailableMessage}
            </>
          )} */}
        </p>
      )
    );
  }

  function getCornerMessageComponent() {
    // Show corner message when only audio is unavailable.
    return (
      !props.disableCornerMessage &&
      audioUnavailableMessage &&
      !videoUnavailableMessage && (
        <p className="corner">{audioUnavailableMessage}</p>
      )
    );
  }

  function getClassNames() {
    let classNames = 'tile';
    classNames += props.isLarge ? ' large' : ' small';
    props.isLocalPerson && (classNames += ' local');
    return classNames;
  }

  return (

    <div className={getClassNames()} onClick={props.onClick} style={{display: subscribed ? "block" : "none"}}>   
      <div className="background"/> 
      {getOverlayComponent()}
      {getVideoComponent()}
      {videoTrack && getCornerMessageComponent()}
      {getAudioComponent()}
    </div>
  );
}
