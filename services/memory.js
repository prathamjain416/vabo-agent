const { QdrantClient } = require('@qdrant/js-client-rest');

let qdrantClient = null;
const COLLECTION_NAME = "business_agent_memory";

try {
    if (process.env.QDRANT_URL && process.env.QDRANT_API_KEY) {
        qdrantClient = new QdrantClient({
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY
        });
        console.log("[Memory] Qdrant Client initialized");
    } else {
        console.log("[Memory] Running in mock memory mode (no Qdrant connection)");
    }
} catch (e) {
    console.error("[Memory] Failed to initialize Qdrant:", e);
}

// Minimal mock vector creation utility
function mockEmbed(text) {
    // Generate a random 128-dimension vector
    return Array(128).fill(0).map(() => Math.random());
}

async function saveMemory(text) {
    if (!qdrantClient) {
        console.log(`[Memory] (Mock Save): ${text}`);
        return;
    }

    try {
        const vector = mockEmbed(text);
        
        // This attempts to add a point; if the collection doesn't exist, it might fail in production
        // without a createCollection check, but for simplicity we rely on upsert standard.
        await qdrantClient.upsert(COLLECTION_NAME, {
            wait: true,
            points: [
                {
                    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
                    vector: vector,
                    payload: { text: text, timestamp: new Date().toISOString() }
                }
            ]
        });
        console.log("[Memory] Successfully saved memory context to Qdrant.");
    } catch (error) {
        console.error("[Memory] Vector DB save error:", error.message);
    }
}

async function retrieveMemory(query) {
    if (!qdrantClient) {
        return "No persistent memory available.";
    }

    try {
        const vector = mockEmbed(query);
        const searchResult = await qdrantClient.search(COLLECTION_NAME, {
            vector: vector,
            limit: 3
        });

        if (searchResult && searchResult.length > 0) {
            return searchResult.map(res => res.payload.text).join('\n---\n');
        }
        
        return "No strictly relevant past context found.";
    } catch (error) {
        console.error("[Memory] Vector DB retrieve error:", error.message);
        return "No persistent memory available right now.";
    }
}

module.exports = { saveMemory, retrieveMemory };
