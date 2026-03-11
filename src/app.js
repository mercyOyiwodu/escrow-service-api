const express = require('express');
const connectDB = require('./config/db');
require('./config/db');
require('dotenv').config();
connectDB()
const app = express();
app.use(express.json());
const userRoutes = require('./routes/user');
const escrowRoutes = require('./routes/escrow');



app.use('/api/v1', userRoutes);
app.use('/api/v1/escrow', escrowRoutes);

module.exports = app;