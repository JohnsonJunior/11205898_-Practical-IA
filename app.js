// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB 
mongoose.connect('your_database_url', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Define MongoDB schema for Patient
const patientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true },
  surname: String,
  othernames: String,
  gender: String,
  phoneNumber: String,
  residentialAddress: String,
  emergencyContact: {
    name: String,
    contact: String,
    relationship: String
  },
  encounters: [{
    dateAndTime: Date,
    type: String,
    vitals: {
      bloodPressure: String,
      temperature: String,
      pulse: String,
      spO2: String
    }
  }]
});

const Patient = mongoose.model('Patient', patientSchema);

// Middleware
app.use(bodyParser.json());

// Endpoints

// 1. Register a new patient
app.post('/patients', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

