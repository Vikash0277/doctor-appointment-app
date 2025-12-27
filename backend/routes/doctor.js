
import Appointment from "../models/appointments/appointment.js";
import express from "express";
import Doctor from "../models/doctors/doctor.js";

const router = express.Router();

router.get('/appointments/:doctorId', async (req, res) => {
    const { doctorId } = req.params;
    try {
        const appointments = await Appointment.find({ doctorId })
            .populate('doctorId', 'name ')
            .populate('patientId', 'name phone age  ')
            .exec();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/doctor/:doctorId', async (req, res) => {
    const { doctorId } = req.params;
    try {
        const doctor = await Doctor.findById(doctorId).select(
            "name specialization experience fee availableDays availableTimeSlots"
        );
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put("/doctor/:id", async (req, res) => {
    const { availableDays, availableTimeSlots, fee } = req.body;

    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        if (typeof availableTimeSlots !== "object") {
            return res.status(400).json({ message: "Invalid timeSlots format" });
        }

        const toMinutes = (t) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
        };

        for (const day of availableDays) {
            const slots = availableTimeSlots[day] || [];

            const seen = new Set();
            for (const slot of slots) {
                const key = `${slot.start}-${slot.end}`;
                if (seen.has(key)) {
                    return res.status(400).json({
                        message: `Duplicate slot found on ${day}: ${slot.start} - ${slot.end}`,
                    });
                }
                seen.add(key);
            }

            slots.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

            for (let i = 0; i < slots.length - 1; i++) {
                const current = slots[i];
                const next = slots[i + 1];

                if (toMinutes(current.end) > toMinutes(next.start)) {
                    return res.status(400).json({
                        message: `Overlapping slots on ${day}: ${current.start}-${current.end} overlaps with ${next.start}-${next.end}`,
                    });
                }
            }
        }

        doctor.availableDays = availableDays;

        doctor.availableTimeSlots = availableTimeSlots;

        doctor.fee = fee;

        await doctor.save();

        res.json({ message: "Profile updated", doctor });

    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
});



router.get("/doctor/:doctorId/stats", async (req, res) => {
    const { doctorId } = req.params;

    try {
        const doctorExists = await Doctor.findById(doctorId);
        if (!doctorExists) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const weeklyTotal = await Appointment.countDocuments({
            doctorId,
            date: { $gte: startOfWeek },
        });

        const monthlyTotal = await Appointment.countDocuments({
            doctorId,
            date: { $gte: startOfMonth },
        });

        const completed = await Appointment.countDocuments({
            doctorId,
            status: "completed",
        });

        const cancelled = await Appointment.countDocuments({
            doctorId,
            status: "canceled",
        });

        const appointments = await Appointment.find(
            { doctorId },
            "date"
        );

        const dayCount = {};
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        appointments.forEach((appt) => {
            const day = dayNames[new Date(appt.date).getDay()];
            dayCount[day] = (dayCount[day] || 0) + 1;
        });

        let mostBookedDay = "None";
        if (Object.keys(dayCount).length > 0) {
            mostBookedDay = Object.keys(dayCount).reduce((a, b) =>
                dayCount[a] > dayCount[b] ? a : b
            );
        }

        res.json({
            weeklyTotal,
            monthlyTotal,
            completed,
            cancelled,
            mostBookedDay,
        });
    } catch (err) {
        console.error("Stats error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
