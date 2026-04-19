const express = require('express');
const app = express();
app.get('/', (req, res) => {
    res.send('<h1>GearBox Yayında! 🏎️</h1><p>Kaan, ilk vitesi attık hayırlı olsun!</p>');
});
app.listen(process.env.PORT || 3000);