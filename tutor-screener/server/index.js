const express = require('express');
const cors = require('cors');
require('dotenv').config();

const chatRoute = require('./routes/chat');
const assessRoute = require('./routes/assess');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoute);
app.use('/api/assess', assessRoute);

app.listen(1000, () => console.log('Server running on port 1000'));