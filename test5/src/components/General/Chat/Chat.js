import React, { useContext, useState, useEffect } from 'react';
import CallObjectContext from '../../../CallObjectContext';
import MyContext from '../../../MyContext';
import SessionStateContext from '../../../SessionStateContext';
import './Chat.css';

export default function Chat(props) {
  const callObject = useContext(CallObjectContext);
  const [inputValue, setInputValue] = useState('');
  const { session } = useContext(SessionStateContext);
  const [ sessionState,setSessionState] = session;
  const {myStateArray}  = useContext(MyContext);
  const [ myState ] = myStateArray;
  const chatHistory = sessionState.chatHistory;
  const setChatHistory = (newHistoryObject) => {
    setSessionState((prev)=>({
        ...prev,
        chatHistory:
          [
            ...prev.chatHistory,
            newHistoryObject,
          ]
    }))
  };
  const lastMessage = React.createRef();

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  function handleSubmit(event) {
    event.preventDefault();
    if (!inputValue) {return}
    callObject.sendAppMessage({ type:'chat', message: inputValue }, '*');
    const name = callObject.participants().local.user_name.includes('_Admin')
      ? callObject.participants().local.user_name.split('_Admin').join('')
      : callObject.participants().local.user_name;
    setChatHistory(
      {
        sender: name,
        message: inputValue,
      },
    );
    setInputValue('');
  }

  /**
   * Update chat state based on a message received to all participants.
   *
   */
  useEffect(() => {
    if (!callObject) {
      return;
    }

    function handleAppMessage(event) {
      const participants = callObject.participants();
      const name = participants[event.fromId].user_name.includes('_Admin')
      ? participants[event.fromId].user_name.split('_Admin').join('')
      : participants[event.fromId].user_name;
      event.data.type=='chat'&& setChatHistory(
        {
          sender: name,
          message: event.data.message,
        }
      );
      // Make other icons light up
      event.data.type=='chat'&& props.notification();
    }

    callObject.on('app-message', handleAppMessage);

    return function cleanup() {
      callObject.off('app-message', handleAppMessage);
    };
  }, [callObject, chatHistory]);

  useEffect(() => {}, [chatHistory]);

  function scrollToBottom() {
    lastMessage.current && lastMessage.current.scrollIntoView({behavior:"smooth"});
  }

  useEffect(()=>{
    scrollToBottom();
  },[chatHistory])
  
  

  return props.onClickDisplay ? (
    <div className="chat">
            <div>
          
            <div className="chat-history">
            {
                chatHistory.map((entry, index, array) => (
                  entry.sender == myState.Name || entry.sender == myState.name.split('_Admin').join('') 
                    ? 
                      (
                      (<div key={`entry-${index}`} className='my message'>
                      {entry.message}
                      </div>)
                      )
                    :

                      (
                        array[index-1] && entry.sender == array[index-1].sender 
                          ? 
                            (
                              <div key={`entry-${index}`} className='additional message'>
                                  {entry.message}
                            </div>
                            )
                          :
                            (
                              <div>
                              <div key={`name-label-${index}`} className='name-label'>
                                <b>{entry.sender}</b>:
                                </div>
                              <div key={`entry-${index}`} className='received message'>
                                {entry.message}
                              </div>
                            </div>
                            )
                      )

              ))}
              <div style={{ float:"left", clear: "both" }}
                ref={lastMessage}>
              </div>
          </div>
          
          </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="chatInput"></label>
        <input
          id="chatInput"
          className="chat-input"
          type="text"
          autoComplete="off"
          placeholder="Type your message here.."
          value={inputValue}
          onChange={handleChange}
        ></input>
        <button type="submit" className="send-chat-button">
          Send
        </button>
      </form>
    </div>
  ) : null;
}
