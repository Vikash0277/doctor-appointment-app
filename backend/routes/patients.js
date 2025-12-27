import Doctor from '../models/doctors/doctor.js';
import express from 'express';
import Patient from '../models/patients/patient.js';
import Appointment from '../models/appointments/appointment.js';

const router = express.Router();


router.get("/doctor/:id/booked-slots", async (req, res) => {
    const { id } = req.params;
    const { day } = req.query;

    const slots = await Appointment.find({
        doctorId: id,
        status: { $ne: "canceled" }
    }).select("slotTime date");

    res.json(slots);
});

router.get('/appointments/:patientId', async (req, res) => {
    const { patientId } = req.params;
    try {
        const appointments = await Appointment.find({ patientId })
            .populate('doctorId', 'name specialization experience fee')
            .populate('patientId', 'name')
            .exec();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get("/doctors", async (req, res) => {
    try {
        const doctors = await Doctor.find({});

        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/book", async (req, res) => {
    try {
        const { doctorId, patientId, date, slotTime, day } = req.body;

        const selectedDate = new Date(date).toDateString();

        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0);

        const existing = await Appointment.findOne({
            patientId,
            status: { $ne: "cancelled" },
            "slotTime.start": slotTime.start,
        });

        if (existing) {
            const existingDate = new Date(existing.date).toDateString();
            if (existingDate === selectedDate) {
                return res.status(400).json({
                    message: "You already have an appointment at this time."
                });
            }
        }

        const conflict = await Appointment.findOne({
            patientId,
            date: dateOnly,
            "slotTime.start": slotTime.start,
            status: { $ne: "cancelled" }
        });

        if (conflict) {
            return res.status(400).json({
                message: "You already have an appointment at this time."
            });
        }

        const newApp = await Appointment.create({
            doctorId,
            patientId,
            date: dateOnly,
            day,
            slotTime,
            status: "booked"
        });

        res.json(newApp);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error booking appointment" });
    }
});


export default router;