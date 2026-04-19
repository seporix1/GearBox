const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>GearBox | Canlı Telsiz</title>
        <style>
          body { background: #0f0f0f; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; margin: 0; padding: 20px; }
          h1 { color: #3498db; text-shadow: 2px 2px #000; }
          #chat-container { width: 90%; max-width: 500px; background: #1a1a1a; border: 2px solid #333; border-radius: 10px; padding: 15px; }
          #messages { list-style: none; padding: 0; height: 300px; overflow-y: auto; border-bottom: 1px solid #333; margin-bottom: 10px; }
          #messages li { padding: 8px; border-bottom: 1px solid #222; font-size: 14px; }
          #messages li:last-child { border: none; }
          .controls { display: flex; gap: 10px; width: 100%; }
          input { flex: 1; padding: 10px; border-radius: 5px; border: none; background: #333; color: white; }
          button { padding: 10px 20px; background: #e74c3c; border: none; color: white; border-radius: 5px; cursor: pointer; font-weight: bold; }
          button:hover { background: #c0392b; }
          .status { font-size: 12px; color: #2ecc71; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>GEARBOX TELSİZ 📻</h1>
        <div class="status">● Sunucu Durumu: Aktif (M3 E46 GTR Motoru Gibi)</div>
        
        <div id="chat-container">
          <ul id="messages"></ul>
          <div class="controls">
            <input id="input" autocomplete="off" placeholder="Mesajını yaz CEO..." />
            <button onclick="sendMessage()">GÖNDER</button>
          </div>
        </div>

        <script src="/socket.io/socket.io.js"></script>
        <script>
          const socket = io();
          const messages = document.getElementById('messages');
          const input = document.getElementById('input');

          function sendMessage() {
            if (input.value) {
              socket.emit('chat message', input.value);
              input.value = '';
            }
          }

          socket.on('chat message', (msg) => {
            const item = document.createElement('li');
            item.textContent = "🏎️ Misafir: " + msg;
            messages.appendChild(item);
            messages.scrollTop = messages.scrollHeight;
          });
        </script>
      </body>
    </html>
  `);
});

io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı!');
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

server.listen(port, () => {
  console.log('GearBox Sunucusu Hazır!');
});
