import React from 'react';
import './Header.css';
import { BsFillPeopleFill , BsFillCollectionPlayFill } from "react-icons/bs";

export default function Header(props) {

const [hideHeader, setHideHeader] = props.headerState;
const password = window.myP;


  if(hideHeader) {
    return null;
  } else {
    return (

      <div className='nav-bar'><div className='nav-buttons'>
      <a className='router-button' href={'/demo?P='+password}><BsFillPeopleFill size='30' style={{margin:'14px'}} /></a>
      <a className='router-button' href={'/demo/library?P='+password}><BsFillCollectionPlayFill size='30' style={{margin:'14px'}} /></a>
      </div></div>
        );
    }

  
}
