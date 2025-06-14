import express from 'express';
import Contact from '../models/Contact.js';

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

export default router;
