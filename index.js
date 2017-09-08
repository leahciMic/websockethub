const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const PORT = process.env.PORT || 9105;
const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  const location = url.parse(req.url);

  ws._hubdata = {
    room: location.path,
  };

  console.log('user joined room ', location.path);

  function broadcastToRoom(room, data) {
    wss.clients.forEach((client) => {
      const isMe = client === ws;
      const isOpen = client.readyState === WebSocket.OPEN;
      const isInRoom = client._hubdata ? client._hubdata.room === room : false;
      if (!isMe && isOpen && isInRoom) {
        client.send(data);
      }
    });
  }

  ws.on('message', (message) => {
    console.log('received message', message, 'rebroadcast to room', ws._hubdata.room);
    broadcastToRoom(ws._hubdata.room, message);
  });
});

server.listen(PORT, () => { console.log(`Listening on ${PORT}`); } );
