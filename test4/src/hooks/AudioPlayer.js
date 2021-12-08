export default function audioPlayer(trackName,command) {
    const trackList = {
        monologue1: 'https://storage.googleapis.com/secondbodyuploads/What%20Makes%20CEB%20Different%20(Mono).mp3',
        monologue2: 'https://storage.googleapis.com/secondbodyuploads/PAGA%20Claims%20(mono).mp3',
        monologue3: 'https://storage.googleapis.com/secondbodyuploads/AudioEngineer.mp3',
        monologue4: 'https://storage.googleapis.com/secondbodyuploads/IBM%20Garage.mp3',
        monologue5: 'https://storage.googleapis.com/secondbodyuploads/Livestorm1.m4a',
        monologue6: 'https://storage.googleapis.com/secondbodyuploads/Livestorm2.m4a',
        monologue7: 'https://storage.googleapis.com/secondbodyuploads/Sublet.mp3',
        monologue8: 'https://storage.googleapis.com/secondbodyuploads/Zombies.mp3',
        monologue9: 'https://storage.googleapis.com/secondbodyuploads/Excellence.mp3',
        monologue10: 'https://storage.googleapis.com/secondbodyuploads/Gertens.mp3',
        monologue11: 'https://storage.googleapis.com/secondbodyuploads/Raymond.mp3',
        monologue12: 'https://storage.googleapis.com/secondbodyuploads/Listening.m4a',
        monologue13: 'https://storage.googleapis.com/secondbodyuploads/Telum%20Processor.m4a',

        dialogue1: 'https://storage.googleapis.com/secondbodyuploads/EthicsA%20(dialogue).mp3',
        dialogue1B: 'https://storage.googleapis.com/secondbodyuploads/EthicsB%20(dialogue).mp3',
        dialogue2: 'https://storage.googleapis.com/secondbodyuploads/CoursePass(A)%20(dialogue).mp3',   
        dialogue2B: 'https://storage.googleapis.com/secondbodyuploads/CoursePass(B)%20(dialogue).mp3',
        dialogue3: 'https://storage.googleapis.com/secondbodyuploads/S_2Weeks.mp3',
        dialogue3B: 'https://storage.googleapis.com/secondbodyuploads/M_2Weeks.mp3',
        dialogue4: 'https://storage.googleapis.com/secondbodyuploads/S_MyLife.mp3',
        dialogue4B: 'https://storage.googleapis.com/secondbodyuploads/M_MyLife.mp3',
        dialogue5: 'https://storage.googleapis.com/secondbodyuploads/L.mp3',
        dialogue5B: 'https://storage.googleapis.com/secondbodyuploads/B.mp3',
        dialogue6: 'https://storage.googleapis.com/secondbodyuploads/Charlotte%20(full).mp3',
        dialogue6B: 'https://storage.googleapis.com/secondbodyuploads/Seth%20(full).mp3',



        // monologue0: "https://storage.googleapis.com/secondbodyuploads/Sublet.mp3",
        // monologue1: "https://storage.googleapis.com/secondbodyuploads/OnlineClasses.mp3",
        // monologue2: "https://storage.googleapis.com/secondbodyuploads/Zombies.mp3",
        // monologue3: "https://storage.googleapis.com/secondbodyuploads/Vegetarian.mp3",
        // monologue4: "https://storage.googleapis.com/secondbodyuploads/Excellence.mp3",
        // monologue5: "https://storage.googleapis.com/secondbodyuploads/Potatoes.mp3",
        // monologue6: "https://storage.googleapis.com/secondbodyuploads/WireRoom.mp3",
        // monologue7: "https://storage.googleapis.com/secondbodyuploads/Church.mp3",
        // monologue8: "https://storage.googleapis.com/secondbodyuploads/Gertens.mp3",
        // monologue9: "https://storage.googleapis.com/secondbodyuploads/Raymond.mp3",
        // monologue10: "https://storage.googleapis.com/secondbodyuploads/WeddingSpeech.mp3",
        // monologue11: "https://storage.googleapis.com/secondbodyuploads/AudioEngineer.mp3",
        // monologue12: "https://storage.googleapis.com/secondbodyuploads/Arizona.mp3",
        // monologue13: "https://storage.googleapis.com/secondbodyuploads/German.m4a",
        // dialogue1A: "https://storage.googleapis.com/secondbodyuploads/S_2Weeks.mp3",
        // dialogue1B: "https://storage.googleapis.com/secondbodyuploads/M_2Weeks.mp3",
        // dialogue2A: "https://storage.googleapis.com/secondbodyuploads/S_MyLife.mp3",
        // dialogue2B: "https://storage.googleapis.com/secondbodyuploads/M_MyLife.mp3",
        // dialogue3A: "https://storage.googleapis.com/secondbodyuploads/FULL_Sahil.mp3",
        // dialogue3B: "https://storage.googleapis.com/secondbodyuploads/FULL_Mary.mp3",
        // dialogue4A: "https://storage.googleapis.com/secondbodyuploads/L.mp3",
        // dialogue4B: "https://storage.googleapis.com/secondbodyuploads/B.mp3",
        // dialogue5A: "https://storage.googleapis.com/secondbodyuploads/L_full.mp3",
        // dialogue5B: "https://storage.googleapis.com/secondbodyuploads/B_full.mp3",
        // dialogue6A: "https://storage.googleapis.com/secondbodyuploads/Charlotte.mp3",
        // dialogue6B: "https://storage.googleapis.com/secondbodyuploads/Seth.mp3",
        // dialogue7A: "https://storage.googleapis.com/secondbodyuploads/Ron%20full.mp3",
        // dialogue7B: "https://storage.googleapis.com/secondbodyuploads/Brenda%20full.mp3",
    }
    window.audio.src = trackList[trackName];
    console.log (`going to ${command} ${trackName}`);
    window.audio[command]();

   //TODO AUDIO TEST BELOW


    //TODO: PUT BACK IN*********

    if(command=='pause') {
        window.audioSourceNode.disconnect();
        return;
    }

    //create Audio Context and destination
    if (typeof(window.recordingAudioContext)=='undefined') {window.recordingAudioContext = new (window.AudioContext || window.webkitAudioContext)();}
    // let src=document.getElementById('MediaPlayer');
    window.audioSourceNode = window.audioSourceNode || window.recordingAudioContext.createMediaElementSource(window.audio);

    //gain Node
    let gainNode = window.recordingAudioContext.createGain();
    gainNode.gain.value=1;
    //panner Node
    var panNode = window.recordingAudioContext.createStereoPanner();
    panNode.pan.value=1;

    //Pipe source through nodes to destination
    window.audioSourceNode.connect(gainNode).connect(panNode).connect(window.recordingAudioContext.destination);


    //END TODO*******

    

}