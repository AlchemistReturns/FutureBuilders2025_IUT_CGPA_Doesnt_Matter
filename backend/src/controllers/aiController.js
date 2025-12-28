const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.consultAI = async (req, res) => {
    try {
        console.log("Request received");

        const { symptom } = req.body;
        const imageFile = req.file;

        console.log("Symptom:", symptom);
        console.log("Image:", imageFile ? "Yes" : "No");

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        let parts = [
            "You are a medical assistant. Analyze this. Give short advice.",
            `\nSymptom: ${symptom}`
        ];

        if (imageFile) {
            console.log("Reading image...");
            parts.push({
                inlineData: {
                    data: fs.readFileSync(imageFile.path).toString("base64"),
                    mimeType: imageFile.mimetype
                }
            });
        }

        console.log("Sending to Gemini...");
        const result = await model.generateContent(parts);
        const response = await result.response;

        console.log("Gemini response received");

        if (imageFile) fs.unlinkSync(imageFile.path);

        res.json({ advice: response.text() });

    } catch (error) {
        console.error("AI Controller Error:", error);
        res.status(500).json({
            error: error.message
        });
    }
};
