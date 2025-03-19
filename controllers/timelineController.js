const Event = require('../models/Event');

// Fetch all events (sorted by date)
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error); // Log the error for debugging
    res.status(500).json({ error: 'Error fetching events' });
  }
};

// Add a new event
exports.addEvent = async (req, res) => {
  const { eventName, date } = req.body;
  try {
    const newEvent = new Event({ eventName, date });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error adding event:', error); // Log the error for debugging
    res.status(400).json({ error: 'Error adding event' });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json(deletedEvent);
  } catch (error) {
    console.error('Error deleting event:', error); // Log the error for debugging
    res.status(500).json({ error: 'Error deleting event' });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { eventName, date } = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(id, { eventName, date }, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to update event' });
  }
};
