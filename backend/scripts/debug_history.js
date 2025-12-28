const fetch = require("node-fetch-commonjs");

const BASE_URL = "http://localhost:5000/api";
const USER_ID = "jJe1BPXdlJeeW5ut5nvpXpWRiMg1"; // User's ID from logs

async function debugHistory() {
    console.log(`Testing Chat History for user: ${USER_ID}`);
    try {
        const response = await fetch(`${BASE_URL}/chat/history/${USER_ID}`);

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`History failed: ${response.status} ${err}`);
        }

        const data = await response.json();
        console.log("✅ Chat History Success:", data);

    } catch (error) {
        console.error("❌ Chat History Failed:", error.message);
    }
}

debugHistory();
