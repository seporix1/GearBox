const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

// Mesajları kaydetmek için dosya sistemi
const DATA_FILE = './messages.json';
let chatHistory = [];
if (fs.existsSync(DATA_FILE)) {
    chatHistory = JSON.parse(fs.readFileSync(DATA_FILE));
}

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GEARBOX | Professional Dashboard</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #0a0a0a; color: #e0e0e0; font-family: 'Inter', sans-serif; height: 100vh; display: flex; flex-direction: column; }
            
            /* Üst Menü */
            header { height: 60px; background: #111; border-bottom: 1px solid #222; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; }
            .logo { font-weight: 800; font-size: 24px; color: #3498db; letter-spacing: 2px; }
            .user-nav { display: flex; gap: 15px; }
            .nav-btn { background: #222; border: 1px solid #333; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 13px; }
            .nav-btn:hover { background: #333; }

            /* Ana Panel */
            main { flex: 1; display: flex; overflow: hidden; }
            
            /* Mesaj Alanı */
            #chat-area { flex: 1; display: flex; flex-direction: column; background: #0d0d0d; }
            #messages { flex: 1; overflow-y: auto; padding: 20px; list-style: none; }
            #messages li { margin-bottom: 15px; padding: 10px; background: #151515; border-left: 3px solid #3498db; border-radius: 0 4px 4px 0; max-width: 80%; }
            .msg-user { font-weight: bold; font-size: 12px; color: #3498db; display: block; margin-bottom: 5px; }

            /* Input Alanı */
            .input-box { height: 80px; background: #111; border-top: 1px solid #222; padding: 20px; display: flex; gap: 10px; }
            input { flex: 1; background: #1a1a1a; border: 1px solid #333; border-radius: 4px; color: white; padding: 0 15px; outline: none; }
            input:focus { border-color: #3498db; }
            .send-btn { background: #3498db; color: white; border: none; padding: 0 25px; border-radius: 4px; cursor: pointer; font-weight: bold; }

            /* Giriş Modalı */
            #login-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; display: flex; align-items: center; justify-content: center; z-index: 1000; }
            .login-card { background: #111; padding: 40px; border-radius: 8px; border: 1px solid #222; text-align: center; width: 350px; }
            .login-card h2 { margin-bottom: 20px; }
            .login-card input { width: 100%; height: 45px; margin-bottom: 15px; }
        </style>
    </head>
    <body>
        <div id="login-overlay">
            <div class="login-card">
                <h2>GEARBOX PANEL</h2>
                <input type="text" id="username-input" placeholder="Kullanıcı Adı">
                <button class="send-btn" style="width: 100%; height: 45px;" onclick="login()">GİRİŞ YAP</button>
            </div>
        </div>

        <header>
            <div class="logo">GEARBOX</div>
            <div class="user-nav">
                <span id="current-user" style="font-size: 13px; color: #888; align-self: center; margin-right: 10px;"></span>
                <button class="nav-btn">AYARLAR</button>
                <button class="nav-btn" onclick="location.reload()">ÇIKIŞ</button>
            </div>
        </header>

        <main>
            <section id="chat-area">
                <ul id="messages"></ul>
                <div class="input-box">
                    <input id="chat-input" type="text" placeholder="Sistem mesajı gönder..." onkeypress="handleKey(event)">
                    <button class="send-btn" onclick="sendMsg()">GÖNDER</button>
                </div>
            </section>
        </main>

        <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();
            let currentUser = "";

            function login() {
                const user = document.getElementById('username-input').value;
                if(user.trim()) {
                    currentUser = user;
                    document.getElementById('login-overlay').style.display = 'none';
                    document.getElementById('current-user').textContent = currentUser;
                    socket.emit('load history');
                }
            }

            function handleKey(e) { if(e.key === 'Enter') sendMsg(); }

            function sendMsg() {
                const input = document.getElementById('chat-input');
                if(input.value.trim() && currentUser) {
                    socket.emit('chat message', { user: currentUser, msg: input.value });
                    input.value = '';
                }
            }

            socket.on('chat message', (data) => {
                addMessage(data);
            });

            socket.on('history', (history) => {
                document.getElementById('messages').innerHTML = '';
                history.forEach(addMessage);
            });

            function addMessage(data) {
                const li = document.createElement('li');
                li.innerHTML = \`<span class="msg-user">\${data.user}</span> \${data.msg}\`;
                const msgList = document.getElementById('messages');
                msgList.appendChild(li);
                msgList.scrollTop = msgList.scrollHeight;
            }
        </script>
    </body>
    </html>
  `);
});

io.on('connection', (socket) => {
  socket.on('load history', () => {
    socket.emit('history', chatHistory);
  });

  socket.on('chat message', (data) => {
    chatHistory.push(data);
    // Son 100 mesajı tut ve dosyaya kaydet
    if (chatHistory.length > 100) chatHistory.shift();
    fs.writeFileSync(DATA_FILE, JSON.stringify(chatHistory));
    io.emit('chat message', data);
  });
});

server.listen(port, () => {
  console.log('GEARBOX PRO AKTIF');
});
