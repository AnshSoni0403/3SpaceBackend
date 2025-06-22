const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  subtitle: {
    type: String,
    maxlength: [250, 'Subtitle cannot exceed 250 characters']
  },
  content: {
    type: String,
    required: false // allow brief posts that only have excerpt
  },
  author: {
    type: String,
    required: [true, 'Author is required']
  },
  readingTime: {
    type: Number,
    required: [true, 'Estimated reading time is required'],
    min: [1, 'Reading time must be at least 1 minute']
  },
  category: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  date: {
    type: String,
    required: false // Accept formatted date string as provided
  },
  isActive: {
    type: Boolean,
    default: true
  },
  postedAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add full-text search index
blogSchema.index({
  title: 'text',
  excerpt: 'text',
  content: 'text',
  author: 'text',
  subtitle: 'text',
  category: 'text'
});

// Virtual formatted date
blogSchema.virtual('postedDate').get(function () {
  return this.postedAt ? this.postedAt.toLocaleDateString() : new Date().toLocaleDateString();
});

module.exports = mongoose.model('Blog', blogSchema);