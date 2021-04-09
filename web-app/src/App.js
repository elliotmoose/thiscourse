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
import API from './controllers/api';



class App extends Component {
  async componentDidMount() {
    let { url, secret } = await API.createSession('paolo', 'Can Artificial Intelligence Have Consciousness?');
    console.log(url, secret);
  }

  render() {
    return (
      <Router>
       {/*All our Routes goes here!*/}
       <Route path="/" component={CreateSession} />
      </Router>
    );
  }
}

 
export default App;
