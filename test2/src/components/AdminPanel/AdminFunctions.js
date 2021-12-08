export function sendState(sessionState,callObject) {
    console.log ("Sending current state...");
    callObject.sendAppMessage(sessionState, '*'); 
}



// export function setViewMode(viewmode) {
 
//     currentSubs=[];

//     switch (viewMode) {
//         case 'All':
//                 currentSubs.push(sessionState.roleOf.Participant1);
//                 currentSubs.push(sessionState.roleOf.Participant2);
//                 currentSubs.push(sessionState.roleOf.Actor1);
//                 currentSubs.push(sessionState.roleOf.Actor2);
//             break;

//         case 'Room1':
//                 currentSubs.push(sessionState.roleOf.Participant1);
//                 currentSubs.push(sessionState.roleOf.Actor2);
//             break;

//         case 'Room2':
//                 currentSubs.push(sessionState.roleOf.Participant2);
//                 currentSubs.push(sessionState.roleOf.Actor1);
//             break;

//         case 'Actors':
//                 currentSubs.push(sessionState.roleOf.Actor1);
//                 currentSubs.push(sessionState.roleOf.Actor2);
//             break;

//         case 'Participants':
//             currentSubs.push(sessionState.roleOf.Participant1);
//             currentSubs.push(sessionState.roleOf.Participant2);
//             break;

//         case '1s':
//             currentSubs.push(sessionState.roleOf.Actor1);
//             currentSubs.push(sessionState.roleOf.Participant1);
//             break;

//         case '2s':
//                 currentSubs.push(sessionState.roleOf.Actor2);
//                 currentSubs.push(sessionState.roleOf.Participant2);
//             break;

//         case 'Room3':
//             currentSubs.push(sessionState.roleOf.Room3A);
//             currentSubs.push(sessionState.roleOf.Room3B);
//         break;

//         case 'Room4':
//             currentSubs.push(sessionState.roleOf.Room4A);
//             currentSubs.push(sessionState.roleOf.Room4B);
//         break;

//         case 'Room5':
//             currentSubs.push(sessionState.roleOf.Room5A);
//             currentSubs.push(sessionState.roleOf.Room5B);
//         break;

//         case 'None':
//             break;

//         default:
//             break;
//     }
//     setSubscriptions();
// }


// async function setAdminVis() {
//     var selection = document.getElementById('admin-vis');
//     sessionState.AdminVisible = selection.value;
//     console.log("Admin" + sessionState.AdminVisible ? " is " : " is not " + "visible");
//     sendState();
// }