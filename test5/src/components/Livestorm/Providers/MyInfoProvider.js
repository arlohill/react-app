import React, { useState } from "react";
import MyInfoContext from "../../MyInfoContext";

export default myInfoProvider = props => {
    const [state, setState] = useState({
        name: '',
        subscriptions: ['Admin'],
        role: 'Attendee',
    });
    
    return (
        <MyInfoContext.Provider
        value={{
            myInfo: state,
            setMyInfo: (newState) => 
                {
                setState(newState)
                }
                    
            }}
            >
                {props.children}
            </MyInfoContext.Provider>
    );
};