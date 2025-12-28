require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { registerUser, loginUser } = require("./controllers/authController");
const multer = require('multer');
const { sendMessage, getHistory } = require('./controllers/aiController');
const { symptomTracker } = require('./controllers/aiController');
// 🟢 NEW: Import the Hospital Controller
const { getNearbyHospitals } = require('./controllers/hospitalController');

const app = express();
const port = process.env.PORT || 5000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Routes
app.post("/api/register", registerUser);
app.post("/api/login", loginUser);
app.post("/api/chat/send", upload.single('image'), sendMessage);
app.get("/api/chat/history/:userId", getHistory);
app.post("/api/symptom-tracker", symptomTracker);
const { getHealthInsights } = require('./controllers/aiController');
app.get("/api/ai/insights/:userId", getHealthInsights);
// 🟢 NEW: Hospital Finder Route
app.get("/api/hospitals", getNearbyHospitals);

// 🟢 NEW: Disease History Routes
const { addDisease, getDiseases } = require('./controllers/diseaseController');
app.post("/api/diseases", addDisease);
app.get("/api/diseases/:userId", getDiseases);

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
