const express = require('express');
const router = express.Router();
const { runAgent } = require('../services/agent');

router.post('/vapi-webhook', async (req, res) => {
    try {
        console.log("\n[Webhook] Request received from VAPI");
        
        // DUMP PAYLOAD for debugging
        require('fs').writeFileSync('vapi_payload_debug.json', JSON.stringify(req.body, null, 2));
        
        let isToolCall = false;
        let toolCallId = null;

        // Attempt to extract the primary message VAPI sends
        let userMessage = req.body.message || req.body.transcript || req.body.input;
        
        // Further extraction logic for nested objects standard to some VAPI webhook schema
        if (req.body.message && typeof req.body.message === 'object') {
            if (req.body.message.type === 'transcript' || req.body.message.transcript) {
                userMessage = req.body.message.transcript;
            } else if (req.body.message.type === 'call') {
                userMessage = "Call initiated, no transcript yet.";
            } else if (req.body.message.input) {
                userMessage = req.body.message.input;
            } else if (req.body.message.type === 'toolCalls' || req.body.message.type === 'tool-calls') {
                isToolCall = true;
                
                // Extract tool call ID and arguments depending on Vapi payload structure
                const firstCall = (req.body.message.toolWithToolCallList && req.body.message.toolWithToolCallList[0]?.toolCall) 
                               || (req.body.message.toolCalls && req.body.message.toolCalls[0]);
                
                if (firstCall) {
                    toolCallId = firstCall.id;
                    try {
                        const args = JSON.parse(firstCall.function.arguments || '{}');
                        // Use any key the tool decided to pass the message through
                        userMessage = args.message || args.input || args.query || args.transcript || "Help me with my business.";
                    } catch(e) {}
                }
            }
        }

        // Fallback for demo testing
        if (!userMessage || typeof userMessage !== 'string') {
            userMessage = "Could you give me a summary of my business?"; 
        }

        console.log(`[Webhook] User Message: "${userMessage}"`);

        // Execute LLM agent logic which will call tools if needed
        const agentResponse = await runAgent(userMessage);

        console.log(`[Webhook] Agent Response: "${agentResponse}"`);

        // If Vapi invoked this as a Custom Tool, it expects a "results" array
        if (isToolCall && toolCallId) {
            console.log(`[Webhook] Returning VAPI Custom Tool results array for ToolCallID: ${toolCallId}`);
            return res.json({
                results: [
                    {
                        toolCallId: toolCallId,
                        result: agentResponse
                    }
                ]
            });
        }

        // Mandatory response format requested natively via standard webhook
        res.json({
            output: agentResponse
        });

    } catch (error) {
        console.error("[Webhook] Error processing VAPI webhook:", error);
        res.status(500).json({ output: "Sorry, I am facing technical difficulties." });
    }
});

module.exports = router;
