import { useState, useContext, useEffect } from "react";
import SessionStateContext from '../SessionStateContext';
import MyContext from '../MyContext';
import CallObjectContext from '../CallObjectContext'



function useUpdateUserList() {

    const [test, setTest] = useState(0);
    const update = () => setTest((prev)=>prev+1);
    window.update=update;

    const callObject = useContext(CallObjectContext);
    const { session } = useContext(SessionStateContext);
    const [ sessionState,setSessionState] = session;    
    const { myStateArray, 
        // setName, 
        // setRole,
        setUserList,
        // setViewMode,
        // setCamOnAtSessionStart,
        // setMicOnAtSessionStart,
        // setAmAdmin, 
        setAdminPresent,
        } = useContext(MyContext);
    const [ myState,setMyState ] = myStateArray;



    useEffect(()=> {

        function getUserList() {

            return new Promise((resolve)=>{

                console.log('*****UPDATING PARTICIPANT LIst******');
                let userListIncludesAdmin=false;   //default
                let ps=callObject.participants(); 
                let workingUserList = {
                    names: [myState.name],
                    sessionIdFor: {},
                }
            
                for (const p in ps) {
                    if (p!=='local') {
                        let thisUserName = ps[p].user_name;
                        let thisSessionId = ps[p].session_id;
                        workingUserList.names.push(thisUserName);      //add each user_name with its sessionID to UserList
                        workingUserList.sessionIdFor[thisUserName] = thisSessionId;
                        if (thisUserName.includes('_Admin')) {
                            userListIncludesAdmin = true;
                        } 
                    };
                };
            
                userListIncludesAdmin ? console.log('Admin IS present') : console.log('Admin IS NOT present');
                workingUserList.names.sort();       //alphebetize that list 
                console.log(`here's the userList: ${workingUserList.names}`);
                resolve([workingUserList,userListIncludesAdmin]);
            });
        }

    console.log('going to get user list');

    getUserList().then(([workingUserList,userListIncludesAdmin])=>{
        console.log(`************now the userList is: ${workingUserList.names}`);  //print userList
        setUserList(workingUserList);
        console.log(`userListIncludesAdmin: ${userListIncludesAdmin}`)
        setAdminPresent(userListIncludesAdmin);

    })
        

    },[sessionState,test,callObject.participants()]);

    

} 

export default useUpdateUserList;
