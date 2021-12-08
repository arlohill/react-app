import React, { useEffect, useRef, useContext, useState } from 'react';
import './StartScreen.css';
import InputSelector from '../InputSelector/InputSelector';
import MyContext from '../../../MyContext';



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
    const [showMicSettings,setShowMicSettings] = useState(false);
    const [showCamSettings,setShowCamSettings] = useState(false);
    const begin = props.onClick;
    const lobbyVideo = useRef(null);
    const micCaret = React.createRef();
    const micSettings = React.createRef();
    const camCaret = React.createRef();
    const camSettings = React.createRef();
    const [initialInputs,setInitialInputs] = useState(null);
    const [hasUserMedia,setHasUserMedia] = useState(true);
    const { myStateArray, 
      setName, 
      setRole,
      setUserList,
      setViewMode,
      setCamOnAtSessionStart,
      setMicOnAtSessionStart,
      setAmAdmin, 
      setNumber,
    } = useContext(MyContext);
    const [ myState,setMyState ] = myStateArray;
  

    useEffect(()=> {

      document.addEventListener("mousedown", handleClickOutside);
  
  
      return function cleanup() {
          document.removeEventListener("mousedown", handleClickOutside);
          };
    })

    const handleClickOutside = (event) => {
      console.log('handling click');
      if (micSettings.current &&
        !micSettings.current.contains(event.target) &&
        !micCaret.current.contains(event.target)
      ) {
        setShowMicSettings(false);
      } else if (camSettings.current &&
        !camSettings.current.contains(event.target) &&
        !camCaret.current.contains(event.target)
      ) {
        setShowCamSettings(false);
      } 
      
    }
 
    

  function setMyName() {
      console.log('setting user ID as ' + myState.name);
      if (myState.name === '' || myState.name==='Your first name' || myState.name.length<=1) {
        alert('Please enter your name to help your partner identify you.')
      } else {
        myState.name = myState.role === 'Admin' ? myState.name + '_Admin' : myState.name; //apend '_Admin" to my name if I'm an admin
        window.myName=myState.name; //todo: delete. for debugging purposes.
        begin();
      }
  }
useEffect(()=>{
  navigator.mediaDevices.getUserMedia({audio:true,video:{width: 1280,height: 720}}).then((mediaStream)=>{
    if(mediaStream){
      window.mediaStream = mediaStream;
      let localAudio = mediaStream.getAudioTracks()[0];
      let localVideo = mediaStream.getVideoTracks()[0];  
      setInitialInputs([localAudio,localVideo]);
      window.localAudio=localAudio;
      setHasUserMedia(true);
    } else {
      setHasUserMedia(false);
    }
  }).catch( err => {
    console.log("You got an error:" + err);
    setHasUserMedia(false);
});

}

,[])

useEffect(()=>{
  initialInputs && lobbyVideo.current && (lobbyVideo.current.srcObject=new MediaStream(initialInputs));
  lobbyVideo.current.muted=true;
  window.initialInputs=initialInputs;
},[initialInputs]);
    

        // if(localAudio && localAudio.length > 0)
        //     {
        //       newCallObject.join({ url, userName:window.myName, audioSource: localSrc[0]});
        //     }
        //     else {}:

  
  const handleChange = e => {
    let newName = e.target.value;
    setName(newName);
}


    return (
    <div className='container'>

        <div className='start-screen-background'></div>
  
        <div className='instructions'> 
            <div className='fixed-width'>
          
                <h2>Welcome to SecondBody.</h2>

               

                <div style={{position:'relative', marginLeft:'180px', marginRight:'180px', padding: '20px', paddingTop:'40px', border: '4px solid whitesmoke', backgroundColor:'white'}}>
                      <div style={{background:'white',opacity:'1',zIndex:'1000'}}>
                      
                      
                {hasUserMedia ? 

                    <video className='lobby-video' autoPlay={true} ref={lobbyVideo}/>
                    :
                    <p style={{height:'198px',width:'352px',borderRadius:'20px',background:'black',margin:'auto',color:'white',fontWeight:'bolder', boxSizing:'border-box',padding:'24px',border:'2px yellow solid'}}>
                    ❌ Your camera / mic is blocked ❌<br/><br/>Please give this site access to your camera and mic, and then <u style={{cursor:'pointer'}} onClick={(()=>{window.location.reload()})}>refresh the page.</u>
                    <br/><br/>
                    How?
                    <br/>
                    <ul>
                      <li>
                          <a target='_blank' href='https://downloads.intercomcdn.com/i/o/193872927/17dc7d06694d2c9bcd47b17a/Web+Meeting+Permissions+Blocked+Modal.jpg?'>
                          Option 1
                          </a>
                      </li>
                      <li>
                          <a href={'https://youtu.be/GceAjizU5WU?t=39'}  target='_blank'>Option 2</a>
                      </li>
                      </ul>
                      </p>
                  }
                      
                      

             {/* <img src={Unblock} style={{width:'100px'}} /> */}
                      
                      
                      {lobbyVideo.current && hasUserMedia && (
                          <div style={{position:'relative',display:'flex',flexDirection:'row',justifyContent:'center',bottom:'40px', width:'250px',height:'0px',margin:'auto'}}>
                              <div >
                                <p className="selector-button" onClick={()=>{setShowCamSettings(!showCamSettings)}} ref={camCaret}>Select Camera ^</p>
                                    {showCamSettings ? 
                                    (<div onClick={()=>setShowCamSettings(false)}style={{position:'relative',bottom:'0px',left:'80px'}}>
                                      <InputSelector type='video' page='intro' inputs={[initialInputs,setInitialInputs]} ref={camSettings} />
                                    </div>)
                                    : 
                                    null}
                              </div>
                              <div style={{width:'15px'}}></div>

                              <div>
                                <p className="selector-button" onClick={()=>{setShowMicSettings(!showMicSettings)}} ref={micCaret}>Select Mic ^</p>
                                    {showMicSettings ? 
                                      (<div onClick={()=>setShowMicSettings(false)} style={{position:'relative',bottom:'0px',left:'72px',overflowY:'visible'}}>
                                        <InputSelector type='audio' page='intro' ref={micSettings}  inputs={[initialInputs,setInitialInputs]}/>
                                      </div>)
                                    : 
                                    null}
                              </div>
                          </div>
                      )}

                  </div>
                    
                 { hasUserMedia && (
                    <h4 className='signin'>
            
                        <form onSubmit={(e)=>e.preventDefault()}>
                            <input type="text" autoComplete="off" style={{backgroundColor: 'rgb(230, 240, 249)', fontSize:'15px', width: '200px', height: '30px', textAlign:'center', fontFamily:'poppins'}} ref={userIDEl} value={myState.name} onFocus={()=> {if (myState.name==='Your first name') {setName('')}}} onChange={e=>handleChange(e)} /><br/><br/>
                            <input className='new-card' style={{width:'150px', color:'#1b8bc4', fontSize: '17px'}} type="submit" type="submit" value='Enter session' onClick={setMyName} />
                        </form>

                        <br/>
                    </h4>
                  )}
                    
                </div>
        
  
            </div>
        </div>
  
    
  
       
    </div>
    );
  }

              
                




