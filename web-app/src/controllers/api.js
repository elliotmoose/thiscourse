import User from './user';

const ioclient = require('socket.io-client');

const SERVER_DOMAIN = `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}`;
console.log("Server: ", SERVER_DOMAIN);
const EventEmitter = require('events');
class APIEventEmitter extends EventEmitter {}
let apiEventEmitter = new APIEventEmitter();

let clientSocket;
let nodeData;
let hostOfSessionIds = [];

function getNodeData() {
    return nodeData;
}

function getIsHost(sessionId) {
    return hostOfSessionIds.indexOf(sessionId) != -1;
}

async function createSession(username, discourse) {
    if(!username || !discourse) return;
    let res = await fetch(`${SERVER_DOMAIN}/api/create-session`, {
        method: 'POST',
        body: JSON.stringify({ username, discourse }),
        headers: { 'Content-Type': 'application/json' }
    })

    let response = await res.json();
    response.roomId && hostOfSessionIds.push(response.roomId);
    return response;
}

async function joinSession(username, roomId) {
    if(!username || !roomId) return;

    let res = await fetch(`${SERVER_DOMAIN}/api/join-session`, {
        method: 'POST',
        body: JSON.stringify({ username, roomId }),
        headers: { 'Content-Type': 'application/json' }
    })

    if(res.status === 404) {
        return {
            error: 'room not found'
        }
    } 
    let response = await res.json();
    return response;
}

function socketConnect(roomId) {
    return new Promise((resolve, reject) => {
        clientSocket = new ioclient(`${SERVER_DOMAIN}/${roomId}`);
        clientSocket.on('connect', resolve);
        clientSocket.on('error', (data)=>alert(data));
        clientSocket.on('nodes-update', (data) => {
            if(!data || !data.nodes) {
                console.log('updated with null');
                console.log(data.nodes)
                return;
            }
            console.log(`= client: data received (${Object.values(data.nodes).length} node(s))`);
            nodeData = data.nodes;
            apiEventEmitter.emit('nodes-update', data.nodes);
        });
    })
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

const API = { createSession, joinSession, socketConnect, requestNodeData, addNode, addAnswer, apiEventEmitter, nodeData, getNodeData, getIsHost, markAsCorrectAnswer, registerUser, voteAnswer};
export default API;