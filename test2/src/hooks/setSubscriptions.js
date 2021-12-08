// import { useEffect } from "react";
// import SessionContext from '../../SessionContext';

export default function setSubscriptions(callObject,viewMode=null) {

    if (!window.sessionState) {return;}

    console.log('Setting subscriptions...');
    console.log('****My role is: ' + window.myRole);
    console.log('viewMode is: ' + viewMode);
    let subscribedTo=0;
    window.currentSubs=[];
    
    //if session is active, set currentSubs according to my role
        if (!viewMode && window.sessionState.isActive) {
            switch (window.myRole) {
                case 'Participant1':
                    window.currentSubs=[];
                    window.sessionState.roleOf.Actor2 && window.currentSubs.push(window.sessionState.roleOf.Actor2);
                    !window.sessionState.roleOf.Actor2 && window.sessionState.roleOf.Participant2 && window.currentSubs.push(window.sessionState.roleOf.Participant2);
                    break;
                case 'Participant2':
                    window.currentSubs=[];
                    window.sessionState.roleOf.Actor1 && window.currentSubs.push(window.sessionState.roleOf.Actor1);
                    !window.sessionState.roleOf.Actor1 && window.sessionState.roleOf.Participant1 && window.currentSubs.push(window.sessionState.roleOf.Participant1);
                    break;
                case 'Actor1':
                    window.currentSubs=[];
                    window.sessionState.roleOf.Participant2 && window.currentSubs.push(window.sessionState.roleOf.Participant2);
                    window.sessionState.roleOf.Participant1 && window.currentSubs.push(window.sessionState.roleOf.Participant1+'_AUDIO');
                    break;
                case 'Actor2':
                    window.currentSubs=[];
                    window.sessionState.roleOf.Participant1 && window.currentSubs.push(window.sessionState.roleOf.Participant1);
                    window.sessionState.roleOf.Participant2 && window.currentSubs.push(window.sessionState.roleOf.Participant2+'_AUDIO');
                    break;
                case 'Attendee':
                    window.currentSubs=[];
                    break;
                default:
                    window.currentSubs=[];
                    break;
            }
            //Add Admin to currentSubs if applicable
            if (window.sessionState.AdminVisible) {
            window.currentSubs.push ("Admin");
        }

        window.currentSubs.filter(function (str) {return str.indexOf(window.myName) === -1}) //don't include self

    }

    if(viewMode) {

        switch (viewMode) {
            case 'Room1':
                window.currentSubs=[];
                window.sessionState.roleOf.Participant1 && window.currentSubs.push(window.sessionState.roleOf.Participant1);
                window.sessionState.roleOf.Actor2 && window.currentSubs.push(window.sessionState.roleOf.Actor2);
                !window.sessionState.roleOf.Actor2 && window.sessionState.roleOf.Participant1 && window.sessionState.roleOf.Participant2 && window.sessionState.roleOf.Actor1 && window.currentSubs.push(window.sessionState.roleOf.Participant2);
                break;
            case 'Room2':
                window.currentSubs=[];
                window.sessionState.roleOf.Participant2 && window.currentSubs.push(window.sessionState.roleOf.Participant2);
                window.sessionState.roleOf.Actor1 && window.currentSubs.push(window.sessionState.roleOf.Actor1);
                !window.sessionState.roleOf.Actor1 && window.sessionState.roleOf.Participant1 && window.sessionState.roleOf.Participant2 && window.sessionState.roleOf.Actor2 && window.currentSubs.push(window.sessionState.roleOf.Participant1);
                break;
            case 'Participants':
                window.currentSubs=[];
                window.sessionState.roleOf.Participant1 && window.currentSubs.push(window.sessionState.roleOf.Participant1);
                window.sessionState.roleOf.Participant2 && window.currentSubs.push(window.sessionState.roleOf.Participant2);
                break;
            case 'Actors':
                window.currentSubs=[];
                window.sessionState.roleOf.Actor1 && window.currentSubs.push(window.sessionState.roleOf.Actor1);
                window.sessionState.roleOf.Actor2 && window.currentSubs.push(window.sessionState.roleOf.Actor2);
                break;
            case 'All':
                window.currentSubs=[];
                window.sessionState.roleOf.Participant1 && window.currentSubs.push(window.sessionState.roleOf.Participant1);
                window.sessionState.roleOf.Participant2 && window.currentSubs.push(window.sessionState.roleOf.Participant2);
                window.sessionState.roleOf.Actor1 && window.currentSubs.push(window.sessionState.roleOf.Actor1);
                window.sessionState.roleOf.Actor2 && window.currentSubs.push(window.sessionState.roleOf.Actor2);
                break;
            case 'None':
                window.currentSubs=[];
                window.sessionState.roleOf.Participant1 && window.currentSubs.push(window.sessionState.roleOf.Participant1);
                window.sessionState.roleOf.Participant2 && window.currentSubs.push(window.sessionState.roleOf.Participant2);
                break;
            default:
                window.currentSubs=[];
                break;
        }

        window.currentSubs.filter(function (str) {return str.indexOf(window.myName) === -1}) //don't include self
    }

    
    function setTracks() {

        return new Promise( (resolve) => {

            //cycle through each participant in meeting
            let ps = callObject.participants();
            Object.keys(ps).forEach((p) => {

                let participant = ps[p];
                let thisUserName = participant.user_name;

                if (p === 'local' || thisUserName==window.myName) {
                    return;
                } 

    

                //if SESSION STATE NOT KNOWN, don't subscribe to anyone yet
                if (!window.sessionState.isKnown) {
                    callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : false});
                    return;
                }



                console.log("This username is: " +thisUserName);
                //If NOT ACTIVE (and not setting view mode), subscribe to everyone in the meeting
                if (!window.sessionState.isActive && !viewMode) {

                    //audio only if currently Seconding
                    if (window.myRole.includes('Actor')) {
                        switch (window.myRole) {
                            case 'Actor1':
                                    if (thisUserName==window.sessionState.roleOf.Participant1 || thisUserName=='InvisibleScreenShareWidget') {
                                        console.log('Subscribing to audio only for: ' + thisUserName);
                                        callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : false});
                                        callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : { audio: true, video: false, screenVideo: true, screenAudio:true}});
                                    } else {
                                        console.log('Subscribing to: ' + thisUserName);
                                        window.currentSubs.push(thisUserName);
                                        callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : true});
                                        subscribedTo++;
                                    }
                                break;
                            case 'Actor2':
                                if (thisUserName==window.sessionState.roleOf.Participant2 || thisUserName=='InvisibleScreenShareWidget') {
                                    console.log('Subscribing to audio only for: ' + thisUserName);
                                    callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : false});
                                    callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : { audio: true, video: false, screenVideo: true, screenAudio:true}});
                                } else {
                                    console.log('Subscribing to: ' + thisUserName);
                                    window.currentSubs.push(thisUserName);
                                    callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : true});
                                    subscribedTo++;
                                }
                            break;
                        
                            default:
                                break;
                        }
                    }

                    // audio and video for everyone else
                    else {  
                        // exclude screenshare's in-ear audio stream
                        if (thisUserName=='InvisibleScreenShareWidget') {
                            console.log('Not subscribing to: ' + thisUserName);
                            callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : { audio: false, video: false, screenVideo: true, screenAudio: true}});

                        
                        } else {
                            console.log('Subscribing to: ' + thisUserName);
                            window.currentSubs.push(thisUserName);
                            if (!callObject.participants()[participant.session_id].tracks.video.subscribed){
                                callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : false});
                            }
                            callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : true});
                            subscribedTo++;
                            }     
                    }

                    //  else if (thisUserName=='Admin' && window.sessionState.AdminVisible) {
                    //     console.log('Subscribing to Admin:');
                    //     callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : true});
                    //     subscribedTo++;
                    //     console.log('Subscribed to session id: ' + participant.session_id);
                    // } 

                } 

                //IF ACTIVE (or selecting viewmode), just subscribe to those listed in currentSubs;
                else if (window.sessionState.isActive || viewMode) {
                    if(window.currentSubs.includes(thisUserName+'_AUDIO')) {
                        console.log('Subscribing to audio only for: ' + thisUserName);
                        callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : { audio: true, video: false, screenVideo: false}});
                    }
                    else if(window.currentSubs.includes(thisUserName)) {
                        console.log('Subscribing to: ' + thisUserName);
                        callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : true});
                        subscribedTo++;
                    }
                    else if (!window.currentSubs.includes(thisUserName)) {
                        console.log('NOT subscribing to: ' + thisUserName + ', sessionID: ' + participant.session_id);
                        callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : false});
                    }
                }
            });
            resolve()
        })
    }
    
    setTracks().then(()=>{
        //remove screenshare widget from currentSubs array
        
        const index = window.currentSubs.indexOf('InvisibleScreenShareWidget');
        if (index > -1) {
          window.currentSubs.splice(index, 1);
        }
    //print subscriptions

    window.currentSubs.filter(function (str) {return str.indexOf(window.myName) === -1}) //don't include self

    var iterator = window.currentSubs.values();
    console.log("Currently subscribed to:");
    for (let elements of iterator) { 
        console.log(elements); 
    } 
    if (window.currentSubs.length < 1) {
        console.log ("No one.")
    }
    window.updateCall();
    viewMode=null;
    window.updateTray();
    window.updateTile();


        //if no admin (or admin has left), start asking for state
        // if (adminPresent==false) {
        //     window.sessionState.isKnown=false;
        //     if (typeof(stateRequest)!='undefined') {clearInterval(stateRequest);}
        //     stateRequest = setInterval(getState,2500);
        //     console.log('no Admin present');
        // }
        // if (subscribedTo==0) {
        //     window.isPopulated = false;
        //     document.getElementById('empty-room').style.opacity='1';
        //     if(!!document.querySelector("#root > div > div.daily-videos-wrapper > div.daily-video-div.remote.cam.cam-muted.mic-muted")){document.querySelector("#root > div > div.daily-videos-wrapper > div.daily-video-div.remote.cam.cam-muted.mic-muted").style.visibility='hidden';}
        //     if (window.sessionState.isActive==true) {
        //         document.getElementById('empty-text').innerHTML="Hold that thought! 😐 <br><br> We're working to fix a connection problem."
        //     } else if (window.sessionState.isActive==false) {
        //         document.getElementById('empty-text').innerHTML="👋 <br>You're here!<br>Waiting for everyone else..."

        //     }
        // } else if (subscribedTo>0) {
        //     window.isPopulated = true;
        //     document.getElementById('empty-room').style.opacity='0';
        //     if (document.querySelector("#root > div > div.daily-videos-wrapper > div.daily-video-div.remote.cam.cam-muted.mic-muted")){
        //         document.querySelector("#root > div > div.daily-videos-wrapper > div.daily-video-div.remote.cam.cam-muted.mic-muted").style.visibility='visible';
        //     }

        // }

    })

    
   
};

