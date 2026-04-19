const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- 🛠️ MONGODB BAĞLANTISI (BURAYI DOLDUR!) ---
// Altın linkini buraya yapıştır!
const MONGO_URL =mongodb+srv://seporix42_db_user:HwfQMf5iHAqowpzm@cluster0.jtgjz3y.mongodb.net/?appName=Cluster0
; 

mongoose.connect(MONGO_URL)
    .then(() => console.log("🏎️ GearBox İrlanda Hangarına Bağlandı!"))
    .catch(err => console.log("❌ Şanzıman Arızası:", err));

// --- 📦 MESAJ MODELİ ---
const MessageSchema = new mongoose.Schema({
    user: String,
    text: String,
    time: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

app.use(express.static('public'));

io.on('connection', async (socket) => {
    console.log('✅ Bir kullanıcı dükkana girdi');

    // Eski mesajları buluttan çek ve gönder
    try {
        const oldMessages = await Message.find().sort({ time: 1 });
        socket.emit('previousMessages', oldMessages);
    } catch (err) {
        console.error("Mesajlar çekilemedi:", err);
    }

    // Yeni mesaj geldiğinde
    socket.on('chatMessage', async (data) => {
        const newMessage = new Message(data);
        await newMessage.save(); // İrlanda'daki hangara kaydet
        io.emit('message', { ...data, _id: newMessage._id }); // Herkese kimliğiyle gönder
    });

    // 🗑️ MESAJ SİLME (PROFESYONEL ÖZELLİK)
    socket.on('deleteMessage', async (messageId) => {
        try {
            await Message.findByIdAndDelete(messageId);
            io.emit('messageDeleted', messageId);
        } catch (err) {
            console.error("Silme hatası:", err);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 GearBox ${PORT} portunda gazlıyor!`);
});
