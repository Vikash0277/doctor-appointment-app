import Patient from "../models/patients/patient.js";   
import Doctor from "../models/doctors/doctor.js";
import express from "express";


const router = express.Router();


router.post('/patient/register', async (req, res) => {
    const { name, phone, password } = req.body;
    try {
        const existingPatient = await Patient.findOne({ phone });
        if (existingPatient) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }   
        const newPatient = new Patient({ name, phone, password });
        await newPatient.save();
        res.status(201).json({ message: 'Patient registered successfully', patientId: newPatient._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }   
});


router.post('/patient/login', async (req, res) => {
    const { phone, password } = req.body;
    try {
        const patient = await Patient.findOne({ phone, password });
        if (!patient) {
            return res.status(400).json({ message: 'Invalid phone number or password' });
        }   
        res.status(200).json({ message: 'Login successful', patientId: patient._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/doctor/register', async (req, res) => {
    const { name, phone, password, experience, specialization, fee, availableDays, availableTimeSlots } = req.body;     
    try {
        const existingDoctor = await Doctor.findOne({ phone });
        if (existingDoctor) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }   
        const newDoctor = new Doctor({ name, phone, password, experience, specialization, fee, availableDays, availableTimeSlots });
        const doctor = await newDoctor.save();
        res.status(201).json({ message: 'Doctor registered successfully', doctorId: doctor._id });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }   
});

router.post('/doctor/login', async (req, res) => {
    const { phone, password } = req.body;
    try {
        const doctor = await Doctor.findOne({ phone, password });   
        if (!doctor) {
            return res.status(400).json({ message: 'Invalid phone number or password' });
        }   
        res.status(200).json({ message: 'Login successful', doctorId: doctor._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }   
});




export default router;