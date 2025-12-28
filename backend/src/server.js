require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { registerUser, loginUser } = require("./controllers/authController");
const multer = require('multer');
const { consultAI } = require('./controllers/aiController');


const app = express();
const port = process.env.PORT || 5000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Routes
app.post("/api/register", registerUser);
app.post("/api/login", loginUser);
app.post("/api/consult", upload.single('image'), consultAI);
app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
