const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');

// Coupon management routes
router.post('/', authenticate, authorize('ADMIN', 'ORGANIZER'), async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/validate', authenticate, async (req, res) => {
  try {
    const { code, eventId, userId } = req.body;
    
    const coupon = await Coupon.findOne({
      code,
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon' });
    }

    // Check usage limits
    if (coupon.usageLimit.total && coupon.usageCount >= coupon.usageLimit.total) {
      return res.status(400).json({ error: 'Coupon usage limit exceeded' });
    }

    // Check event applicability
    if (coupon.applicableEvents.length > 0 && !coupon.applicableEvents.includes(eventId)) {
      return res.status(400).json({ error: 'Coupon not applicable for this event' });
    }

    // Check user applicability
    if (coupon.applicableUsers.length > 0 && !coupon.applicableUsers.includes(userId)) {
      return res.status(400).json({ error: 'Coupon not applicable for this user' });
    }

    res.json({ success: true, coupon, message: 'Coupon is valid' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;