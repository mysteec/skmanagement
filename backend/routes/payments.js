const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// GET all payments (joined with order info)
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().populate('orderId').sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET completed orders that don't have a payment record yet + ones that do
router.get('/overview', async (req, res) => {
  try {
    const completedOrders = await Order.find({ status: 'Completed' }).sort({ createdAt: -1 });
    const payments = await Payment.find().populate('orderId');

    const paymentMap = {};
    payments.forEach(p => {
      if (p.orderId) paymentMap[p.orderId._id.toString()] = p;
    });

    const result = completedOrders.map(order => ({
      order,
      payment: paymentMap[order._id.toString()] || null
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET payment for a specific order
router.get('/order/:orderId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId }).populate('orderId');
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create payment record for an order
router.post('/', async (req, res) => {
  try {
    const { orderId, totalPayable } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Check if payment already exists
    const existing = await Payment.findOne({ orderId });
    if (existing) {
      existing.totalPayable = totalPayable;
      await existing.save();
      return res.json(existing);
    }

    const payment = new Payment({ orderId, totalPayable });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT add a received payment
router.put('/:id/receive', async (req, res) => {
  try {
    const { amount, note } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    payment.receivedAmount += Number(amount);
    payment.paymentHistory.push({ amount: Number(amount), note: note || '', date: new Date() });
    await payment.save();

    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update total payable
router.put('/:id', async (req, res) => {
  try {
    const { totalPayable } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    payment.totalPayable = totalPayable;
    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
