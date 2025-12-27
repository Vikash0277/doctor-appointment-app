import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  role: {
    type: String,
    default: "doctor",
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  fee: {
    type: Number,
  },

  availableDays: {
    type: [String],
  },

  availableTimeSlots: {
    type: Map,
    of: [
      {
        start: String,
        end: String,
      },
    ],
    default: {},
  },
});

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
