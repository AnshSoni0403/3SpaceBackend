const express = require('express');
const router = express.Router();
const Career = require('../models/Career');
const { check, validationResult } = require('express-validator');

// @route   POST api/careers
// @desc    Create a new career posting
// @access  Private (Admin)
router.post('/', 
  [
    check('JobTitle', 'Job title is required').not().isEmpty(),
    check('Field', 'Field is required').isIn(['Engineering', 'Software', 'Production', 'Operations']),
    check('workType', 'Work type is required').isIn(['Remote', 'Office', 'Hybrid']),
    check('employmentType', 'Employment type is required').isIn(['Full Time', 'Part Time', 'Contract']),
    check('description', 'Description is required').not().isEmpty(),
    check('responsibilities', 'At least one responsibility is required').isArray({ min: 1 }),
    check('requirements', 'At least one requirement is required').isArray({ min: 1 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
      res.status(500).json({ msg: 'Server Error', error: err.message });
    }
  }
);

// @route   GET api/careers
// @desc    Get all active career postings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const careers = await Career.find({ isActive: true })
      .sort({ postedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Career.countDocuments({ isActive: true });

    res.json({
      careers,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// @route   GET api/careers/all
// @desc    Get all career postings (including inactive - for admin)
// @access  Private (Admin)
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const careers = await Career.find()
      .sort({ postedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Career.countDocuments();

    res.json({
      careers,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
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
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// @route   PUT api/careers/:id
// @desc    Update a career posting
// @access  Private (Admin)
router.put('/:id', 
  [
    check('Field', 'Invalid field value').optional().isIn(['Engineering', 'Software', 'Production', 'Operations']),
    check('workType', 'Invalid work type').optional().isIn(['Remote', 'Office', 'Hybrid']),
    check('employmentType', 'Invalid employment type').optional().isIn(['Full Time', 'Part Time', 'Contract'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const career = await Career.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      
      if (!career) {
        return res.status(404).json({ msg: 'Career posting not found' });
      }
      
      res.json(career);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error', error: err.message });
    }
  }
);

// @route   DELETE api/careers/:id
// @desc    Delete a career posting
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    
    if (!career) {
      return res.status(404).json({ msg: 'Career posting not found' });
    }
    
    await career.remove();
    res.json({ msg: 'Career posting removed successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Career posting not found' });
    }
    res.status(500).json({ msg: 'Server Error', error: err.message });
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
    
    res.json({
      msg: `Career posting marked as ${career.isActive ? 'active' : 'inactive'}`,
      career
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

module.exports = router;