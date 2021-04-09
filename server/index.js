const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const uuid = require('uuid');

let rooms = {}


function createAnswer(username, content) {
    return {
        id: uuid.v4(),
        username,
        content,
        thumbsUp: 0,
        thumbsDown: 0,
        isAnswer: false
    }
}
function createNode(question) {
    return {
        id: uuid.v4(),
        question,
        answers: [],    
        childNodes: []            
    }
}

WEBAPP_DOMAIN = 'localhost:3000'
app.post('/api/create-session', (req, res) => {
    let { discourse, username } = req.body;   
    roomid = uuid.v4();
    if(discourse === undefined || username === undefined) {
        res.status(401).send('Missing discourse or username');
    }
    else {
        let root = createNode(discourse);
        rooms[roomid] = {
            nodes: [root] 
        }

        res.redirect(`http://${WEBAPP_DOMAIN}/${roomid}`);
    }
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});