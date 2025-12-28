const { db } = require('../config/firebase');

const addDisease = async (req, res) => {
    try {
        const { userId, name, date, medicines, comments } = req.body;

        if (!userId || !name || !date) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const docRef = await db.collection('users').doc(userId).collection('diseases').add({
            name,
            date,
            medicines,
            comments,
            createdAt: new Date().toISOString()
        });

        res.status(200).json({ message: "Disease added successfully", id: docRef.id });

    } catch (error) {
        console.error("Error adding disease:", error);
        res.status(500).json({ error: "Failed to add disease" });
    }
};

const getDiseases = async (req, res) => {
    try {
        const { userId } = req.params;

        const snapshot = await db.collection('users').doc(userId).collection('diseases').orderBy('date', 'desc').get();

        const diseases = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json({ diseases });

    } catch (error) {
        console.error("Error fetching diseases:", error);
        res.status(500).json({ error: "Failed to fetch diseases" });
    }
};

module.exports = { addDisease, getDiseases };
