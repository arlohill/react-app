import React, { useContext, useEffect, useState } from 'react';
import CallObjectContext from '../../../../CallObjectContext';
import './InputSelector.css';


export default React.forwardRef((props, ref)=> {
const callObject = useContext(CallObjectContext);
const audioInputSelect = React.createRef();
const videoSelect = React.createRef();
const type = props.type;
const page = props.page;


const handleClick=(e) => {
    if(!e.target.value) {return;}
    let selectionID = e.target.value;
    type == 'audio' && page=='main' && e.target.key.includes('audioinput') && callObject.setInputDevicesAsync({audioSource: selectionID});
    // type == 'audio' && page=='main' && e.target.key.includes('audiooutput') && callObject.setOutputDevice({selectionID});
    type == 'video' && page=='main' && callObject.setInputDevicesAsync({videoSource: selectionID});
    if (type == 'audio' && page=='intro') {
        const [initialInputs,setInitialInputs] = props.inputs;
        let constraints = {
            deviceId: { exact: selectionID }
        };
        navigator.mediaDevices.getUserMedia({audio: constraints}).then(
            (mediaStream)=> {
            let newAudioSource = mediaStream.getAudioTracks()[0];
            setInitialInputs((prev)=>[newAudioSource,prev[1]]);
            });
    }
    if (type == 'video' && page=='intro') {
        const [initialInputs,setInitialInputs] = props.inputs;
        let constraints = {
            width: 1280,
            height: 720,
            deviceId: { 
                exact: selectionID ,
            },
        };
        navigator.mediaDevices.getUserMedia({video: constraints}).then(
            (mediaStream)=> {
            let newVideoSource = mediaStream.getVideoTracks()[0];
            setInitialInputs((prev)=>[prev[0],newVideoSource])
            });
    }   
    e.target.key.includes('input') && console.log('New input: ' + e.target.text);
    // e.target.key.includes('output') && console.log('New output: ' + e.target.text);
}

useEffect(()=>{ 
    if(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices()
        .then(function(deviceInfos) {
            
            if (type=='audio' && audioInputSelect.current) {
                if (audioInputSelect.current.hasChildNodes()) {return}
                let audioInputs = [];
                let audioOutputs = [];

                for (var i = 0; i !== deviceInfos.length; ++i) {
                    var deviceInfo = deviceInfos[i];
                    var option = document.createElement('option');
                    option.className='item';
                    option.value = deviceInfo.deviceId;
                if (deviceInfo.kind === 'audioinput') {
                    option.key = 'audioinput' + audioInputSelect.length + 1;
                    option.text = deviceInfo.label ||'Microphone ' + (audioInputSelect.length + 1);
                    audioInputs.push(option); 
                } 
                // else if (deviceInfo.kind === 'audiooutput') {
                //     option.key = 'audiooutput' + audioInputSelect.length + 1;
                //     option.text = deviceInfo.label || 'Speaker ' +(audioInputSelect.length + 1);
                //     audioOutputs.push(option);
                //     }   
                }
                window.audioOutputs=audioOutputs;
                let micHeading = document.createElement('option');
                micHeading.label = '-Select Microphone-';
                micHeading.className='item-heading';
                let speakerHeading = document.createElement('option');
                // speakerHeading.label = '-Select Speaker-';
                // speakerHeading.className='item-heading';
                audioInputSelect.current.appendChild(micHeading);
                for (var i=0; i!==audioInputs.length; ++i) {
                    audioInputSelect.current.appendChild(audioInputs[i]);
                }

                // audioInputSelect.current.appendChild(speakerHeading);
                // for (var i=0; i!==audioOutputs.length; ++i) {
                //     console.log(audioOutputs[i]);
                //     audioInputSelect.current.appendChild(audioOutputs[i]);
                // }
               
                
                   
            }
            else if (type == 'video' && videoSelect.current) {
                if (videoSelect.current.hasChildNodes()) {return}
                let camHeading = document.createElement('option');
                camHeading.label = '-Select Camera-';
                camHeading.className='item-heading';
                videoSelect.current.appendChild(camHeading);
                for (var i = 0; i !== deviceInfos.length; ++i) {
                    var deviceInfo = deviceInfos[i];
                    var option = document.createElement('option');
                    option.className='item';
                    option.value = deviceInfo.deviceId;
                    if (deviceInfo.kind === 'videoinput') {
                        option.key = 'videooutput' + videoSelect.length + 1;
                        option.text = deviceInfo.label || 'Camera ' +(videoSelect.length + 1);
                        videoSelect.current && videoSelect.current.appendChild(option);
                    }
                }
            }
        })
        .catch(function(err) {
          console.log(err.name + ": " + err.message);
        });
       } 
})
   
    



    return (
        <div className="dropdown-selector" ref={ref}>
                {type=='audio' &&
                <ul ref={audioInputSelect} onClick={handleClick}>
                </ul>
                }
                {type=='video' &&
                <ul ref={videoSelect} onClick={handleClick}>
                </ul>
                }
                
        </div>
    );

})
