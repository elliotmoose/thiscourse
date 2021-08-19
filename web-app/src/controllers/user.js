import API from "./api";

const EventEmitter = require('events');
class UserEventEmitter extends EventEmitter {}
let userEventEmitter = new UserEventEmitter();

function setUsername(_username) {
  if(!_username) {
    localStorage.removeItem('username')  ;
  }
  else {
    localStorage.setItem('username', _username);
  }
}

function getUsername() {
    return localStorage.getItem('username');
}

function isLoggedIn() {
  return getUsername() !== null && getUsername() !== undefined;
}

async function login(_username, _password) {  
  let success = await API.userLogin(_username, _password);
  
  if(success) {
    setUsername(_username);
  }
  else {
    alert('Login failed: Wrong username or password');
  }

  userEventEmitter.emit('login-update');
}

async function logout() {
  setUsername(undefined);
  userEventEmitter.emit('login-update');
}

async function registerIfNeeded(sessionId) {
  if(!isLoggedIn()) {
    console.error("WARNING: user not logged in");
  }
  return true;
}

const User = { login, logout, setUsername, getUsername, registerIfNeeded, isLoggedIn, userEventEmitter }
export default User;