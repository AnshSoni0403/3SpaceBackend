
const express = require('express');
const Product = require('../models/Product');
const upload = require('../middleware/upload');
const router = express.Router();


// POST /api/products - Add a new product (Admin, with image upload)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, oldPrice, isNew, tags } = req.body;
    const imagePath = req.file ? req.file.path : undefined;
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
