import API from "./api";
const EventEmitter = require('events');
class UserEventEmitter extends EventEmitter {}
let userEventEmitter = new UserEventEmitter();

let username;
function setUsername(_username) {
    username = _username;
}

function getUsername() {
    return username;
}

function isLoggedIn() {
  return username !== undefined;
}

function login(_username, _password) {  
  username = _username;
  userEventEmitter.emit('login-update');
}

async function registerIfNeeded(sessionId) {
  if(!username) {
    console.error("WARNING: user not logged in");
  }
  return true;
  if(username) {
  }
  
  // throw new Error("Need to change implementation for registration");
  let attempted = false;

  while(!username) {
      let input = prompt(attempted ? 'Username Taken! Enter another username:' : 'Please enter a username');
      if(!input) {
        return false;
      }

      let responseusername = await API.registerUser(input, sessionId);
      if(responseusername) {
        username = responseusername;
        return true;
      }
      attempted = true;
    }            
}

const User = { login, setUsername, getUsername, registerIfNeeded, isLoggedIn, userEventEmitter }
export default User;