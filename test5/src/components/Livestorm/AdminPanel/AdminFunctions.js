export function sendState(sessionState,callObject) {
    console.log ("Sending current state...");
    callObject.sendAppMessage(sessionState, '*'); 
}


