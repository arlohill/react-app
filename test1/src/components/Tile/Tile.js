import React, { useEffect, useMemo, useRef } from 'react';
import './Tile.css';

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
 * - isLarge: boolean
 * - disableCornerMessage: boolean
 * - onClick: Function
 * - isMyFirst: boolean
 */
export default function Tile(props) {
  const videoEl = useRef(null);
  const audioEl = useRef(null);

  const videoTrack = useMemo(() => {
    return props.videoTrackState && props.videoTrackState.state === 'playable' && (props.isLocalPerson || props.videoTrackState.subscribed === true)
      ? props.videoTrackState.track
      : null;
  }, [props.videoTrackState]);

  const audioTrack = useMemo(() => {


    
    return props.audioTrackState && props.audioTrackState.state === 'playable' && props.audioTrackState.subscribed === true
      ? props.audioTrackState.track
      : null;
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
      
      //create audio stream
      let stream= new MediaStream([audioTrack]);

      //workaround for bug in Chrome, see: https://bit.ly/3ryn1fW
      const mutedAudio = new Audio(); 
      mutedAudio.muted = true;
      mutedAudio.srcObject = stream;
      mutedAudio.play(); 

      //create Audio Context and destination
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      let audioSourceNode = audioCtx.createMediaStreamSource(stream);
      let destination = audioCtx.createMediaStreamDestination();

      //gain Node
      let gainNode = audioCtx.createGain();
      gainNode.gain.value=1;
      //panner Node
      var panNode = audioCtx.createStereoPanner();
      panNode.pan.value=-1;


      //Pipe source through nodes to destination
      audioSourceNode.connect(gainNode).connect(panNode).connect(destination);

      //Attach to the audio element
      audioEl.current.srcObject = destination.stream;

      // instead of:
      // audioEl.current.srcObject = new MediaStream([audioTrack]);


      // for debugging
      window.destination=destination; 
      window.audioTrack=audioTrack;
      window.audioEl = audioEl;
      }
      
  }, [audioTrack]);

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
    <div className={getClassNames()} onClick={props.onClick}>
      <div className="background" style={{display: videoTrack ? "block" : "none"}}/> 
      {getOverlayComponent()}
      {getVideoComponent()}
      {videoTrack && getCornerMessageComponent()}
      {getAudioComponent()}
    </div>
  );
}
