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
const DB = require('./db/dbinit');
var admin = require("firebase-admin");
var serviceAccount = require(".thiscourse-e4fb1-firebase-adminsdk-ouh1i-a8116a739b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();
const db = new DB(firestore);

const fs = require('fs');
let fileString = fs.readFileSync('../web-app/.env').toString()
let rows = fileString.split('\n')
let env = {}
for(let row of rows) {
    let keyval = row.split('=');
    env[keyval[0]] = keyval[1];
}

WEBAPP_DOMAIN = `${env.REACT_APP_SERVER_HOST}:${env.REACT_APP_CLIENT_PORT}`
const io = require('socket.io')(server, {
    cors: {
      origin: WEBAPP_DOMAIN,
      methods: ["GET", "POST"]
    }
  });
const uuid = require('uuid');
const rwords = require('random-words');
let rooms = {}

const SERVER_PORT = env.REACT_APP_SERVER_PORT;

function createAnswer(content, username) {
    return {
        id: uuid.v4(),
        username,
        content,
        thumbsUp: [],
        thumbsDown: [],
        isAnswer: false
    }
}
function createNode(question, username, parentId=null) {
    return {
        id: uuid.v4(),
        question,
        username,
        answers: {},
        parentId,
        correctAnswerId: null
    }
}

function createRoom(root) {
    return {
        nodes: {
            [root.id]: root
        },
        users: {}
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

    // throw "thanks for your contribution"
    // let hasAnswered = Object.values(roomNodes[nodeId].answers).filter(e=>e.username=answer.username).length == 0;

    // if(hasAnswered) {
    //     throw "Already answered!"
    // }
    
    roomNodes[nodeId].answers[answer.id] = answer;
}

function voteAnswer(isUpVote, username, answerId, nodeId, roomNodes) {
    if(roomNodes[nodeId] === undefined) {
        throw `invalid node: not found ${nodeId}`;
    }

    if(roomNodes[nodeId].answers[answerId] === undefined) {
        throw `invalid answer: not found ${answerId}`;
    }

    let answer = roomNodes[nodeId].answers[answerId];

    let userPrevVoteIndex = answer.thumbsUp.indexOf(username);
    if(userPrevVoteIndex != -1) {
        answer.thumbsUp.splice(userPrevVoteIndex, 1);
    }

    userPrevVoteIndex = answer.thumbsDown.indexOf(username);
    if(userPrevVoteIndex != -1) {
        answer.thumbsDown.splice(userPrevVoteIndex, 1);
    }

    if (isUpVote) {
        answer.thumbsUp.push(username);        
    } 
    else {
        answer.thumbsDown.push(username);     
    }
}

function markAnswerAsCorrect(answerId, nodeId, roomNodes) {
    if(roomNodes[nodeId] === undefined) {
        throw `invalid node: not found ${nodeId}`;
    }

    if(roomNodes[nodeId].answers[answerId] === undefined) {
        throw `invalid answer: not found ${answerId}`;
    }

    roomNodes[nodeId].correctAnswerId = answerId;
}

//------------------------------------------------------------------------------------------------
// SERVER REST API
//------------------------------------------------------------------------------------------------
app.get('/', (req,res) => {
    res.send("=== Thiscourse REST API");
});

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
        // let lastNodeId = root.id;

        // for(let i=0;i<2;i++) {
        //     let child1 = createNode(`test question: level ${i} child 1`, username, lastNodeId);
        //     let child2 = createNode(`test question: level ${i} child 2`, username, lastNodeId);
        //     insertNode(child1, lastNodeId, roomNodes);
        //     insertNode(child2, lastNodeId, roomNodes);

        //     for(let j=0; j<10; j++) {
        //         let answer1 = createAnswer(`test answer ${i},${j}, child 1`, username);
        //         insertAnswer(answer1, child1.id, roomNodes);
        //         let answer2 = createAnswer(`test answer ${i},${j}, child 2`, username);
        //         insertAnswer(answer2, child2.id, roomNodes);

        //         if(i == 1 && j == 6) {
        //             markAnswerAsCorrect(answer2.id, child2.id, roomNodes);
        //         }
        //     }

        //     // console.log(child1)
        //     lastNodeId = child1.id;
        // }

        db.initRoom({roomId: roomId, roomData: '', username:username });
        // res.json({ url: `http://${WEBAPP_DOMAIN}/${roomId}`, secret });
        res.json({ roomId, secret });
    }
});

app.post('/api/register-user', (req,res)=>{
    let { roomId, username } = req.body;

    if(!rooms[roomId]) {
        console.log(`* server: Could not find room id: ${roomId}`);
        return;
    }

    let room = rooms[roomId];
    if(room.users[username]) {
        res.status(400).send({error: 'username taken'});
    }
    else {
        room.users[username] = true;
        res.status(200).send({username});
        db.addUser({roomId: roomId, username: username });
        console.log('registered user!')
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
        io.sockets.emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });
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
            // let lastNodeId = node.id;
            // for(let i=0;i<2;i++) {
            //     let child1 = createNode(question, username, lastNodeId);
            //     let child2 = createNode(question, username, lastNodeId);
            //     insertNode(child1, lastNodeId, roomNodes);
            //     insertNode(child2, lastNodeId, roomNodes);
            //     // console.log(child1)
            //     lastNodeId = child1.id;
            // }

            io.sockets.emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });            
        } catch (error) {
            console.log(error);
        }
    })
    
    //--------------------------------
    // ANSWER
    //--------------------------------
    socket.on('answer', (data) => {
        let { answer: { username, content} , nodeId, roomId } = data;
        
        if(!rooms[roomId]) {
            console.log(`* server: Could not find room id: ${roomId}`);
            return;
        }

        console.log(`* server: answer request received: answer: ${content} by user: ${username} parentNode: ${nodeId} `);
        let roomNodes = rooms[roomId].nodes
        
        try {
            let answer = createAnswer(content, username);
            insertAnswer(answer, nodeId, roomNodes);
            io.sockets.emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });            
        } catch (error) {
            socket.emit('error', error);
            console.log(error);
        }
    })

    socket.on('vote-answer', (data) => {
        let { username, nodeId, answerId, roomId, up } = data;
        if(!rooms[roomId]) {
            console.log(`* server: Could not find room id: ${roomId}`);
            return;
        }

        let roomNodes = rooms[roomId].nodes
        
        try {
            voteAnswer(up, username, answerId, nodeId, roomNodes);
            io.sockets.emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });            
        } catch (error) {
            console.log(error);
        }
    })
    
    socket.on('mark-answer', (data) => {
        let { nodeId, answerId, roomId } = data;
        if(!rooms[roomId]) {
            console.log(`* server: Could not find room id: ${roomId}`);
            return;
        }

        let roomNodes = rooms[roomId].nodes
        try {
            markAnswerAsCorrect(answerId, nodeId, roomNodes);
            io.sockets.emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });            
        } catch (error) {
            console.log(error);
        }

    })
});

server.listen(SERVER_PORT, () => {
    console.log(`server hosted on ${env.REACT_APP_SERVER_HOST}:${env.REACT_APP_SERVER_PORT} for client port ${env.REACT_APP_CLIENT_PORT}`);
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
// setTimeout(async () => {
//     let res = await fetch(`http://localhost:${SERVER_PORT}/api/create-session`, {
//         method: 'POST',
//         body: JSON.stringify({ discourse: 'Can AI Have intelligence?', username: 'Paolo' }),
//         headers: { 'Content-Type': 'application/json' }
//     })

//     let { roomId, secret } = await res.json();
//     console.log(`= client: USER GOES TO: ${roomId} AND SAVE SECRET: ${secret}`);
//     // let split = roomId.split('/');
//     // let roomId = split[split.length - 1];

//     clientSocket = new ioclient(`http://localhost:${SERVER_PORT}`);
    
//     let nodes = {}
//     //1. get all data
//     clientSocket.on('nodes-update', (data) => {
//         nodes = data.nodes
//         console.log(`= client: data received (${Object.values(data.nodes).length} node(s))`);
//     });
    
//     //2.
//     clientSocket.emit('get-nodes', { roomId });
    
//     await sleep(100);
    
//     //3. create a test node
//     let rootId = Object.keys(nodes)[0];
//     clientSocket.emit('add-node', { node: { username: 'Elliot', question: 'What is Intelligence?' }, parentId: rootId, roomId});
    
//     await sleep (100)
//     let answerNodeId = Object.keys(nodes)[1];
//     clientSocket.emit('answer', { answer: { username: 'Elliot', content: 'Intelligence is the ability to exhibit smart behaviour' }, nodeId: answerNodeId, roomId});    
    
//     await sleep (100)
//     // console.dir(nodes, { depth: null })
// }, 100);