import Appointment from "../models/appointments/appointment.js";
import Doctor from "../models/doctors/doctor.js";
import express from "express";

const router = express.Router();

router.get("/appointment/:id", async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate("doctorId", "name specialization experience fee availableDays availableTimeSlots")
            .populate("patientId", "name phone age");

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        console.log(appointment);
        res.status(200).json(appointment);

    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/appointments/:id/complete", async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: "completed" },
            { new: true }
        );
        res.status(200).json(appointment);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


router.get("/:patientId/appointments", async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.params.patientId })
            .populate("doctorId", "name specialization experience")
            .sort({ date: 1 });

        res.status(200).json(appointments);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


router.put("/appointments/:id/cancel", async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: "canceled" },
            { new: true }
        );

        res.status(200).json(appointment);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


router.put("/appointments/:id/reschedule", async (req, res) => {
    const { id } = req.params;
    const { date, slotTime } = req.body;

    try {
        const appointment = await Appointment.findById(id);
        if (!appointment)
            return res.status(404).json({ message: "Appointment not found" });

        const conflict = await Appointment.findOne({
            doctorId: appointment.doctorId,
            date: new Date(date),
            "slotTime.start": slotTime.start,
            "slotTime.end": slotTime.end,
            status: { $ne: "canceled" },
            _id: { $ne: id }
        });

        if (conflict)
            return res.status(400).json({ message: "Slot already booked" });

        appointment.date = date;
        appointment.slotTime = slotTime;
        appointment.status = "rescheduled";
        appointment.rescheduleCount += 1;

        await appointment.save();

        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});



export default router;

