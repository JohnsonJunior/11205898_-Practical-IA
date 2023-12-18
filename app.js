// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB 
mongoose.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true });
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

/ 2. Start an encounter for a patient
app.post('/patients/:patientId/encounters', async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const encounter = req.body;
    patient.encounters.push(encounter);
    await patient.save();

    res.status(201).json(encounter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Submit patient vitals by nurse
app.put('/patients/:patientId/vitals', async (req, res) => {
    try {
      const patient = await Patient.findOne({ patientId: req.params.patientId });
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
  
      const vitals = req.body;
      patient.encounters[patient.encounters.length - 1].vitals = vitals;
      await patient.save();
  
      res.status(200).json(vitals);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // 4. View a list of patients
  app.get('/patients', async (req, res) => {
    try {
      const patients = await Patient.find();
      res.status(200).json(patients);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // 5. View details of a specific patient
  app.get('/patients/:patientId', async (req, res) => {
    try {
      const patient = await Patient.findOne({ patientId: req.params.patientId });
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
  
      res.status(200).json(patient);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Start the server
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  