const { db, auth } = require("../config/firebase");

const createUser = async (req, res) => {
    const { idToken, userData } = req.body;

    if (!idToken || !userData) {
        return res.status(400).json({ error: "Missing idToken or userData" });
    }

    try {
        // Verify the ID token
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Ensure the token belongs to the user we are creating data for (optional extra check)
        // Here we just use the UID from the token to store data

        // Store user details in Firestore
        await db.collection("users").doc(uid).set({
            name: userData.name,
            age: userData.age,
            gender: userData.gender,
            email: userData.email,
            // Note: Storing password in plaintext or even DB is generally bad practice if Auth handles it.
            // But adhering to the user's previous schema which included it.
            // ideally we shouldn't store password here as Firebase Auth handles it.
            password: userData.password
        });

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

module.exports = { createUser };
