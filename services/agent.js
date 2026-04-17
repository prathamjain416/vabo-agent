const Groq = require('groq-sdk');
const { getShopifySummary } = require('../integrations/shopify');
const { getPendingLeads, createFollowups } = require('../integrations/hubspot');
const { saveMemory, retrieveMemory } = require('./memory');

let groq;
try {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} catch (error) {
    console.warn("Groq API Key missing or invalid. AI features will not work without it.");
}

const agentTools = [
    {
        type: "function",
        function: {
            name: "get_shopify_summary",
            description: "Get a summary of the business from Shopify including total revenue, total orders, and top products. Fetch Shopify data.",
            parameters: { type: "object", properties: {}, required: [] }
        }
    },
    {
        type: "function",
        function: {
            name: "get_pending_leads",
            description: "Get the number of pending leads from the HubSpot CRM.",
            parameters: { type: "object", properties: {}, required: [] }
        }
    },
    {
        type: "function",
        function: {
            name: "create_followups",
            description: "Trigger an action to create follow-up tasks for pending leads in the CRM.",
            parameters: { type: "object", properties: {}, required: [] }
        }
    }
];

async function runAgent(userMessage) {
    if (!groq) {
        return "Agent is offline because GROQ_API_KEY is not configured.";
    }

    try {
        console.log("[Agent] Analyzing user intent...");
        
        // Memory retrieval
        const pastMemory = await retrieveMemory(userMessage);
        
        const messages = [
            {
                role: "system",
                content: `You are a professional business operations AI agent interacting via voice. 
Respond conversationally, concisely, and naturally.
Your capabilities:
1. Fetch business performance/sales (Shopify).
2. Fetch pending leads (CRM).
3. Create follow-up tasks (CRM).
If the user asks "Why are sales down?", use your data to analyze trends and provide reasoning.

Relevant past context/memory about this user:
${pastMemory}
`
            },
            {
                role: "user",
                content: userMessage
            }
        ];

        // 1st LLM call to get tool executions
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Fast, capable model 
            messages: messages,
            tools: agentTools,
            tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;
        const toolCalls = responseMessage.tool_calls;

        // If the LLM decided to use a tool
        if (toolCalls) {
            messages.push(responseMessage); 

            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name;
                console.log(`[Agent] Calling tool: ${functionName}`);
                let functionResultData;

                if (functionName === "get_shopify_summary") {
                    functionResultData = await getShopifySummary();
                } else if (functionName === "get_pending_leads") {
                    functionResultData = await getPendingLeads();
                } else if (functionName === "create_followups") {
                    functionResultData = await createFollowups();
                }

                messages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: JSON.stringify(functionResultData),
                });
            }

            // 2nd LLM call with the results from the tools
            const finalResponse = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: messages
            });

            const finalText = finalResponse.choices[0].message.content;
            await saveMemory(`User: ${userMessage} | Agent: ${finalText}`);
            return finalText;
            
        } else {
            // No tools used, direct response
            const responseText = responseMessage.content;
            await saveMemory(`User: ${userMessage} | Agent: ${responseText}`);
            return responseText;
        }

    } catch (error) {
        console.error("[Agent] Error running AI Agent:", error);
        return "I experienced an error analyzing that request.";
    }
}

module.exports = { runAgent };
