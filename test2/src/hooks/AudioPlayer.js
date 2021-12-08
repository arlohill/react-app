export default function audioPlayer(trackName,command) {
    const trackList = {
        monologue1: 'https://storage.googleapis.com/secondbodyuploads/What%20Makes%20CEB%20Different%20(Mono).mp3',
        monologue2: 'https://storage.googleapis.com/secondbodyuploads/PAGA%20Claims%20(mono).mp3',
        monologue3: 'https://storage.googleapis.com/secondbodyuploads/AudioEngineer.mp3',
        monologue4: 'https://storage.googleapis.com/secondbodyuploads/IBM%20Garage.mp3',
        monologue5: '',
        monologue6: '',

        dialogue1: 'https://storage.googleapis.com/secondbodyuploads/EthicsA%20(dialogue).mp3',
        dialogue1B: 'https://storage.googleapis.com/secondbodyuploads/EthicsB%20(dialogue).mp3',
        dialogue2: 'https://storage.googleapis.com/secondbodyuploads/CoursePass(A)%20(dialogue).mp3',
        dialogue2B: 'https://storage.googleapis.com/secondbodyuploads/CoursePass(B)%20(dialogue).mp3',
        dialogue3: '',
        dialogue3B: '',
        dialogue4: '',
        dialogue4B: '',
        dialogue5: '',
        dialogue5B: '',
        dialogue6: '',
        dialogue6B: '',
    }
    window.audio.src = trackList[trackName];
    console.log (`going to ${command} ${trackName}`);
    window.audio[command]();

   

    //TODO: PUT BACK IN*********

    if(command=='pause') {
        window.audioSourceNode.disconnect();
        return;
    }

    //create Audio Context and destination
    if (typeof(window.audioCtx)=='undefined') {window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();}
    // let src=document.getElementById('MediaPlayer');
    window.audioSourceNode = window.audioSourceNode || window.audioCtx.createMediaElementSource(window.audio);

    //gain Node
    let gainNode = window.audioCtx.createGain();
    gainNode.gain.value=1;
    //panner Node
    var panNode = window.audioCtx.createStereoPanner();
    panNode.pan.value=1;

    //Pipe source through nodes to destination
    window.audioSourceNode.connect(gainNode).connect(panNode).connect(window.audioCtx.destination);


    //END TODO*******

    

}