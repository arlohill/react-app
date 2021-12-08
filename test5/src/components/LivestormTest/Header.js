import React from 'react';
import './Header.css';
import { BsFillPeopleFill , BsFillCollectionPlayFill } from "react-icons/bs";

export default function Header(props) {

const [hideHeader, setHideHeader] = props.headerState;



  if(hideHeader) {
    return null;
  } else {
    return (

      <div className='nav-bar'><div className='nav-buttons'>
      <a className='router-button' href='/livestorm-test'><BsFillPeopleFill size='30' style={{margin:'14px'}} /></a>
      <a className='router-button' href='/livestorm-test/library'><BsFillCollectionPlayFill size='30' style={{margin:'14px'}} /></a>
      </div></div>
        );
    }

  
}
