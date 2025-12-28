require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { registerUser, loginUser } = require("./controllers/authController");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.post("/api/register", registerUser);
app.post("/api/login", loginUser);

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
