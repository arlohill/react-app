import React, { useEffect, useState } from 'react';
import "./Dialogue.css";


export default function Dialogue({ show, title, description, confirm, cancel, confirmText, action }) {


  if (! show) {
    return <></>;
  }     
  

  return (

  <>
  
  <div className="overlay">
    <div className={"dialog " + action}>
      <div className="dialog__content">
        <h2 className="dialog__title">{title}</h2>
        <p className="dialog__description">
          {description}
        </p>
      </div>
      <hr />
      <div className="dialog__footer">
        <button className="dialog__cancel" onClick={cancel}>Cancel</button>
        <button className={"dialog__confirm "+action} onClick={confirm}>{confirmText}</button>
      </div>
    </div>
  </div>
</>


  );
}
