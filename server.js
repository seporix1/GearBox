const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- 🛠️ MONGODB BAĞLANTISI ---
const MONGO_URL = mongodb+srv://seporix42_db_user:HwfQMf5iHAqowpzm@cluster0.jtgjz3y.mongodb.net/?appName=Cluster0; 
mongoose.connect(MONGO_URL).then(() => console.log("🏎️ GearBox İrlanda'ya Bağlandı!"));

// --- 📦 MODELLER ---
const UserSchema = new mongoose.Schema({
    username: String,
    gearID: String 
});
const MessageSchema = new mongoose.Schema({
    room: String,
    user: String,
    text: String,
    time: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

app.use(express.static('public'));

io.on('connection', (socket) => {
    // 1. Giriş Yapma ve ID Oluşturma
    socket.on('join', async (username) => {
        let user = await User.findOne({ username });
        if (!user) {
            const newID = Math.floor(10000 + Math.random() * 90000).toString();
            user = new User({ username, gearID: newID });
            await user.save();
        }
        socket.emit('userReady', user);
    });

    // 2. Özel Odaya Giriş
    socket.on('joinRoom', async ({ myID, friendID }) => {
        const roomName = [myID, friendID].sort().join('_');
        socket.join(roomName);
        const oldMessages = await Message.find({ room: roomName }).sort({ time: 1 });
        socket.emit('previousMessages', oldMessages);
    });

    // 3. Mesaj Gönderme
    socket.on('chatMessage', async (data) => {
        const newMessage = new Message({ 
            room: data.room, 
            user: data.user, 
            text: data.text 
        });
        await newMessage.save();
        io.to(data.room).emit('message', newMessage);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 GearBox V1 Aktif!`));
