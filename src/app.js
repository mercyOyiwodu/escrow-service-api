const express = require('express');
const connectDB = require('./config/db');
require('./config/db');
require('dotenv').config();
connectDB()
const app = express();
app.use(express.json());
const userRoutes = require('./routes/user');



app.use('/api/v1', userRoutes);