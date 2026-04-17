require('dotenv').config();
const express = require('express');
const cors = require('cors');

const shopifyRoutes = require('./routes/shopify');
const crmRoutes = require('./routes/crm');
const webhookRoutes = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main integrations and webhook routes
app.use('/shopify', shopifyRoutes);
app.use('/crm', crmRoutes);
app.use('/', webhookRoutes); // Exposes POST /vapi-webhook

// Root testing
app.get('/', (req, res) => {
    res.send({ status: "Voice AI Business Operations Agent is running!" });
});

app.listen(PORT, () => {
    console.log(`🚀 Server starting on port ${PORT}...`);
    console.log(`✅ Webhook ready at POST http://localhost:${PORT}/vapi-webhook`);
});
