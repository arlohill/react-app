import React, { useEffect, useState } from 'react';
import "./AppLibrary.css";
import VideoElement from "../VideoElement/VideoElement";
import $ from 'jquery';
import { IoDownloadOutline } from "react-icons/io5";
import { IoIosShareAlt, IoIosTrash } from "react-icons/io";
import Dialogue from "../Dialogue/Dialogue"
import axios from 'axios'






export default function AppLibrary() {



  const [videoArray, setVideoArray] = useState([]);
  const [showDeleteDialogue, setShowDeleteDialogue] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [showShareDialogue, setShowShareDialogue] = useState(false);
  const [idToShare, setIdToShare] = useState(null);


  async function getVideos() {
    const results = await axios.get('/.netlify/functions/getFromMuxDEMO');
    results.data.message!='Error' && setVideoArray(results.data.message);
  } 

  useEffect(()=>{

    getVideos();


  //   $.ajax({
  //     url: "https://api.mux.com/video/v1/assets",
  //     beforeSend: function(xhr) { 
  //     // xhr.setRequestHeader("Authorization", "Basic " + btoa("768959a2-7b04-44c2-b584-5800ffc71297:7fB9Fa8rXoCKI3MNDloDusslbS6gwZMoHj6dZldFBNoFEhUTT/pr+c/aI+4S5kImvDtCrBkk14a")); //testing -- change also below and in Tray.js 
  //       xhr.setRequestHeader("Authorization", "Basic " + btoa("4100efdb-e648-4287-ad0a-50e9875a238b:TyiPEfPzEcz/tl/0sYh5ndPpNIwaom0mQaLRiDQ4E+pX1nH1Xl9XDJWXiPYtgx5QRfi/8ukakFh"));  //livestorm

  //     },
  //     type: 'GET',
  //     contentType: 'application/json',
  //     success: function (data) {
  //       // alert(JSON.stringify(data));
  //       window.test=data.data;
  //       setVideoArray(data.data);
  //     },
  //     error: function(){
  //       alert("Cannot get recordings");
  //     }
  // });

  },[])

  

  const promptForDelete = (id) => {
    setIdToDelete(id)
    setShowDeleteDialogue(true)
  }

  const promptForShare = (id) => {
    setIdToShare(id)
    setShowShareDialogue(true)
  }

  const deleteVideo = async function () {

    const results = await axios.post('/.netlify/functions/deleteFromMuxDEMO',
                      {assetId:idToDelete}
                    );
                    window.location.reload();
    
  }

  const copyLink = (link) => {
    setShowShareDialogue(false);
    copy(idToShare)
  }

  const cancel = ()=> {
    setShowDeleteDialogue(false);
    setShowShareDialogue(false);
  }

  function copy(text) {
    const cb = navigator.clipboard;
    cb.writeText(text);
  }

                      
  

  return (


    <div>
      <h2>Video library</h2>
      <div className='gallery'>
       
          {videoArray.map(item => 

            (
              <div >
                <VideoElement src={'https://stream.mux.com/'+item.playback_ids[0].id+'.m3u8'}/>
                <p>{(new Date(parseInt(item.created_at*1000))).toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toString()}
                <br /> 
                {/* <a href={'https://stream.mux.com/'+item.playback_ids[0].id+'/medium.mp4'} download="FileName">
                  <IoDownloadOutline size={20} title="Download" style={{cursor:"pointer",marginTop:"10px"}}/> 
                </a>
                &nbsp; &nbsp; &nbsp;  */}
                <IoIosShareAlt size={20} title="Share" onClick={()=>{promptForShare('https://stream.mux.com/'+item.playback_ids[0].id+'/medium.mp4')}} style={{cursor:"pointer",marginTop:"10px"}} />
                &nbsp; &nbsp; &nbsp; 
                <IoIosTrash size={20} title="Delete" onClick={()=>{promptForDelete(item.id)}} style={{cursor:"pointer" }} />
                </p> 
              </div>
            )
            
          )}

        <Dialogue 
        show={showDeleteDialogue}
        title="Delete video?"
        description={"Are you sure you wish to permanently delete this video?"}
        confirm={deleteVideo}
        cancel={cancel}
        confirmText="Yes, delete it"
        action='delete'
        />

      <Dialogue 
        show={showShareDialogue}
        title="Link for sharing:"
        description={idToShare}
        confirm={copyLink}
        cancel={cancel}
        confirmText="Copy to clipboard" 
        action="share"
        />

      </div>
    </div>


  );
}
