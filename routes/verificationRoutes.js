const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const rateLimit = require('express-rate-limit');
const verificationController = require('../controllers/verificationController');
const validators = require('../middleware/validators');

// Rate limiting for verification requests (5 requests per 15 minutes per IP)
const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many verification attempts from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/verify/request
 * @desc    Request email verification
 * @access  Public
 */
router.post(
  '/request',
  verificationLimiter,
  validators.requestVerification,
  verificationController.requestVerification
);

/**
 * @route   GET /api/verify/confirm
 * @desc    Confirm email verification
 * @access  Public
 */
router.get(
  '/confirm',
  validators.verifyToken,
  verificationController.verifyToken
);

module.exports = router;
