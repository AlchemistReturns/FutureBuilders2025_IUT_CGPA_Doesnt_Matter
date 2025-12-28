const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { db } = require("../config/firebase");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Ensuring correct model name
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.sendMessage = async (req, res) => {
    try {
        const { userId, text } = req.body;
        const imageFile = req.file;

        if (!userId || (!text && !imageFile)) {
            return res.status(400).json({ error: "Missing userId, text, or image" });
        }

        // 1. Save User Message
        const userMessage = {
            text: text || "",
            sender: "user",
            timestamp: new Date().toISOString(),
            hasImage: !!imageFile
        };
        await db.collection("users").doc(userId).collection("chats").add(userMessage);

        // 2. Prepare History for Context
        // Fetch recent messages without orderBy (to avoid index error), sort in application
        const historySnapshot = await db.collection("users").doc(userId).collection("chats")
            .limit(50) // Fetch reasonable amount
            .get();

        let sortedMessages = historySnapshot.docs.map(doc => doc.data());
        sortedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Take last 10 for context
        const contextMessages = sortedMessages.slice(-10);

        const history = contextMessages.map(data => {
            return {
                role: data.sender === "user" ? "user" : "model",
                parts: [{ text: data.text }]
            };
        });

        // 3. Prepare Current Prompt
        let parts = [{ text: text || "" }];
        if (imageFile) {
            parts.push({
                inlineData: {
                    data: fs.readFileSync(imageFile.path).toString("base64"),
                    mimeType: imageFile.mimetype
                }
            });
        }

        // 4. Generate AI Response
        const chat = model.startChat({
            history: history
        });

        const result = await chat.sendMessage(parts);
        const responseText = result.response.text();

        // 5. Save AI Message
        const aiMessage = {
            text: responseText,
            sender: "ai",
            timestamp: new Date().toISOString()
        };
        await db.collection("users").doc(userId).collection("chats").add(aiMessage);

        // Cleanup
        if (imageFile) fs.unlinkSync(imageFile.path);

        res.json({ response: responseText, message: aiMessage });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ error: "Missing userId" });

        // Fetch without orderBy to avoid index issues on some Firestore setups
        const snapshot = await db.collection("users").doc(userId).collection("chats")
            .limit(100)
            .get();

        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort in memory
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        res.json({ messages });
    } catch (error) {
        console.error("Fetch History Error:", error);
        res.status(500).json({ error: error.message, stack: error.stack, details: JSON.stringify(error) });
    }
};

exports.symptomTracker = async (req, res) => {
    try {
        const { conversation } = req.body;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const systemPrompt = `
You are an AI medical symptom checker.

Rules:
- Ask ONE question at a time.
- Be short and clear.
- Do NOT give a diagnosis too early.
- After enough information, provide:
  1. Probable condition(s)
  2. Severity (Low / Moderate / High)
  3. Advice (home care or doctor visit)
- Always include a medical disclaimer.
- Never claim to be a doctor.
        `;

        const messages = [
            { role: "user", parts: [{ text: systemPrompt }] },
            ...conversation.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.text }]
            }))
        ];

        const result = await model.generateContent({
            contents: messages
        });

        const response = result.response.text();

        res.json({ reply: response });

    } catch (error) {
        console.error("Symptom Tracker Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getHealthInsights = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ error: "Missing userId" });

        // 1. Fetch Disease History
        const snapshot = await db.collection('users').doc(userId).collection('diseases').limit(5).get();
        const diseases = snapshot.docs.map(doc => doc.data());

        // 2. Default message if no history
        if (diseases.length === 0) {
            return res.json({ insight: "We don't have enough health records to provide personalized insights yet. Add your history to get started!" });
        }

        // 3. Construct Prompt
        const historyText = diseases.map(d => `- ${d.name} (${d.date}): ${d.comments || ''}`).join('\n');

        const prompt = `
            Analyze the following patient medical history (most recent first):
            ${historyText}

            Provide a short, friendly, and encouraging health insight or preventive tip (max 2 sentences). 
            Focus on general wellness based on these conditions. Do not give specific medical prescriptions.
        `;

        // 4. Generate Insight
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const insight = result.response.text();

        res.json({ insight });

    } catch (error) {
        console.error("Insight Error:", error);
        res.status(500).json({ error: "Failed to generate insight" });
    }
};
