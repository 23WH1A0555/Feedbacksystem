const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const feedbackValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('category').isIn(['general', 'bug', 'feature', 'support', 'other']).withMessage('Invalid category'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be 5-200 characters'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters'),
];

// POST - Submit feedback
router.post('/', feedbackValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, category, rating, subject, message } = req.body;
    const feedback = await Feedback.create({ name, email, category, rating, subject, message });
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully! Thank you.',
      data: feedback
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET - Get all feedback
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.rating) filter.rating = parseInt(req.query.rating);

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Feedback.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET - Single feedback
router.get('/:id', param('id').isMongoId().withMessage('Invalid ID'), handleValidationErrors, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// PUT - Update status
router.put('/:id/status',
  param('id').isMongoId(),
  body('status').isIn(['new', 'reviewed', 'resolved']),
  handleValidationErrors,
  async (req, res) => {
    try {
      const feedback = await Feedback.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true }
      );
      if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
      res.json({ success: true, message: 'Status updated', data: feedback });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  }
);

// DELETE - Delete feedback
router.delete('/:id', param('id').isMongoId().withMessage('Invalid ID'), handleValidationErrors, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;