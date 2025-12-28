const { db, auth } = require("../config/firebase");

// Create a new appointment
const createAppointment = async (req, res) => {
    try {
        console.log("Received appointment request:", req.body); // DEBUG LOG
        const { doctorId, doctorName, patientId, patientName, date, time, reason } = req.body;

        if (!doctorId || !patientId || !date || !time) {
            console.log("Missing fields:", { doctorId, patientId, date, time }); // DEBUG LOG
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newAppointment = {
            doctorId,
            doctorName,
            patientId,
            patientName,
            date,
            time,
            reason: reason || "",
            status: "pending", // pending, accepted, rejected
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection("appointments").add(newAppointment);

        res.status(201).json({
            success: true,
            message: "Appointment request sent",
            appointmentId: docRef.id
        });

    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ error: "Failed to create appointment" });
    }
};

// Get appointments for a specific doctor
const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const snapshot = await db.collection("appointments")
            .where("doctorId", "==", doctorId)
            // .orderBy("createdAt", "desc") // Firebase requires an index for this combination, skipping for now
            .get();

        const appointments = [];
        snapshot.forEach(doc => {
            appointments.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({ success: true, count: appointments.length, data: appointments });

    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        await db.collection("appointments").doc(id).update({ status });

        res.status(200).json({ success: true, message: `Appointment ${status}` });

    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ error: "Failed to update appointment" });
    }
};

// Get appointments for a specific patient
const getPatientAppointments = async (req, res) => {
    try {
        const { patientId } = req.params;
        const snapshot = await db.collection("appointments")
            .where("patientId", "==", patientId)
            .get();

        const appointments = [];
        snapshot.forEach(doc => {
            appointments.push({ id: doc.id, ...doc.data() });
        });

        // Sort by date/time manually since Firestore query sorting requires index
        appointments.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

        res.status(200).json({ success: true, count: appointments.length, data: appointments });

    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
};

module.exports = { createAppointment, getDoctorAppointments, updateAppointmentStatus, getPatientAppointments };
