const express = require('express');
const Contact = require('../models/Contact');

const router = express.Router();

// POST - User submits contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const contact = await Contact.create({ name, email, message });

    res.status(201).json({ success: true, message: 'Message received', data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET - Admin panel to see all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE - Delete a contact message by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid contact ID' });
    }

    const deletedContact = await Contact.findByIdAndDelete(id);
    
    if (!deletedContact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    res.json({ success: true, message: 'Contact deleted successfully', data: deletedContact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
