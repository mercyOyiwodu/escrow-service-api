require('dotenv').config();
const express = require('express');
require('./app')
const port = process.env.PORT || 3000
const app = express();


app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
