//========================================================================
//
//                            INIT FIREBASE                             
//
//========================================================================
const DB = require('./db/dbinit');
var admin = require("firebase-admin");
var serviceAccount = require("./thiscourse-e4fb1-firebase-adminsdk-ouh1i-a8116a739b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const FieldValue = admin.firestore.FieldValue;
const firestore = admin.firestore();
const db = new DB(firestore, FieldValue);


//========================================================================
//
//                            INIT ENV                             
//
//========================================================================
const fs = require('fs');
let fileString = fs.readFileSync('../web-app/.env').toString()
let rows = fileString.split('\n')
let env = {}
for(let row of rows) {
    let keyval = row.split('=');
    env[keyval[0]] = keyval[1];
}

WEBAPP_DOMAIN = `${env.REACT_APP_SERVER_HOST}:${env.REACT_APP_CLIENT_PORT}`

//========================================================================
//
//                            INIT SERVER                             
//
//========================================================================
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
const { Server } = require('socket.io');
const io = new Server(server, {
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

function onDataChange(roomId){
    const data = JSON.stringify(rooms[roomId]);
    db.updateRoom({roomId: roomId, roomData: data})
}

function createRoom(root, ownerId) {
    return {
        nodes: {
            [root.id]: root
        },
        rootId: root.id,
        ownerId
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

app.post('/api/create-session', async (req, res) => {
    try {
        let { discourse, username } = req.body;
        roomId = uuid.v4();
        if (discourse === undefined || username === undefined) {
            res.status(401).json({error: 'Missing discourse or username'});
        }
        else {
            let root = createNode(discourse, username);
            let room = createRoom(root, username);
            rooms[roomId] = room;
            initSocketNamespace(roomId);
            console.log(`* server: room created ${roomId}`);
            await db.initRoom({roomId, roomData: room});

            let roomSummary = {
                id: roomId,
                question: root.question
            }

            await db.addOwnedRoomToUser({ username, roomSummary });
            res.status(201).json({ roomId });
        }        
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
});

app.post('/api/join-session', async (req, res) => {
    let { roomId, username } = req.body;
    if (roomId === undefined || username === undefined) {
        res.status(401).json({error: 'Missing roomId or username'});
    }
    else {
        let room = rooms[roomId];

        let roomExists = await db.roomExists({roomId});

        if(!roomExists) 
            res.status(404).json({error: "Room not found"});

        if(!room) {
            const data = await db.getRoom({ roomId, username });
            res.json({ online: false, data }); //room isnot online
        }

        res.json({ online: true });
    }
});

app.post('/api/create-user', async (req,res)=>{
    try {
        let { username } = req.body;
        if(!username) {res.status(401).json({error: 'no username given'})}
        await db.addUser({ username });
        res.status(201).json({username});        
    } catch (error) {        
        res.status(403).json({error: error.message});        
    }
});

app.post('/api/login', async (req, res)=>{
    try {
        let { username, password } = req.body;
        if(!username || !password) {res.status(401).json({error: 'no username or password given'})}
        let user = await db.getUser({username});
        if(user !== null && username == password) {
            console.log(`${username} logged in successfully`);
            res.status(200).json({success: true});
            return;
        }
        else {
            res.status(403).json({error: 'wrong username or password'});        
            return;
        }
    } catch (error) {        
        res.status(403).json({error: error.message});
    }
});

app.post('/api/load-dashboard', async (req,res)=> {
    try {
        let { username } = req.body;
        if(!username) {res.status(401).json({error: 'no username given'})}
        let dashboard = await db.getUser({ username });
        if(dashboard) {
            res.status(200).json(dashboard);
            return;
        }
        else {
            res.status(403).json({error: 'error loading dashboard'});
            return;
        }
    } catch (error) {        
        console.log(error);
        res.status(403).json({error: error.message});
    }
});

/**
 * if input username is owner: restart the session
 * else attempt to join the session. 
 * if session is offline, returns room data
 * else, returns online: true to establish socket connection
 */
app.post('/api/join-restart-session', async (req,res)=>{
    try {
        let { roomId, username } = req.body;
        const room = await db.getRoom({roomId});
    
        if(!room) {
            throw new Error("Session does not exist");
        }

        let isOwner = (room.ownerId == username);

        if(isOwner) {
            //========================================================================
            //
            //                            RESTART SESSION                             
            //
            //========================================================================
            //we only want to init socket namespace once per server lifetime
            if(!rooms[roomId]) {
                initSocketNamespace(roomId);
            }
    
            rooms[roomId] = room;
            res.status(200).json({online: true, owner: true});
        }
        else {
            //========================================================================
            //
            //                            JOIN SESSION
            //
            //========================================================================            
            let isOnline = (rooms[roomId] !== undefined);
            res.status(200).json({online: isOnline, owner: false, data: room});
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
});

//------------------------------------------------------------------------------------------------
// SERVER SOCKET IO
//------------------------------------------------------------------------------------------------

function initSocketNamespace(roomId) {
    console.log(`
    ==
    * NEW NAMESPACE CREATED: ${roomId}
    ==
    `);

    let namespaceId = `/${roomId}`;
    io.of(namespaceId).on('connection', (socket) => {
        console.log('* server: user connected');
    
        //--------------------------------
        // GET NODES
        //--------------------------------
        socket.on('get-nodes', (data) => {
            console.log(`* server: data retrieval request received`);
            let { roomId } = data;
            io.of(namespaceId).emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });
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
    
                io.of(namespaceId).emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });            
                onDataChange(roomId);
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
                io.of(namespaceId).emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });
                onDataChange(roomId);
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
                io.of(namespaceId).emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });
                onDataChange(roomId);
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
                io.of(namespaceId).emit('nodes-update', rooms[roomId] || { error: 'ROOM NOT FOUND' });
                onDataChange(roomId);
            } catch (error) {
                console.log(error);
            }
    
        })
    });
}

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