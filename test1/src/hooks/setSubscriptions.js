import { useEffect } from "react";


export default function setSubscriptions(e) {

    console.log('Setting subscriptions...');
    window.subscribedTo=0;
    
    //if session is active, set currentSubs accord to my role
    if (sessionState.isActive) {
        switch (myRole) {
            case 'Participant1':
                currentSubs=[];
                sessionState.roleOf.Actor2 && currentSubs.push(sessionState.roleOf.Actor2);
                break;
            case 'Participant2':
                currentSubs=[];
                sessionState.roleOf.Actor1 && currentSubs.push(sessionState.roleOf.Actor1);
                break;
            case 'Actor1':
                currentSubs=[];
                sessionState.roleOf.Participant2 && currentSubs.push(sessionState.roleOf.Participant2);
                break;
            case 'Actor2':
                currentSubs=[];
                sessionState.roleOf.Participant1 && currentSubs.push(sessionState.roleOf.Participant1);
                break;
            case 'Room3A':
                currentSubs=[];
                sessionState.roleOf.Room3B && currentSubs.push(sessionState.roleOf.Room3B);
                break;
            case 'Room3B':
                currentSubs=[];
                sessionState.roleOf.Room3A && currentSubs.push(sessionState.roleOf.Room3A);
                break;
            case 'Room4A':
                currentSubs=[];
                sessionState.roleOf.Room4B && currentSubs.push(sessionState.roleOf.Room4B);
                break;
            case 'Room4B':
                currentSubs=[];
                sessionState.roleOf.Room4A && currentSubs.push(sessionState.roleOf.Room4A);
                break;
             case 'Room5A':
                currentSubs=[];
                sessionState.roleOf.Room5B && currentSubs.push(sessionState.roleOf.Room5B);
                break;
            case 'Room5B':
                currentSubs=[];
                sessionState.roleOf.Room5A && currentSubs.push(sessionState.roleOf.Room5A);
                break;
            default:
                break;
        }
        //Add Admin to currentSubs if applicable
        if (sessionState.AdminVisible) {
        currentSubs.push ("Admin");
    }
    }
    

    
    function setTracks() {
        return new Promise( (resolve) => {
            //cycle through each participant in meeting
            let ps = callFrame.participants();
            numberInMeeting=Object.keys(ps).length;
            Object.keys(ps).forEach((p) => {
                let participant = ps[p];
                let thisUserName = participant.user_name;
                
                if (p === 'local' || !participant.owner) {
                    return;
                } 


                //If session is not active, subscribe to everyone in the meeting
                if (!sessionState.isActive) {
                    if (!thisUserName.includes('Audio') && thisUserName!='Admin') {  // && thisUserName!=mutedParticipant
                        console.log('Subscribing to: ' + thisUserName);
                        callFrame.updateParticipant(participant.session_id,{ setSubscribedTracks : true});
                        subscribedTo++;
                    } else if (thisUserName=='Admin' && sessionState.AdminVisible) {
                        console.log('Subscribing to Admin:');
                        callFrame.updateParticipant(participant.session_id,{ setSubscribedTracks : true});
                        subscribedTo++;
                    } else {
                        console.log('NOT subscribing to: ' + thisUserName);
                        callFrame.updateParticipant(participant.session_id,{ setSubscribedTracks : false});
                    }

                } 

                //Otherwise, just subscribe to those listed in currentSubs;
                else if (sessionState.isActive) {
                    if(currentSubs.includes(thisUserName)) {
                        console.log('Subscribing to: ' + thisUserName);
                        callFrame.updateParticipant(participant.session_id,{ setSubscribedTracks : true});
                        subscribedTo++;
                    }
                    else if (!currentSubs.includes(thisUserName)) {
                        console.log('NOT subscribing to: ' + thisUserName);
                        callFrame.updateParticipant(participant.session_id,{ setSubscribedTracks : false});
                    }
                }
            });
            resolve()
        })
    }
    
    setTracks().then(()=>{
        //if no admin (or admin has left), start asking for state
        if (adminPresent==false) {
            sessionState.isKnown=false;
            if (typeof(stateRequest)!='undefined') {clearInterval(stateRequest);}
            stateRequest = setInterval(getState,2500);
            console.log('no Admin present');
        }
        if (subscribedTo==0) {
            window.isPopulated = false;
            document.getElementById('empty-room').style.opacity='1';
            if(!!document.querySelector("#root > div > div.daily-videos-wrapper > div.daily-video-div.remote.cam.cam-muted.mic-muted")){document.querySelector("#root > div > div.daily-videos-wrapper > div.daily-video-div.remote.cam.cam-muted.mic-muted").style.visibility='hidden';}
            if (sessionState.isActive==true) {
                document.getElementById('empty-text').innerHTML="Hold that thought! 😐 <br><br> We're working to fix a connection problem."
            } else if (sessionState.isActive==false) {
                document.getElementById('empty-text').innerHTML="👋 <br>You're here!<br>Waiting for everyone else..."

            }
        } else if (subscribedTo>0) {
            window.isPopulated = true;
            document.getElementById('empty-room').style.opacity='0';
            if (document.querySelector("#root > div > div.daily-videos-wrapper > div.daily-video-div.remote.cam.cam-muted.mic-muted")){
                document.querySelector("#root > div > div.daily-videos-wrapper > div.daily-video-div.remote.cam.cam-muted.mic-muted").style.visibility='visible';
            }

        }

    })

    //print subscriptions
    var iterator = currentSubs.values();
    console.log("Currently subscribed to:");
    for (let elements of iterator) { 
        console.log(elements); 
    } 
    if (currentSubs.length < 1) {
        console.log ("No one.")
    }
};

