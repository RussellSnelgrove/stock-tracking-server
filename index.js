const express = require('express');
const cors = require('cors');

const testStock = require('./tests/fixtures/XQQ.json');

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
    origin: ['https://localhost:5173', 'https://localhost:3000'],
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send('Server is Ready');
});

app.get(('/api/xqq'), (req, res) => {
    res.json(testStock);
});

app.listen(port, () => {
    console.log(`Server at http://localhost:${port}`);
});