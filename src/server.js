require('dotenv').config();
const app = require('./app');
const port = process.env.PORT || 3000;

require('./cron/autoRelease');

app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
