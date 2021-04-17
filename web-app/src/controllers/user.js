import API from "./api";

let username;
function setUsername(_username) {
    username = _username;
}

function getUsername() {
    return username;
}

async function registerIfNeeded(sessionId) {
    if(username) {
        return true;
    }
    
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

const User = { setUsername, getUsername, registerIfNeeded }
export default User;