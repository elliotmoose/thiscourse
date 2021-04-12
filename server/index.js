const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())
app.options('*', cors())
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
const uuid = require('uuid');
const rwords = require('random-words');
let rooms = {}

const SERVER_PORT = 9000;

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
        answers: {},
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
    
    roomNodes[nodeId].answers[answer.id] = answer;
}

function voteAnswer(isUpVote, answerId, nodeId, roomNodes) {
    if(roomNodes[nodeId] === undefined) {
        throw `invalid node: not found ${nodeId}`;
    }

    if(roomNodes[nodeId].answers[answerId] === undefined) {
        throw `invalid answer: not found ${answerId}`;
    }

    if (isUpVote) {
        roomNodes[nodeId].answers[answerId].thumbsUp += 1
    } 
    else {
        roomNodes[nodeId].answers[answerId].thumbsDown += 1
    }
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

        //test
        let roomNodes = rooms[roomId].nodes;

        //test
        let lastNodeId = root.id;

        for(let i=0;i<2;i++) {
            let child1 = createNode(`test question: ${i}`, username, lastNodeId);
            let child2 = createNode(`test question: ${i}`, username, lastNodeId);
            insertNode(child1, lastNodeId, roomNodes);
            insertNode(child2, lastNodeId, roomNodes);

            for(let j=0; j<10; j++) {
                let answer = createAnswer(`test answer ${j}`, username);
                insertAnswer(answer, child1.id, roomNodes);
                insertAnswer(answer, child2.id, roomNodes);
            }

            // console.log(child1)
            lastNodeId = child1.id;
        }


        // res.json({ url: `http://${WEBAPP_DOMAIN}/${roomId}`, secret });
        res.json({ roomId, secret });
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

        if(!rooms[roomId]) {
            console.log(`* server: Could not find room id: ${roomId}`);
            return;
        }
        let roomNodes = rooms[roomId].nodes;
        let node = createNode(question, username, parentId);
        try {
            insertNode(node, parentId, roomNodes);

            //test
            let lastNodeId = node.id;
            for(let i=0;i<2;i++) {
                let child1 = createNode(question, username, lastNodeId);
                let child2 = createNode(question, username, lastNodeId);
                insertNode(child1, lastNodeId, roomNodes);
                insertNode(child2, lastNodeId, roomNodes);
                // console.log(child1)
                lastNodeId = child1.id;
            }

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

    socket.on('vote-answer', (data) => {
        let { nodeId, answerId, roomId, up } = data;
        let roomNodes = rooms[roomId].nodes
        try {
            voteAnswer(up, answerId, nodeId, roomNodes);
        } catch (error) {
            console.log(error);
        }
    })
});

server.listen(SERVER_PORT, () => {
    console.log(`listening on *:${SERVER_PORT}`);
});


//------------------------------------------------------------------------------------------------
// CLIENT SOCKET IO
//------------------------------------------------------------------------------------------------
const ioclient = require('socket.io-client');
const fetch = require('node-fetch');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time);
    })    
}
setTimeout(async () => {
    let res = await fetch(`http://localhost:${SERVER_PORT}/api/create-session`, {
        method: 'POST',
        body: JSON.stringify({ discourse: 'Can AI Have intelligence?', username: 'Paolo' }),
        headers: { 'Content-Type': 'application/json' }
    })

    let { roomId, secret } = await res.json();
    console.log(`= client: USER GOES TO: ${roomId} AND SAVE SECRET: ${secret}`);
    // let split = roomId.split('/');
    // let roomId = split[split.length - 1];

    clientSocket = new ioclient(`http://localhost:${SERVER_PORT}`);
    
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