
const express = require('express');
const Product = require('../models/Product');
const upload = require('../middleware/upload');
const router = express.Router();

// PUT /api/products/:id - Edit a product (with optional image upload)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, oldPrice, isNew, tags } = req.body;
    let updateData = {
      name,
      description,
      price,
      oldPrice,
      isNew,
      tags: tags ? Array.isArray(tags) ? tags : tags.split(',') : [],
    };
    if (req.file) {
      let imagePath = req.file.path.replace(/\\/g, '/');
      updateData.imagePath = imagePath;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});


// POST /api/products - Add a new product (Admin, with image upload)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, oldPrice, isNew, tags } = req.body;
    let imagePath = req.file ? req.file.path : undefined;
    if (imagePath) {
      imagePath = imagePath.replace(/\\/g, '/');
    }
    const product = new Product({
      name,
      description,
      price,
      oldPrice,
      isNew,
      tags: tags ? Array.isArray(tags) ? tags : tags.split(',') : [],
      imagePath
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
