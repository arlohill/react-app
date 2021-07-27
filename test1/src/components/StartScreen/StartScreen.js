import React, { useEffect, useRef, useContext, useState } from 'react';
import './StartScreen.css';
import MyInfoContext from '../../MyInfoContext';



//   if (parent.myRole=='Actor') {
//     document.getElementById('instructions').remove();
//     document.getElementById('actor-instructions').style.visibility='visible';
//     let qrCode = '../images/Audio' + parent.myNumber + '.png';
//     document.getElementById('QR-code').src=qrCode;
//   }


/**
 * Props:
 * -
 * -
 */
 export default function StartScreen(props) {

    const userIDEl = useRef(null);
    const begin = props.onClick;
    const setMyInfo = useContext(MyInfoContext);
    const [ userID, setUserID ] = useState('Your first name');
    

    //   if (parent.myRole.includes('Viewer')) {
//     document.getElementById('welcome-instructions').innerHTML='You are in view-only mode. <br/><br/>Click below to enter. <br/><br/>  <button class="new-card" id="enter-button" onclick="setUserID()">Enter session</button>'
//   }

  function setMyName() {
      console.log('setting user ID as ' + userID);
    //   if (parent.myRole.includes('Viewer')) {   //enter session immediately if no need to enter name
    //     begin();
    //     return;
    //   }
      if (userID == '' || userID=='Your first name' || userID.length<=1) {
        alert('Please enter your name to help your partner identify you.')
      } else {
        setMyInfo({name: userID});  //pass it up to the parent
        begin();
      }
  }


  
  function onFieldChange(value) {
    setUserID(value);
    window.userID=userID;
}


    return (
    <div className='container'>

        <div className='start-screen-background'></div>
  
        <div className='instructions'> 
            <div className='fixed-width'>
          
                <h2>Welcome to SecondBody.</h2>

                <div style={{marginLeft:'180px', marginRight:'180px', padding: '20px', border: '4px solid whitesmoke'}}>
                    <h4 id='welcome-instructions'>
            
                        <form id='form' onSubmit={(e)=>e.preventDefault()}>
                            {/* <label for="userID"></label><br/><br/> */}
                            <input type="text" autoComplete="off" style={{backgroundColor: 'rgb(230, 240, 249)', fontSize:'15px', width: '200px', height: '30px', textAlign:'center', fontFamily:'poppins'}} ref={userIDEl} value={userID} onFocus={()=> {if (userID=='Your first name') {setUserID('')}}} onChange={e => onFieldChange(e.target.value)} /><br/><br/>
                            <input className='new-card' style={{width:'150px', color:'#1b8bc4', fontSize: '17px'}} type="submit" type="submit" value='Enter session' onClick={setMyName} />
                        </form>

                        <br/>
                    </h4>
                </div>
        
  
            </div>
        </div>
  
    
  
        {/* <div className='actor-instructions'>
                  
                  <div>
                    <h2>Welcome!</h2>
                    <p style={{fontSize: '22px'}}>Before entering, please load the in-ear audio on your smartphone:</p>
                </div>
                  
                    <div style={{position: 'relative', marginTop: '10px', marginLeft:'20%', marginRight:'20%', textAlign: 'center', border: '2px dashed #17b2ff'}}>
                        <div style={{margin:'20px'}}>
                            <p>
                                <u>Use your phone's camera to scan the QR code.</u>
                                <br/><br/>
                                Note: <br/>If you're using an iPhone, the link must be loaded in Safari, not Chrome.
                        
                            </p>
                            <img className='QR-code' src=''  />
                        </div>
                    </div>

                    <div>
                      <p style={{fontSize: '22px'}}><br/>Once the page has loaded on your phone, <span style={{textDecoration: 'underline', color: '#17b2ff', cursor: 'pointer'}} onclick='begin();'>click to enter.</span></p>
                    </div>
                    
        </div> */}
    </div>
    );
  }

              
                




