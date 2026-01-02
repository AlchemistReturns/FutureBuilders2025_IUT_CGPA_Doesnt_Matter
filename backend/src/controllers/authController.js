const { db, auth } = require("../config/firebase");
const { signInWithPassword } = require("../utils/firebaseRest");

const registerUser = async (req, res) => {
    const { name, age, gender, email, password } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // 1. Create user in Firebase Auth using Admin SDK
        const userRecord = await auth.createUser({
            email: email,
            password: password,
            displayName: name,
        });
        const uid = userRecord.uid;

        // 2. Store user details in Firestore
        await db.collection("users").doc(uid).set({
            name,
            age,
            gender,
            email,
            password, // Storing password as requested
            role: req.body.role || 'patient', // Default to patient
            specialty: req.body.specialty || '', // For doctors
            experience: req.body.experience || '' // For doctors
        });

        // 3. Authenticate to get ID Token (simulate login)
        const tokenData = await signInWithPassword(email, password);

        res.status(201).json({
            message: "User registered successfully",
            token: tokenData.idToken,
            refreshToken: tokenData.refreshToken,
            userId: uid,
            email: email,
            name: name,
            role: req.body.role || 'patient'
        });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
    }

    try {
        const tokenData = await signInWithPassword(email, password);

        // Fetch user role from Firestore
        const userDoc = await db.collection("users").doc(tokenData.localId).get();
        const userData = userDoc.data();
        const role = userData ? userData.role : 'patient';

        res.status(200).json({
            message: "Login successful",
            token: tokenData.idToken,
            refreshToken: tokenData.refreshToken,
            userId: tokenData.localId,
            email: email,
            name: userData ? userData.name : '',
            role: role
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(401).json({ error: "Invalid credentials" }); // simplify error for security
    }
};

const getDoctors = async (req, res) => {
    try {
        const doctorsSnapshot = await db.collection("users").where("role", "==", "doctor").get();
        const doctors = [];
        doctorsSnapshot.forEach(doc => {
            const data = doc.data();
            // Exclude sensitive info
            doctors.push({
                id: doc.id,
                name: data.name,
                specialty: data.specialty || "General Physician",
                experience: data.experience || "N/A",
                gender: data.gender
            });
        });
        res.json({ success: true, count: doctors.length, data: doctors });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ error: "Failed to fetch doctors" });
    }
};

module.exports = { registerUser, loginUser, getDoctors };
