import React, { useContext, useEffect, useState } from 'react';
import './RoleSelector.css';
import setSubscriptions from '../../../../hooks/setSubscriptions';
import CallObjectContext from '../../../../CallObjectContext';
import SessionStateContext from '../../../../SessionStateContext';
import MyContext from '../../../../MyContext';




export default function RoleSelector(props) {
    const callObject = useContext(CallObjectContext);
    const { session } = useContext(SessionStateContext);
    const [ sessionState,setSessionState] = session;
    const role = props.role;
    const { myStateArray, 
        //   setName, 
        //   setRole,
        //   setUserList,
        //   setViewMode,
        //   setCamOnAtSessionStart,
        //   setMicOnAtSessionStart,
        //   setAmAdmin, 
          setNumber,
        } = useContext(MyContext);
  const [ myState,setMyState ] = myStateArray;
    
    // const sendState = () => {
    //     console.log ("Sending current state...");
    //     callObject.sendAppMessage(sessionState, '*'); 
    // }


    let handleRoleChange = (e) => {
        window.role=role;
        let newRole=e.target.id;
        let newName=e.target.value;
        setSessionState((prevState)=>(
            {
            ...prevState,
            roleOf: {
                    ...prevState.roleOf,
                    [newRole]: newName,
                    }
            }
            ))
        console.log (e.target.id + ' is now: ' + e.target.value);
        setSessionState(prev=>({
            ...prev,
            hasAnUpdate:true,
          }));
    }



    return (




    <form className='dropdown'>
            <select className='selector' id={role} onChange={handleRoleChange} value={sessionState.roleOf[role]}>            
            <option value={null}></option>
                {myState.userList.names && myState.userList.names.length>0 && myState.userList.names.map((user) => <option value={user}>{user.includes('_Admin') ? user.split('_Admin').join('') : user}</option>)}
            </select>
    </form>
                    

    );
  }

        