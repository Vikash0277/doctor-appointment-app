import mongoose from "mongoose";


const patientSchema = new mongoose.Schema({
    role: {
        type: String,
        default: 'patient'
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    visitHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }]
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;