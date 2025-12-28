require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { registerUser, loginUser, getDoctors } = require("./controllers/authController");
const multer = require('multer');
const { sendMessage, getHistory } = require('./controllers/aiController');
const { symptomTracker } = require('./controllers/aiController');
// 🟢 NEW: Import the Hospital Controller
const { getNearbyHospitals } = require('./controllers/hospitalController');
// 🟢 NEW: Import Appointment Controller
const { createAppointment, getDoctorAppointments, updateAppointmentStatus } = require('./controllers/appointmentController');

const app = express();
const port = process.env.PORT || 5000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Routes
app.post("/api/register", registerUser);
app.post("/api/login", loginUser);
app.get("/api/doctors", getDoctors); // 🟢 NEW: Get Doctors List
app.post("/api/chat/send", upload.single('image'), sendMessage);
app.get("/api/chat/history/:userId", getHistory);
app.post("/api/symptom-tracker", symptomTracker);
// 🟢 NEW: Hospital Finder Route
app.get("/api/hospitals", getNearbyHospitals);
// 🟢 NEW: Appointment Routes
app.post("/api/appointments", createAppointment);
app.get("/api/appointments/doctor/:doctorId", getDoctorAppointments);
app.put("/api/appointments/:id/status", updateAppointmentStatus);
app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
