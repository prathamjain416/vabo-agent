const express = require('express');
const router = express.Router();
const { getShopifySummary } = require('../integrations/shopify');

router.get('/summary', async (req, res) => {
    try {
        const data = await getShopifySummary();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
