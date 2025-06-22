const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const Blog = require('../models/blog');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// @route   POST /api/blogs
// @desc    Create a new blog post
// @access  Private (Admin)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, excerpt, content, author, readingTime, category, date } = req.body;
    let image = req.body.image;
    if (req.file) {
      image = '/uploads/' + req.file.filename;
    }

    const newBlog = new Blog({
      title,
      subtitle,
      excerpt,
      content,
      author,
      readingTime: readingTime ? Number(readingTime) : undefined,
      category,
      image,
      date
    });

    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// @route   GET /api/blogs
// @desc    Get all active blog posts (public)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ isActive: true }).sort({ postedAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// @route   GET /api/blogs/all
// @desc    Get all blogs (including inactive) - Admin
router.get('/all', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ postedAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// @route   GET /api/blogs/:id
// @desc    Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    res.json(blog);
  } catch (err) {
    console.error('Error fetching blog:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update blog post
// @access  Private (Admin)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      updateData.image = '/uploads/' + req.file.filename;
    }
    if (updateData.readingTime) {
      updateData.readingTime = Number(updateData.readingTime);
    }
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
    if (!updatedBlog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    res.json(updatedBlog);
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete blog post
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ success: false, message: 'Blog not found or already deleted' });
    }

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
      data: { id: deletedBlog._id, title: deletedBlog.title }
    });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ success: false, message: 'Failed to delete blog', error: err.message });
  }
});

// @route   PUT /api/blogs/toggle/:id
// @desc    Toggle blog post active status
// @access  Private (Admin)
router.put('/toggle/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    blog.isActive = !blog.isActive;
    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error('Error toggling blog status:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

module.exports = router;
