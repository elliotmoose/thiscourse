const ioclient = require('socket.io-client');

const SERVER_DOMAIN = 'http://localhost:9000';

async function createSession(username, discourse) {
    let res = await fetch(`${SERVER_DOMAIN}/api/create-session`, {
        method: 'POST',
        body: JSON.stringify({ username, discourse }),
        headers: { 'Content-Type': 'application/json' }
    })

    return await res.json();
}

let clientSocket;
function socketConnect(onDataUpdateCallback) {
    return new Promise((resolve, reject) => {
        clientSocket = new ioclient(`${SERVER_DOMAIN}`);
        clientSocket.on('connect', resolve);
        clientSocket.on('nodes-update', (data) => {
            console.log(`= client: data received (${Object.values(data.nodes).length} node(s))`);
            onDataUpdateCallback(data.nodes);
        });
    })
}

function requestNodeData(roomId) {
    if(clientSocket === undefined) {
        console.error('No socket found: could not connect');
        return {};
    }   
    
    clientSocket.emit('get-nodes', { roomId });
}

function addNode(username, question, parentId, roomId) {
    if(clientSocket === undefined) {
        console.error('No socket found: could not connect');
        return {};
    }   
    
    clientSocket.emit('add-node', { node: { username, question }, parentId, roomId});
}


function addAnswer(username, answerContent, nodeId, roomId) {
    if(clientSocket === undefined) {
        console.error('No socket found: could not connect');
        return {};
    }   
    
    clientSocket.emit('answer', { answer: { username, content: answerContent}, nodeId, roomId});    
}

const API = { createSession, socketConnect, requestNodeData, addNode, addAnswer };
export default API;