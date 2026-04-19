const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- 🛠️ MONGODB BAĞLANTISI (BURAYI UNUTMA) ---
const MONGO_URL = mongodb+srv://seporix42_db_user:HwfQMf5iHAqowpzm@cluster0.jtgjz3y.mongodb.net/?appName=Cluster0; 
mongoose.connect(MONGO_URL).then(() => console.log("🏎️ GearBox V1.1 Bağlandı!"));

// --- 📦 MODELLER ---
const User = mongoose.model('User', new mongoose.Schema({ username: String, gearID: String }));
const Message = mongoose.model('Message', new mongoose.Schema({ room: String, user: String, text: String, time: { type: Date, default: Date.now } }));

// --- 🚦 ANA SAYFA (Hata Payını Yok Etmek İçin HTML'i Buraya Gömüyoruz) ---
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>GearBox V1.1</title>
    <style>
        body { background: #121212; color: #eee; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .box { background: #1e1e1e; padding: 20px; border-radius: 10px; border: 1px solid #333; width: 320px; text-align: center; }
        input { width: 90%; padding: 10px; margin: 10px 0; background: #2a2a2a; border: 1px solid #444; color: white; }
        button { padding: 10px; background: #c62828; color: white; border: none; cursor: pointer; width: 100%; }
        #messages { height: 200px; overflow-y: auto; background: #161616; margin: 10px 0; padding: 5px; text-align: left; font-size: 14px; }
        .emoji-btn { background: #444; width: auto; display: inline-block; padding: 5px; margin: 2px; }
    </style>
</head>
<body>
    <div id="login" class="box">
        <h2>🏎️ GearBox V1.1</h2>
        <input type="text" id="userIn" placeholder="Adın">
        <button onclick="join()">GİRİŞ</button>
    </div>
    <div id="chat" class="box" style="display:none">
        <p>ID: <b id="myID" style="color:red"></b></p>
        <input type="text" id="friendID" placeholder="Arkadaş ID">
        <button onclick="connect()">BAĞLAN</button>
        <div id="messages"></div>
        <div id="emojis">
            <span class="emoji-btn" onclick="addE('🔥')">🔥</span>
            <span class="emoji-btn" onclick="addE('🏎️')">🏎️</span>
            <span class="emoji-btn" onclick="addE('😎')">😎</span>
            <span class="emoji-btn" onclick="addE('🚀')">🚀</span>
        </div>
        <input type="text" id="msg" placeholder="Mesaj...">
        <button onclick="send()">GÖNDER</button>
    </div>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io(); let me = ''; let room = '';
        function join() { const u = document.getElementById('userIn').value; if(u) socket.emit('join', u); }
        socket.on('userReady', d => { 
            me = d; document.getElementById('login').style.display='none'; 
            document.getElementById('chat').style.display='block';
            document.getElementById('myID').innerText = d.gearID;
        });
        function connect() { 
            const fID = document.getElementById('friendID').value;
            if(fID) { room = [me.gearID, fID].sort().join('_'); socket.emit('joinRoom', {myID: me.gearID, friendID: fID}); }
        }
        socket.on('message', m => { 
            const d = document.createElement('div'); d.innerHTML = '<b>'+m.user+':</b> '+m.text;
            document.getElementById('messages').appendChild(d);
        });
        function addE(e) { document.getElementById('msg').value += e; }
        function send() { 
            const t = document.getElementById('msg').value;
            if(t && room) { socket.emit('chatMessage', {room, user: me.username, text: t}); document.getElementById('msg').value=''; }
        }
    </script>
</body>
</html>
    `);
});

// --- 🌐 SOCKET İŞLEMLERİ ---
io.on('connection', (socket) => {
    socket.on('join', async (name) => {
        let u = await User.findOne({ username: name });
        if (!u) { u = new User({ username: name, gearID: Math.floor(10000 + Math.random() * 90000).toString() }); await u.save(); }
        socket.emit('userReady', u);
    });
    socket.on('joinRoom', ({ myID, friendID }) => {
        socket.join([myID, friendID].sort().join('_'));
    });
    socket.on('chatMessage', async (data) => {
        const m = new Message(data); await m.save();
        io.to(data.room).emit('message', data);
    });
});

server.listen(process.env.PORT || 3000, () => console.log("🚀 V1.1 Motoru Çalıştı!"));
