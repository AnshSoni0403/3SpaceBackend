const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Career = require('../models/Career');

// @route   POST api/careers
// @desc    Create a new career posting
// @access  Private (Admin)
router.post('/', async (req, res) => {
    try {
        const newCareer = new Career({
            JobTitle: req.body.JobTitle,
            Field: req.body.Field,
            workType: req.body.workType,
            employmentType: req.body.employmentType,
            description: req.body.description,
            responsibilities: req.body.responsibilities,
            requirements: req.body.requirements
        });

        const career = await newCareer.save();
        res.json(career);
    } catch (err) {
        console.error(err.message);
       res.status(500).json({ error: 'Server Error', message: err.message });
    }
});

// @route   GET api/careers
// @desc    Get all active career postings
// @access  Public
// In your backend route file
router.get('/all', async (req, res) => {
    try {
      const careers = await Career.find().sort({ postedAt: -1 });
      res.json(careers);
    } catch (err) {
      console.error('Error fetching careers:', err);
      res.status(500).json({ 
        error: 'Server Error',
        message: err.message 
      });
    }
  });

// @route   GET api/careers/all
// @desc    Get all career postings (including inactive - for admin)
// @access  Private (Admin)
router.get('/all', async (req, res) => {
    try {
        const careers = await Career.find().sort({ postedAt: -1 });
        res.json(careers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/careers/:id
// @desc    Get career posting by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const career = await Career.findById(req.params.id);
        if (!career) {
            return res.status(404).json({ msg: 'Career posting not found' });
        }
        res.json(career);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Career posting not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/careers/:id
// @desc    Update a career posting
// @access  Private (Admin)
router.put('/:id', async (req, res) => {
    try {
        const career = await Career.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        
        if (!career) {
            return res.status(404).json({ msg: 'Career posting not found' });
        }
        
        res.json(career);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/careers/:id
// @desc    Delete a career posting
// @access  Private (Admin)
// @route   DELETE /api/careers/:id
// @desc    Delete a career posting
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid career ID format'
            });
        }

        const deletedCareer = await Career.findByIdAndDelete(id);
        
        if (!deletedCareer) {
            return res.status(404).json({
                success: false, 
                message: 'Career not found or already deleted'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Career deleted successfully',
            data: {
                id: deletedCareer._id,
                title: deletedCareer.JobTitle
            }
        });
        
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete career',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// @route   PUT api/careers/toggle/:id
// @desc    Toggle career posting status (active/inactive)
// @access  Private (Admin)
router.put('/toggle/:id', async (req, res) => {
    try {
        const career = await Career.findById(req.params.id);
        
        if (!career) {
            return res.status(404).json({ msg: 'Career posting not found' });
        }
        
        career.isActive = !career.isActive;
        await career.save();
        
        res.json(career);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
