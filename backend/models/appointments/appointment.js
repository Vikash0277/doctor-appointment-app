import mongoose from "mongoose";


const appointmentSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    date: {
        type: Date,
        required: true,
    },
    slotTime: {
        type: {start: String, end: String},
        required: true  
    },
    status: {
        type: String,
        enum: ['scheduled', 'rescheduled', 'booked','completed', 'canceled'],
        default: 'booked'
    },
    rescheduleCount: {
        type: Number,
        default: 0
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
        