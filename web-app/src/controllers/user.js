
let username;
function setUsername(_username) {
    username = _username;
}

function getUsername() {
    return username;
}

const User = { setUsername, getUsername}
export default User;