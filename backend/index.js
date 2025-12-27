import express from 'express';
import mongoose from 'mongoose';
import doctorRoutes from './routes/doctor.js';
import patientRoutes from './routes/patients.js';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointment.js';



const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRoutes);
app.use('/api', doctorRoutes);
app.use('/api', patientRoutes);
app.use('/api', appointmentRoutes);


const mongoDbConnction = () => {
    try {
        mongoose.connect('mongodb+srv://prasadvikash742:prasadvikash742@cluster0.wc7jxyy.mongodb.net/sasmaDB');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

mongoDbConnction();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});