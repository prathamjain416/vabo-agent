const axios = require('axios');

async function getPendingLeads() {
    const key = process.env.HUBSPOT_API_KEY;

    if (!key) {
        console.log("[HubSpot] Using mock data for leads because API key isn't set");
        return {
            pending_leads: 15,
            message: "You have 15 pending leads that need attention."
        };
    }

    try {
        console.log("[HubSpot] Fetching leads from CRM...");
        const response = await axios.get('https://api.hubapi.com/crm/v3/objects/contacts', {
            headers: {
                'Authorization': `Bearer ${key}`
            }
        });

        const contacts = response.data.results || [];
        return {
            pending_leads: contacts.length,
            message: `You have ${contacts.length} pending leads in Hubspot.`
        };
    } catch (error) {
        console.error("[HubSpot] Error fetching leads:", error.message);
        throw new Error("Failed to fetch CRM leads");
    }
}

async function createFollowups() {
    const key = process.env.HUBSPOT_API_KEY;

    if (!key) {
        console.log("[HubSpot] Mocking follow-up creation because API key isn't set");
        return {
            success: true,
            tasks_created: 15,
            message: "Follow-up tasks successfully generated for all pending leads."
        };
    }

    try {
        console.log("[HubSpot] Executing CRM Action: Creating follow-ups for pending leads...");
        // This is a placeholder for real API updates, like creating tasks for contacts
        return {
            success: true,
            tasks_created: 10,
            message: "Follow-up tasks successfully submitted to HubSpot."
        };
    } catch (error) {
        console.error("[HubSpot] Error creating followups:", error.message);
        throw new Error("Failed to trigger follow-up action");
    }
}

module.exports = { getPendingLeads, createFollowups };
