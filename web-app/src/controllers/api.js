import User from './user';

const ioclient = require('socket.io-client');

const SERVER_DOMAIN = `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}`;
console.log("Server: ", SERVER_DOMAIN);
const EventEmitter = require('events');
class APIEventEmitter extends EventEmitter {}
let apiEventEmitter = new APIEventEmitter();

let clientSocket;
let nodeData;
let isHost = false;
let inSession = false;
let isOnline = false;

function getNodeData() {
    return nodeData;
}

function setNodeData(_nodeData) {
    nodeData = _nodeData;
}

function setIsHost(_isHost) {
    isHost = _isHost;
}
function getIsHost() {
    return isHost;
}

function setIsOnline(_isOnline) {
    isOnline = _isOnline;
    apiEventEmitter.emit('update-is-online');
}
function getIsOnline() {
    return isOnline;
}

function isInSession() {
    return inSession;
}

function setInSession(_inSession) {
    inSession = _inSession;
}

async function createSession(username, discourse) {
    if(!username) {
        alert("Please login again");        
    }

    if(!discourse) {
        alert("Please enter a question");
    }
    let res = await fetch(`${SERVER_DOMAIN}/api/create-session`, {
        method: 'POST',
        body: JSON.stringify({ username, discourse }),
        headers: { 'Content-Type': 'application/json' }
    })

    let response = await res.json();
    return response;
}

async function joinOrRestartSession(username, roomId) {
    if(!username || !roomId) {
        console.error('no username or roomid specified');
        return;
    }

    try {
        let res = await fetch(`${SERVER_DOMAIN}/api/join-restart-session`, {
            method: 'POST',
            body: JSON.stringify({ username, roomId }),
            headers: { 'Content-Type': 'application/json' }
        })
    
        let response = await res.json();
        return response;
    } catch (error) {
        return {
            error: error.message
        }
    }
}

async function loadDashboard(username) {
    if(!username) return {
        error: 'no username provided'
    };

    let res = await fetch(`${SERVER_DOMAIN}/api/load-dashboard`, {
        method: 'POST',
        body: JSON.stringify({ username }),
        headers: { 'Content-Type': 'application/json' }
    })

    let response = await res.json();
    return response;
}


function socketConnect(roomId) {
    return new Promise((resolve, reject) => {
        clientSocket = new ioclient(`${SERVER_DOMAIN}/${roomId}`);
        clientSocket.on('connect', resolve);
        clientSocket.on('disconnect', ()=>{
            console.log('==CLIENT DISCONNECT EVENT')
            setIsOnline(false);                        
        });
        clientSocket.on('error', (data)=>alert(data));
        clientSocket.on('nodes-update', (data) => {
            if(!data || !data.nodes) {
                console.log('updated with null');
                console.log(data.nodes)
                return;
            }
            console.log(`= client: data received (${Object.values(data.nodes).length} node(s))`);
            setNodeData(data.nodes);
            apiEventEmitter.emit('nodes-update', data.nodes);
        });

        clientSocket.on('check-is-owner', (ownerId)=>{
            if(ownerId === User.getUsername()) {
                clientSocket.emit('claim-ownership', ownerId);
            }
        });
    })
}

function socketDisconnect() {
    console.log('=== disconnecting...')
    if(clientSocket) {
        clientSocket.disconnect();
        clientSocket = undefined;
    }
    setInSession(false);
}

async function requestNodeData(roomId) {
    if(clientSocket === undefined) {
        console.warn('No socket found: reconnecting...');
        await socketConnect(roomId);
    }   
    
    clientSocket.emit('get-nodes', { roomId });
}

async function addNode(username, question, parentId, roomId) {
    if(clientSocket === undefined) {
        console.error('No socket found: could not connect');
        await socketConnect(roomId);
    }   
    
    clientSocket.emit('add-node', { node: { username, question }, parentId, roomId});
}

async function markAsCorrectAnswer(answerId, nodeId, roomId) {
    if(clientSocket === undefined) {
        console.error('No socket found: could not connect');
        await socketConnect(roomId);
    }   
    
    clientSocket.emit('mark-answer', { answerId, nodeId, roomId});
}


function addAnswer(username, answerContent, nodeId, roomId) {
    if(clientSocket === undefined) {
        console.error('No socket found: could not connect');
        return {};
    }   
    
    clientSocket.emit('answer', { answer: { username, content: answerContent}, nodeId, roomId});    
}

function voteAnswer(isUpVote, username, answerId, nodeId, roomId) {
    if(clientSocket === undefined) {
        console.error('No socket found: could not connect');
        return {};
    }   
    
    clientSocket.emit('vote-answer', { up: isUpVote, username, answerId, nodeId, roomId });    
}

async function registerUser(username, roomId) {
    let res = await fetch(`${SERVER_DOMAIN}/api/register-user`, {
        method: 'POST',
        body: JSON.stringify({ username, roomId }),
        headers: { 'Content-Type': 'application/json' }
    })

    let response = await res.json();
    if(response.username) {
        return response.username;
    }
}

async function userLogin(username, password) {
    let res = await fetch(`${SERVER_DOMAIN}/api/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' }
    })

    let response = await res.json();
    if(response.success) {
        return true;
    }

    return false;
}

const API = { createSession, joinOrRestartSession, getIsOnline, setIsOnline, isInSession,setInSession, socketConnect, socketDisconnect, requestNodeData, addNode, addAnswer, apiEventEmitter, nodeData, getNodeData, setNodeData, getIsHost, setIsHost, markAsCorrectAnswer, registerUser, userLogin, voteAnswer, loadDashboard};
export default API;