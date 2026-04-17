const express = require('express');
const router = express.Router();
const { getPendingLeads, createFollowups } = require('../integrations/hubspot');

router.get('/leads', async (req, res) => {
    try {
        const data = await getPendingLeads();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/followup', async (req, res) => {
    try {
        const data = await createFollowups();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
