import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import AppGeneral from '../General/AppGeneral/AppGeneral';
import AppLivestorm from '../Livestorm/AppLivestorm/AppLivestorm'

class App extends Component {
  render() {
    return (
    <Router>
        <div>
         
          <Switch>
              <Route exact path='/' component={AppGeneral} />
              <Route path='/livestorm' component={AppLivestorm} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;