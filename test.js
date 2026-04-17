require('dotenv').config();
const { runAgent } = require('./services/agent');

runAgent("How is my business doing?").then(console.log).catch(console.error);
