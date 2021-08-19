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
import Dashboard from './components/Dashboard';
import Discussion from './components/Discussion';
import Main from './components/Main';
import Login from './components/Login';
import User from './controllers/user';


function AuthRoute({component: Component, ...routeProps}) {
  return <Route {...routeProps} render={()=>{
    return User.isLoggedIn() ? <Component/> : <Redirect to="/login"/>
  }}/>
}
class App extends Component {

  state = {
    isLoggedIn: false
  }
  
  componentDidMount() {
    User.userEventEmitter.on('login-update', ()=>{
      this.setState({isLoggedIn: User.isLoggedIn()});
    });
  }
  
  render() {
    return (
      <div className="fullscreen">
        <Router>
        {/*All our Routes goes here!*/}
        <AuthRoute component={Dashboard} path="/" exact={true} />
        <Route path="/login" exact={true} component={Login} />
        <AuthRoute path="/session/:sessionId/" exact={true} component={Main} />
        <AuthRoute path="/session/:sessionId/discussion/:questionNodeId/" component={Discussion} />
        </Router>
      </div>
    );
  }
}

 
export default App;
