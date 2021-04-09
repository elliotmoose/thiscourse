const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const uuid = require('uuid');
const rwords = require('random-words');
let rooms = {}


function createAnswer(content, username) {
    return {
        id: uuid.v4(),
        username,
        content,
        thumbsUp: 0,
        thumbsDown: 0,
        isAnswer: false
    }
}
function createNode(question, username, parentId=null) {
    return {
        id: uuid.v4(),
        question,
        username,
        answers: [],
        parentId
    }
}

function createRoom(root) {
    return {
        nodes: {
            [root.id]: root
        }
    }
}

function insertNode(node, parentId, roomNodes) {
    console.log(`* server: inserted node ${node.question} by ${node.username} into parent: ${parentId}`)
    let parent = roomNodes[parentId]
    if(parent === undefined) {
        throw `invalid parent: not found ${parentId}`;
    }
    
    roomNodes[node.id] = node;
}

function insertAnswer(answer, nodeId, roomNodes) {
    console.log(`* server: inserted answer ${answer.content} by ${answer.username} into node: ${nodeId}`);

    if(roomNodes[nodeId] === undefined) {
        throw `invalid node: not found ${nodeId}`;
    }
    
    roomNodes[nodeId].answers.push(answer);
}

//------------------------------------------------------------------------------------------------
// SERVER REST API
//------------------------------------------------------------------------------------------------

WEBAPP_DOMAIN = 'localhost:3000'
app.post('/api/create-session', (req, res) => {
    let { discourse, username } = req.body;
    roomId = uuid.v4();
    if (discourse === undefined || username === undefined) {
        res.status(401).send('Missing discourse or username');
    }
    else {
        let root = createNode(discourse, username);
        rooms[roomId] = createRoom(root);

        let secret = rwords({exactly: 4, wordsPerString:4, maxLength: 5, separator:'-'})[0];

        console.log(`* server: room created ${roomId}`);

        res.json({ url: `http://${WEBAPP_DOMAIN}/${roomId}`, secret });
    }
});


//------------------------------------------------------------------------------------------------
// SERVER SOCKET IO
//------------------------------------------------------------------------------------------------
io.on('connection', (socket) => {
    console.log('* server: user connected');

    //--------------------------------
    // GET NODES
    //--------------------------------
    socket.on('get-nodes', (data) => {
        console.log(`* server: data retrieval request received`);
        let { roomId } = data;
        socket.emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });
    })

    //--------------------------------
    // ADD NODE
    //--------------------------------
    socket.on('add-node', (data) => {
        let { node: { username, question} , parentId, roomId } = data;
        console.log(`* server: add node request received: question: ${question} by user: ${username} parentNode: ${parentId} `);
        let roomNodes = rooms[roomId].nodes
        let node = createNode(question, username, parentId);
        try {
            insertNode(node, parentId, roomNodes);
            socket.emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });            
        } catch (error) {
            console.log(error);
        }
    })
    
    //--------------------------------
    // ANSWER
    //--------------------------------
    socket.on('answer', (data) => {
        let { answer: { username, content} , nodeId, roomId } = data;
        console.log(`* server: answer request received: answer: ${content} by user: ${username} parentNode: ${nodeId} `);
        let roomNodes = rooms[roomId].nodes
        
        try {
            let answer = createAnswer(content, username);
            insertAnswer(answer, nodeId, roomNodes);
            socket.emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });            
        } catch (error) {
            console.log(error);
        }
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});


//------------------------------------------------------------------------------------------------
// CLIENT SOCKET IO
//------------------------------------------------------------------------------------------------
const ioclient = require('socket.io-client');
const fetch = require('node-fetch');

function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time);
    })    
}
setTimeout(async () => {
    let res = await fetch('http://localhost:3000/api/create-session', {
        method: 'POST',
        body: JSON.stringify({ discourse: 'Can AI Have intelligence?', username: 'Paolo' }),
        headers: { 'Content-Type': 'application/json' }
    })

    let { url, secret } = await res.json();
    console.log(`= client: USER GOES TO: ${url} AND SAVE SECRET: ${secret}`);
    let split = url.split('/');
    let roomId = split[split.length - 1];

    clientSocket = new ioclient(`http://localhost:3000`);
    
    let nodes = {}
    //1. get all data
    clientSocket.on('nodes-update', (data) => {
        nodes = data.nodes
        console.log(`= client: data received (${Object.values(data.nodes).length} node(s))`);
    });
    
    //2.
    clientSocket.emit('get-nodes', { roomId });
    
    await sleep(100);
    
    //3. create a test node
    let rootId = Object.keys(nodes)[0];
    clientSocket.emit('add-node', { node: { username: 'Elliot', question: 'What is Intelligence?' }, parentId: rootId, roomId});
    
    await sleep (100)
    let answerNodeId = Object.keys(nodes)[1];
    clientSocket.emit('answer', { answer: { username: 'Elliot', content: 'Intelligence is the ability to exhibit smart behaviour' }, nodeId: answerNodeId, roomId});    
    
    await sleep (100)
    // console.dir(nodes, { depth: null })
}, 100);