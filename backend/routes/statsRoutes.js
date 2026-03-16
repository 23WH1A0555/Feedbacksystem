const express = require('express');
const Feedback = require('../models/Feedback');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [
      total,
      statusCounts,
      categoryCounts,
      ratingDistribution,
      recentFeedback,
      avgRating
    ] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Feedback.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Feedback.aggregate([
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Feedback.find().sort({ createdAt: -1 }).limit(5).lean(),
      Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }])
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Feedback.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const statusMap = {};
    statusCounts.forEach(s => statusMap[s._id] = s.count);

    const categoryMap = {};
    categoryCounts.forEach(c => categoryMap[c._id] = c.count);

    const ratingMap = {};
    ratingDistribution.forEach(r => ratingMap[r._id] = r.count);

    res.json({
      success: true,
      data: {
        total,
        averageRating: avgRating[0]?.avg ? parseFloat(avgRating[0].avg.toFixed(1)) : 0,
        statusBreakdown: {
          new: statusMap.new || 0,
          reviewed: statusMap.reviewed || 0,
          resolved: statusMap.resolved || 0
        },
        categoryBreakdown: categoryMap,
        ratingDistribution: [1, 2, 3, 4, 5].map(r => ({
          rating: r,
          count: ratingMap[r] || 0
        })),
        monthlyTrend: monthlyTrend.map(m => ({
          month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
          count: m.count,
          avgRating: parseFloat(m.avgRating.toFixed(1))
        })),
        recentFeedback
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;