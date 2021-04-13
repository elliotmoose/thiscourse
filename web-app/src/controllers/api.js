const ioclient = require('socket.io-client');

const SERVER_DOMAIN = 'http://localhost:9000';
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
    let res = await fetch(`${SERVER_DOMAIN}/api/create-session`, {
        method: 'POST',
        body: JSON.stringify({ username, discourse }),
        headers: { 'Content-Type': 'application/json' }
    })

    let response = await res.json();
    response.roomId && hostOfSessionIds.push(response.roomId);
    return response;
}

function socketConnect() {
    return new Promise((resolve, reject) => {
        clientSocket = new ioclient(`${SERVER_DOMAIN}`);
        clientSocket.on('connect', resolve);
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
        await socketConnect();
    }   
    
    clientSocket.emit('get-nodes', { roomId });
}

async function addNode(username, question, parentId, roomId) {
    if(clientSocket === undefined) {
        console.error('No socket found: could not connect');
        await socketConnect();
    }   
    
    clientSocket.emit('add-node', { node: { username, question }, parentId, roomId});
}

async function markAsCorrectAnswer(answerId, nodeId, roomId) {
    if(clientSocket === undefined) {
        console.error('No socket found: could not connect');
        await socketConnect();
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

const API = { createSession, socketConnect, requestNodeData, addNode, addAnswer, apiEventEmitter, nodeData, getNodeData, getIsHost, markAsCorrectAnswer };
export default API;