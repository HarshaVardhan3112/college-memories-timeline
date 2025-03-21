const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importing the cors package
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Use the CORS middleware
app.use(cors());  // This allows all origins, you can restrict it later for more security

app.use(express.json());  // To parse JSON requests

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

// Event model
const Event = require('./models/Event');

// Root route (GET /)
app.get('/', (req, res) => {
  res.send('Welcome to the College Memories Timeline API');
});


// API routes
app.get('/api/timeline', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });  // Sorted by date
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

app.post('/api/timeline', async (req, res) => {
  console.log(req.body);  // Check the incoming request body
  try {
    const newEvent = new Event({
      eventName: req.body.eventName,
      date: req.body.date,
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);  // Log the actual error
    res.status(400).json({ message: 'Error adding event', error: error.message });
  }
});

// PUT route to update an event
app.put('/api/timeline/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const updatedEvent = {
      eventName: req.body.eventName,
      date: req.body.date,
    };

    // Find the event by ID and update it
    const result = await Event.findByIdAndUpdate(eventId, updatedEvent, { new: true });

    if (!result) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);  // Log the actual error
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
});

app.delete('/api/timeline/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    res.json(deletedEvent);
  } catch (error) {
    res.status(400).json({ message: 'Error deleting event' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));