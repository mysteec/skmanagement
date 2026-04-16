const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const ProductionLog = require('../models/ProductionLog');
const Payment = require('../models/Payment');

// GET all distinct client names (for autocomplete)
router.get('/clients', async (req, res) => {
  try {
    const clients = await Order.distinct('clientName');
    res.json(clients.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET pending orders (not completed)
router.get('/pending', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'Completed' } }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET completed orders with optional date range + search
router.get('/completed', async (req, res) => {
  try {
    const { from, to, search } = req.query;
    const filter = { status: 'Completed' };

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { specification: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new order
router.post('/', async (req, res) => {
  try {
    const { clientName, type, specification, rate, quantity, deliveryDate } = req.body;
    const order = new Order({ clientName, type, specification, rate, quantity, deliveryDate });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update order (general)
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Cleanup associated data
    await ProductionLog.deleteMany({ orderId });
    await Payment.deleteOne({ orderId });
    
    res.json({ message: 'Order and associated data deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
