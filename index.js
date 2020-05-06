require('dotenv').config();

const server = require('./server');

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => console.log(`Server is live at localhost:${PORT}`));
