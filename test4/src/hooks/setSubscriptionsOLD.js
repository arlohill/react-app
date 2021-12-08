import { useEffect, useContext } from "react";
import SessionStateContext from '../SessionStateContext';
import MyContext from '../MyContext';
import CallObjectContext from '../CallObjectContext'


function useSetSubscriptions() {

    const callObject = useContext(CallObjectContext);
    const { session } = useContext(SessionStateContext);
    const [ sessionState,setSessionState] = session;    
    const { myStateArray, 
        // setName, 
        // setRole,
        // setUserList,
        // setViewMode,
        // setCamOnAtSessionStart,
        // setMicOnAtSessionStart,
        // setAmAdmin, 
      } = useContext(MyContext);
    const [ myState,setMyState ] = myStateArray;


    useEffect(()=> {

        const myRole = myState.role;
        let currentSubs = [];
        let viewMode = myState.viewMode;
    
        if (!sessionState) {return;}
    
        ///disable 'viewMode' unless session is active and I'm a viewer
        if(!sessionState.isActive || myRole.includes('Seller') || myRole.includes('Buyer') || myRole.includes('Shadow')) {
            viewMode = null;
        }
    
    
        console.log('Setting subscriptions...');
        // console.log('****My role is: ' + myRole);
        // console.log('viewMode is: ' + viewMode);
        let subscribedTo=0;
    
        
        //if session is active, set currentSubs according to my role
            if (!viewMode && sessionState.isActive) {
                switch (myRole) {
                    case 'Buyer1':
                        currentSubs=[];
                        sessionState.roleOf.Shadow1 && currentSubs.push(sessionState.roleOf.Shadow1); // see shadow1 if there is a shadow1
                        !sessionState.roleOf.Shadow1 && sessionState.roleOf.Seller && currentSubs.push(sessionState.roleOf.Seller); //otherwise, see the original seller
                        sessionState.roleOf.Buyer2 && currentSubs.push(sessionState.roleOf.Buyer2);
                        sessionState.roleOf.Buyer3 && currentSubs.push(sessionState.roleOf.Buyer3);
                        sessionState.roleOf.Buyer4 && currentSubs.push(sessionState.roleOf.Buyer4);

                        break;
                    case 'Buyer2':
                        currentSubs=[];
                        sessionState.roleOf.Shadow1 && currentSubs.push(sessionState.roleOf.Shadow1); // see shadow1 if there is a shadow1
                        !sessionState.roleOf.Shadow1 && sessionState.roleOf.Seller && currentSubs.push(sessionState.roleOf.Seller); //otherwise, see the original seller
                        sessionState.roleOf.Buyer1 && currentSubs.push(sessionState.roleOf.Buyer1);
                        sessionState.roleOf.Buyer3 && currentSubs.push(sessionState.roleOf.Buyer3);
                        sessionState.roleOf.Buyer4 && currentSubs.push(sessionState.roleOf.Buyer4);

                        break;
                    case 'Buyer3':
                        currentSubs=[];
                        sessionState.roleOf.Shadow1 && currentSubs.push(sessionState.roleOf.Shadow1); // see shadow1 if there is a shadow1
                        !sessionState.roleOf.Shadow1 && sessionState.roleOf.Seller && currentSubs.push(sessionState.roleOf.Seller); //otherwise, see the original seller
                        sessionState.roleOf.Buyer1 && currentSubs.push(sessionState.roleOf.Buyer1);
                        sessionState.roleOf.Buyer2 && currentSubs.push(sessionState.roleOf.Buyer2);
                        sessionState.roleOf.Buyer4 && currentSubs.push(sessionState.roleOf.Buyer4);

                        break;
                    case 'Buyer4':
                        currentSubs=[];
                        sessionState.roleOf.Shadow1 && currentSubs.push(sessionState.roleOf.Shadow1); // see shadow1 if there is a shadow1
                        !sessionState.roleOf.Shadow1 && sessionState.roleOf.Seller && currentSubs.push(sessionState.roleOf.Seller); //otherwise, see the original seller
                        sessionState.roleOf.Buyer1 && currentSubs.push(sessionState.roleOf.Buyer1);
                        sessionState.roleOf.Buyer2 && currentSubs.push(sessionState.roleOf.Buyer2);
                        sessionState.roleOf.Buyer3 && currentSubs.push(sessionState.roleOf.Buyer3);
                        break;
                    case 'Seller':
                        currentSubs=[];
                        sessionState.roleOf.Buyer1 && currentSubs.push(sessionState.roleOf.Buyer1);
                        sessionState.roleOf.Buyer2 && currentSubs.push(sessionState.roleOf.Buyer2);
                        sessionState.roleOf.Buyer3 && currentSubs.push(sessionState.roleOf.Buyer3);
                        sessionState.roleOf.Buyer4 && currentSubs.push(sessionState.roleOf.Buyer4);

                        break;
                    case 'Shadow1':
                    case 'Shadow2':
                    case 'Shadow3':
                    case 'Shadow4':
                        currentSubs=[];
                        sessionState.roleOf.Buyer1 && currentSubs.push(sessionState.roleOf.Buyer1);
                        sessionState.roleOf.Buyer2 && currentSubs.push(sessionState.roleOf.Buyer2);
                        sessionState.roleOf.Buyer3 && currentSubs.push(sessionState.roleOf.Buyer3);
                        sessionState.roleOf.Buyer4 && currentSubs.push(sessionState.roleOf.Buyer4);
                        sessionState.roleOf.Seller && currentSubs.push(sessionState.roleOf.Seller+'_AUDIO');
                        break;
                    case 'Attendee':
                        currentSubs=[];
                        break;
                    default:
                        currentSubs=[];
                        break;
                }
                //Add Admin to currentSubs if applicable
                if (sessionState.AdminVisible) {
                currentSubs.push ("Admin");
            }
    
            currentSubs.filter(function (str) {return str.indexOf(myState.name) === -1}) //don't include self
    
        }
    
        if(viewMode) {
    
            switch (viewMode) {
                case 'Seller':
                    currentSubs=[];
                    sessionState.roleOf.Seller && currentSubs.push(sessionState.roleOf.Seller);
                    sessionState.roleOf.Buyer1 && currentSubs.push(sessionState.roleOf.Buyer1);
                    sessionState.roleOf.Buyer2 && currentSubs.push(sessionState.roleOf.Buyer2);
                    sessionState.roleOf.Buyer3 && currentSubs.push(sessionState.roleOf.Buyer3);
                    sessionState.roleOf.Buyer4 && currentSubs.push(sessionState.roleOf.Buyer4);

                    break;
                case 'Shadow1':
                    currentSubs=[];
                    sessionState.roleOf.Shadow1 && currentSubs.push(sessionState.roleOf.Shadow1);
                    sessionState.roleOf.Buyer1 && currentSubs.push(sessionState.roleOf.Buyer1);
                    sessionState.roleOf.Buyer2 && currentSubs.push(sessionState.roleOf.Buyer2);
                    sessionState.roleOf.Buyer3 && currentSubs.push(sessionState.roleOf.Buyer3);
                    sessionState.roleOf.Buyer4 && currentSubs.push(sessionState.roleOf.Buyer4);

                    break;
                case 'Shadow2':
                    currentSubs=[];
                    sessionState.roleOf.Shadow2 && currentSubs.push(sessionState.roleOf.Shadow2);
                    sessionState.roleOf.Buyer1 && currentSubs.push(sessionState.roleOf.Buyer1);
                    sessionState.roleOf.Buyer2 && currentSubs.push(sessionState.roleOf.Buyer2);
                    sessionState.roleOf.Buyer3 && currentSubs.push(sessionState.roleOf.Buyer3);
                    break;
                case 'Shadow3':
                    sessionState.roleOf.Shadow3 && currentSubs.push(sessionState.roleOf.Shadow3);
                    sessionState.roleOf.Buyer1 && currentSubs.push(sessionState.roleOf.Buyer1);
                    sessionState.roleOf.Buyer2 && currentSubs.push(sessionState.roleOf.Buyer2);
                    sessionState.roleOf.Buyer3 && currentSubs.push(sessionState.roleOf.Buyer3);
                    sessionState.roleOf.Buyer4 && currentSubs.push(sessionState.roleOf.Buyer4);

                    break;
                case 'Shadow4':
                    currentSubs=[];
                    sessionState.roleOf.Shadow4 && currentSubs.push(sessionState.roleOf.Shadow4);
                    sessionState.roleOf.Buyer1 && currentSubs.push(sessionState.roleOf.Buyer1);
                    sessionState.roleOf.Buyer2 && currentSubs.push(sessionState.roleOf.Buyer2);
                    sessionState.roleOf.Buyer3 && currentSubs.push(sessionState.roleOf.Buyer3);
                    sessionState.roleOf.Buyer4 && currentSubs.push(sessionState.roleOf.Buyer4);

                    break;
                case 'All':
                    currentSubs=[];
                    sessionState.roleOf.Seller && currentSubs.push(sessionState.roleOf.Seller);
                    sessionState.roleOf.Shadow1 && currentSubs.push(sessionState.roleOf.Shadow1);
                    sessionState.roleOf.Shadow2 && currentSubs.push(sessionState.roleOf.Shadow2);
                    sessionState.roleOf.Shadow3 && currentSubs.push(sessionState.roleOf.Shadow3);
                    sessionState.roleOf.Shadow4 && currentSubs.push(sessionState.roleOf.Shadow4);
                    sessionState.roleOf.Buyer1 && currentSubs.push(sessionState.roleOf.Buyer1);
                    sessionState.roleOf.Buyer2 && currentSubs.push(sessionState.roleOf.Buyer2);
                    sessionState.roleOf.Buyer3 && currentSubs.push(sessionState.roleOf.Buyer3);
                    sessionState.roleOf.Buyer4 && currentSubs.push(sessionState.roleOf.Buyer4);

                    break;
                default:
                    currentSubs=[];
                    break;
            }
    
            currentSubs.filter(function (str) {return str.indexOf(myState.name) === -1}) //don't include self
        }
    
        
        function setTracks() {
    
            return new Promise( (resolve) => {
    
                //cycle through each participant in meeting
                let ps = callObject.participants();
                // console.log('The second participant is named: ' + Object.values(ps)[1].user_name);
                Object.keys(ps).forEach((p) => {
                    let participant = ps[p];
                    let thisUserName = participant.user_name;
    
                    if (p === 'local' || thisUserName==myState.name) {
                        return;
                    } 
        
    
                    //if SESSION STATE NOT KNOWN, don't subscribe to anyone yet
                    if (!sessionState.isKnown) {
                        callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : false});
                        return;
                    }
    
    
    
                    // console.log("This username is: " +thisUserName);
    
                    //If NOT ACTIVE, subscribe to everyone in the meeting
                    if (!sessionState.isActive) {
    
                            if (thisUserName=='InvisibleScreenShareWidget') {
                                console.log('Not subscribing to: ' + thisUserName);
                                callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : { audio: false, video: false, screenVideo: true, screenAudio: true}});
    
                            
                            } else {
                                console.log('Subscribing to: ' + thisUserName);
                                currentSubs.push(thisUserName);
                                // if (!callObject.participants()[participant.session_id].tracks.video.subscribed){ 
                                //     callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : false});  
                                // }
                                callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : true});
                                subscribedTo++;
                                }    
    
                        // }
    
    
    
                    } 
    
                    //IF ACTIVE (or selecting viewmode), just subscribe to those listed in currentSubs;
                    else if (sessionState.isActive || viewMode) {
                        if(currentSubs.includes(thisUserName+'_AUDIO')) {
                            console.log('Subscribing to audio only for: ' + thisUserName);
                            callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : { audio: true, video: false, screenVideo: false}});
                        }
                        else if(currentSubs.includes(thisUserName)) {
                            console.log('Subscribing to: ' + thisUserName);
                            callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : true});
                            subscribedTo++;
                        }
                        else if (!currentSubs.includes(thisUserName)) {
                            console.log('NOT subscribing to: ' + thisUserName + ', sessionID: ' + participant.session_id);
                            callObject.updateParticipant(participant.session_id,{ setSubscribedTracks : false});
                        }
                    }
                });
                resolve();
            })
        }
        
        setTracks().then(()=>{
            
            //remove screenshare widget from currentSubs array to not count it
            const index = currentSubs.indexOf('InvisibleScreenShareWidget');
            if (index > -1) {
              currentSubs.splice(index, 1);
            }
    
        //print subscriptions
        currentSubs.filter(function (str) {return str.indexOf(window.myName) === -1}) //don't include self
    
        var iterator = currentSubs.values();
        console.log("Currently subscribed to:");
        for (let elements of iterator) { 
            console.log(elements); 
        } 
        if (currentSubs.length < 1) {
            console.log ("No one.")
        }
    
        ///*** for debugging purposes
        window.viewMode = viewMode;
        window.currentSubs = currentSubs;
        window.numberOfSubs=window.currentSubs && window.currentSubs.filter(function (str) {return str.indexOf('_AUDIO') === -1}).filter(function (str) {return str.indexOf('_AUDIO') === -1}).filter(function (str) {return str.indexOf(window.myName) === -1}).length;
    
    
        })

    },[ sessionState.isActive,
        sessionState.roleOf,
        sessionState.isKnown,
        sessionState.AdminVisible,
        myState.role,
        myState.viewMode,
        myState.name,
        myState.userList]);  ///todo: make sure this doesn't mess anthing up; formerly, the dependencies were just myState and sessionState. userList is not referecenced in this useEffect
    

   
};

export default useSetSubscriptions;

