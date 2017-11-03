// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const uuid = require('uuid/v4');

const colors = ['#639', '#ff6347', '#DE1E7E', '#F00'];

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  // console.log('Client connected');
  wss.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify({
        // id: uuid(),
        num: wss.clients.size,
        type: 'userNumUpdate'
      }));
    }
  });

  ws.color = colors[Math.floor((Math.random() * 4))];
  ws.send(JSON.stringify({
    color: ws.color,
    type: 'userColor'
  }));

  ws.on('message', (message) => {
    let messageObj = JSON.parse(message);
    messageObj.id = uuid();
    switch (messageObj.type) {
      case 'postMessage':
      messageObj.type = 'incomingMessage';
      break;
      case 'postNotification':
      messageObj.type = 'incomingNotification';
      break;
      default:
      messageObj.type = 'unknown';
      break;
    }
    let messageStr = JSON.stringify(messageObj);
    wss.clients.forEach(function each(client) {
        if (client.readyState === ws.OPEN) {
          client.send(messageStr);
        }
    });
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  // ws.on('close', () => console.log('Client disconnected'));
});
