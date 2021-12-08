import React, { useContext, useState, useEffect } from 'react';
import CallObjectContext from '../../CallObjectContext';
import './Chat.css';

export default function Chat(props) {
  const callObject = useContext(CallObjectContext);
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  function handleSubmit(event) {
    event.preventDefault();
    callObject.sendAppMessage({ type:'chat', message: inputValue }, '*');
    const name = callObject.participants().local.user_name.includes('_Admin')
      ? callObject.participants().local.user_name.split('_Admin').join('')
      : callObject.participants().local.user_name;
    setChatHistory([
      ...chatHistory,
      {
        sender: name,
        message: inputValue,
      },
    ]);
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
      const name = callObject.participants().local.user_name.includes('_Admin')
      ? callObject.participants().local.user_name.split('_Admin').join('')
      : callObject.participants().local.user_name;
      event.data.type=='chat'&& setChatHistory([
        ...chatHistory,
        {
          sender: name,
          message: event.data.message,
        },
      ]);
      // Make other icons light up
      event.data.type=='chat'&& props.notification();
    }

    callObject.on('app-message', handleAppMessage);

    return function cleanup() {
      callObject.off('app-message', handleAppMessage);
    };
  }, [callObject, chatHistory]);

  useEffect(() => {}, [chatHistory]);

  return props.onClickDisplay ? (
    <div className="chat">
            <div className="chat-history">
          {
            chatHistory.map((entry, index) => (
            <div key={`entry-${index}`} className="messageList">
              <b>{entry.sender}</b>: {entry.message}
            </div>
          ))
          }
          </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="chatInput"></label>
        <input
          id="chatInput"
          className="chat-input"
          type="text"
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
