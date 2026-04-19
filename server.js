const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>GearBox | Ünye-İstanbul</title>
        <style>
          body { 
            background-color: #0f0f0f; 
            color: #ffffff; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            margin: 0; 
          }
          h1 { color: #3498db; font-size: 50px; text-transform: uppercase; letter-spacing: 5px; }
          p { font-size: 20px; color: #888; }
          .btn { 
            padding: 15px 30px; 
            background-color: #e74c3c; 
            color: white; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: bold; 
            transition: 0.3s;
            border: 2px solid transparent;
          }
          .btn:hover { background-color: transparent; border-color: #e74c3c; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>GEARBOX</h1>
        <p>Ünye Ruhu, İstanbul Hızıyla Yayında!</p>
        <button class="btn" onclick="alert('Vıııııııııııın! Şanzıman Hazır!')">GAZLA!</button>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Motor ${port} portunda çalışıyor.`);
});
