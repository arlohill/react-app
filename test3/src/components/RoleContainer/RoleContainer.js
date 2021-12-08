import React, { useContext, useEffect, useState } from 'react';
import './RoleContainer.css';
import setSubscriptions from '../../hooks/setSubscriptions';
import CallObjectContext from '../../CallObjectContext';
import SessionStateContext from '../../SessionStateContext';



export default function RoleSelector(props) {
    const callObject = useContext(CallObjectContext);
    const { session } = useContext(SessionStateContext);
    const [ sessionState,setSessionState] = session;
    const setSubs = () => {setSubscriptions(callObject)};  
    const role = props.role;
    // const [selectedOption, setSelectedOption] = useState('');




    return (

        <div className='name-container'>
            {window.userList && window.userList.length>0 &&window.userList.map((user) => 
            <div className='name' value={user}>{user}</div>
            )}
        </div>


    );
  }

        