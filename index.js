require('dotenv').config();
const { initDb } = require('./db');
initDb();
const server = require('./server');

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => console.log(`Server is live at localhost:${PORT}`));
