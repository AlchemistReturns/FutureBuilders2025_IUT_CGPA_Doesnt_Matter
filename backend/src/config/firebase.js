const admin = require("firebase-admin");
let serviceAccount;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Production / Vercel: Use environment variable
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, "\n"));
        console.log("Using Firebase credentials from environment variable.");
    } else {
        // Local Development: Use file
        serviceAccount = require("../../serviceAccountKey.json");
        console.log("Using Firebase credentials from local file.");
    }
} catch (error) {
    console.error("Failed to load Firebase credentials:", error);
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
});


const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };
