const admin = require("firebase-admin");

let credential;

if (process.env.FIREBASE_PRIVATE_KEY) {
    credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    });
} else {
    try {
        const serviceAccount = require("../../serviceAccountKey.json");
        credential = admin.credential.cert(serviceAccount);
        console.log("Using local serviceAccountKey.json");
    } catch (error) {
        console.error("Failed to load credentials. Ensure FIREBASE_PRIVATE_KEY env var is set or serviceAccountKey.json exists.");
        process.exit(1);
    }
}

admin.initializeApp({
    credential: credential
});


const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };
