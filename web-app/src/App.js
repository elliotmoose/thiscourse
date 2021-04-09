import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  Redirect
} from "react-router-dom"; 
import CreateSession from './components/CreateSession';
import Discussion from './components/Discussion';


class App extends Component {
  render() {
    return (
      <div className="container">
        <Router>
        {/*All our Routes goes here!*/}
        <Route path="/" exact={true} component={CreateSession} />
        <Route path="/discussion" component={Discussion} />
        </Router>
      </div>
    );
  }
}

 
export default App;
