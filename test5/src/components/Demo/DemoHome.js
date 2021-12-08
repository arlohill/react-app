import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AppLivestorm from './App/AppLivestorm/AppDemo';
import Library from "./Library/AppLibrary/AppLibrary";
import Header from "./Header";



export default function DemoHome() {

  const [hideHeader , setHideHeader] = useState(false);

    return (
      <div>
      <Header headerState={[hideHeader,setHideHeader]} /> 

          <Routes>
              <Route path='/' element={<AppLivestorm headerState={[hideHeader,setHideHeader]} />} />
              <Route path='/library' element={<Library headerState={[hideHeader,setHideHeader]} />} />
          </Routes>
          </div>
  
   
    );
}