import React, { Component, Provider } from 'react';
import { BrowserRouter as Router, Switch, Route, Routes, Navigate } from 'react-router-dom';
import AppGeneral from '../General/AppGeneral/AppGeneral';
import AppLivestorm from '../Livestorm/AppLivestorm/AppLivestorm';
import AppLivestormTestHome from '../LivestormTest/LivestormTestHome'
import DemoHome from '../Demo/DemoHome'


class App extends Component {
  render() {
    return (

         
          <Routes>

              <Route  path='/' element={<AppGeneral />} />
              <Route path='/livestorm' element={<AppLivestorm />} />
              <Route path='/livestorm-test/*' exact strict render={props => <Navigate to={`${props.location.pathname}/`} />} element={<AppLivestormTestHome /> } />
              <Route path='/demo/*' exact strict render={props => <Navigate to={`${props.location.pathname}/`} />} element={<DemoHome /> } />


          </Routes>
    
    );
  }
}

export default App;