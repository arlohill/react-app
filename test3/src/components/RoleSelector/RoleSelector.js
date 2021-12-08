import React, { useContext, useEffect, useState } from 'react';
import './RoleSelector.css';
import setSubscriptions from '../../hooks/setSubscriptions';
import CallObjectContext from '../../CallObjectContext';
import SessionStateContext from '../../SessionStateContext';



export default function RoleSelector(props) {
    const callObject = useContext(CallObjectContext);
    const { session } = useContext(SessionStateContext);
    const [ sessionState,setSessionState] = session;
    const setSubs = () => {setSubscriptions(callObject,window.viewMode)};  
    const role = props.role;
    // const [selectedOption, setSelectedOption] = useState('');

    
    const sendState = () => {
        console.log ("Sending current state...");
        callObject.sendAppMessage(window.sessionState, '*'); 
    }


    let handleRoleChange = (e) => {
        window.sessionState.roleOf[e.target.id]=e.target.value;
        setSessionState((prevState)=>(
            {
            ...prevState,
            roleOf: {
                    ...prevState.roleOf,
                    [e.target.id]: e.target.value
                    }
            }
            ))
        console.log (e.target.id + ' is now: ' + e.target.value);
        sendState();
    
        let myNewRole = 'Attendee'; //default, if no role assigned
        for (const key in window.sessionState.roleOf) {
            if(window.sessionState.roleOf[key]==window.myName) {
                myNewRole = key;
            }
        }
        if (myNewRole!=window.myRole) {
            window.myRole = myNewRole;
              if (window.myRole.includes('1')) {
                  window.myNumber=1;
              } else if (window.myRole.includes('2')) {
                  window.myNumber=2;
              }
          }
            if(window.sessionState.isActive){
                // activateSession();  //rebuild UI for the newly assigned role, mid-session
            } 
            setSubs();
      }


    return (




    <form className='dropdown'>
            <select className='selector' id={role} onChange={handleRoleChange} value={sessionState.roleOf[role]}>            
            <option value={null}></option>
                {window.userList && window.userList.length>0 && window.userList.map((user) => <option value={user}>{user.includes('_Admin') ? user.split('_Admin').join('') : user}</option>)}
                </select>
    </form>
                    

    );
  }

        