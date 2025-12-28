require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { registerUser, loginUser } = require("./controllers/authController");
const multer = require('multer');
const { sendMessage, getHistory } = require('./controllers/aiController');
const { symptomTracker } = require('./controllers/aiController');


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
app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
