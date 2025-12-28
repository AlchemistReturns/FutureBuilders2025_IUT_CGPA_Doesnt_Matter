const fetch = require("node-fetch-commonjs");

const BASE_URL = "http://localhost:5000/api";
const USER_ID = "test-verification-user";

async function testChat() {
    console.log("1. Testing Chat Send...");
    try {
        const response = await fetch(`${BASE_URL}/chat/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: USER_ID,
                text: "Hello, this is a test message from the verification script."
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Send failed: ${err}`);
        }

        const data = await response.json();
        console.log("✅ Chat Send Success:", data.response.substring(0, 50) + "...");

    } catch (error) {
        console.error("❌ Chat Send Failed:", error.message);
    }

    console.log("\n2. Testing Chat History...");
    try {
        const response = await fetch(`${BASE_URL}/chat/history/${USER_ID}`);

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`History failed: ${err}`);
        }

        const data = await response.json();
        const messages = data.messages;
        console.log(`✅ Chat History Success: Retrieved ${messages.length} messages.`);

        const lastMsg = messages[messages.length - 1];
        if (lastMsg) {
            console.log(`   Last message: [${lastMsg.sender}] ${lastMsg.text.substring(0, 30)}...`);
        }

    } catch (error) {
        console.error("❌ Chat History Failed:", error.message);
    }
}

testChat();
