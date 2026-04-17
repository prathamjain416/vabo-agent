# Voice AI Business Operations Agent 🎙️💼

Welcome to the Voice AI Business Operations Agent backend! I built this Node.js/Express application to serve as the intelligence and integration layer for a conversational voice agent capable of securely hooking into external tools like Shopify, HubSpot CRM, and a Qdrant vector database.

### Core Features ✨
* **Groq AI Engine:** Powered by the blazing fast `llama-3.3-70b-versatile` model, utilizing native tool/function calling logic so the AI can autonomously query metrics and update system states during a call.
* **Vector Memory Persistence:** Fully integrated with **Qdrant** to seamlessly save and retrieve conversational context or past business data.
* **Plug & Play Vapi Webhook:** Built intentionally to operate flawlessly as either a standard Server URL or a Vapi Custom Tool (`POST /vapi-webhook`). It dynamically parses payload shapes (`toolCalls` vs `tool-calls`) and returns compliant JSON automatically.
* **Modular Integrations System:** Codebase is decoupled into scalable `/integrations` and `/services` scopes.
* **Graceful Mocking & Fallbacks:** Not ready to plug in your production API keys? The system robustly detects missing configurations (Shopify, HubSpot, Qdrant) and dynamically falls back to returning mock responses—ensuring the agent never crashes during development bridging.

---

## 🚀 Installation & Setup

Follow these steps to configure and run the agent locally:

### 1. Install Dependencies
Ensure you have [Node.js](https://nodejs.org) installed on your machine.
```bash
npm install
```

### 2. Configure Environment Variables
Copy the provided `.env.example` template to create your own local configuration.
```bash
cp .env.example .env
```
Inside your new `.env` file, populate your required API keys (at a minimum, provide your `GROQ_API_KEY`).

### 3. Start the Local Server
Boot up the backend server:
```bash
npm start
```
*The server will run on port `3000` by default. You can visit `http://localhost:3000/` to verify it's running.*

### 4. Connect to Vapi (or other Voice Providers)
To hook this up to your remote Voice Agent dashboard, you need to expose your local port publicly.

Use `ngrok http 3000` (or `cloudflared tunnel`) to securely expose your localhost:
```bash
ngrok http 3000
```
Take the generated URL (e.g., `https://your-url.ngrok.io/vapi-webhook`) and paste it into your Vapi dashboard as your Custom Tool Webhook URL.

---

## 🔌 API Endpoints

* **`POST /vapi-webhook`** - Main interaction endpoint for Vapi and voice conversational pipelines.
* **`GET /shopify/summary`** - Raw execution metric summarizing total revenue and recent orders.
* **`GET /crm/leads`** - Retrieves all pending lead contacts.
* **`POST /crm/followup`** - Triggers a generation of follow-up tasks to your CRM tool. 
* **`GET /`** - Standard health check to verify server heartbeat.
