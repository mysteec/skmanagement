const express = require('express');
const router = express.Router();
const ProductionLog = require('../models/ProductionLog');
const Order = require('../models/Order');

// GET production logs for an order
router.get('/:orderId', async (req, res) => {
  try {
    const logs = await ProductionLog.find({ orderId: req.params.orderId }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST log production (also updates order completedQty / sentQty / status)
router.post('/', async (req, res) => {
  try {
    const { orderId, quantityProduced, sent, sentQty, notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Create log
    const log = new ProductionLog({
      orderId,
      quantityProduced,
      sent: sent || false,
      sentQty: sent ? (sentQty || 0) : 0,
      notes: notes || ''
    });
    await log.save();

    // Update order quantities
    order.completedQty = Math.min(order.completedQty + quantityProduced, order.quantity);
    if (sent) {
      order.sentQty = Math.min(order.sentQty + (sentQty || 0), order.quantity);
    }

    // Auto-update status
    if (order.completedQty >= order.quantity) {
      order.status = 'Completed';
    } else if (order.completedQty > 0) {
      order.status = 'In Progress';
    }

    await order.save();
    res.status(201).json({ log, order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update a production log entry (for corrections)
router.put('/:id', async (req, res) => {
  try {
    const { quantityProduced, sent, sentQty, notes } = req.body;
    const log = await ProductionLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });

    const order = await Order.findById(log.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Reverse old values
    order.completedQty -= log.quantityProduced;
    if (log.sent) order.sentQty -= log.sentQty;

    // Apply new values
    log.quantityProduced = quantityProduced;
    log.sent = sent || false;
    log.sentQty = sent ? (sentQty || 0) : 0;
    log.notes = notes || log.notes;
    await log.save();

    order.completedQty = Math.max(0, Math.min(order.completedQty + quantityProduced, order.quantity));
    if (sent) order.sentQty = Math.max(0, Math.min(order.sentQty + (sentQty || 0), order.quantity));

    // Auto-update status
    if (order.completedQty >= order.quantity) {
      order.status = 'Completed';
    } else if (order.completedQty > 0) {
      order.status = 'In Progress';
    } else {
      order.status = 'Pending';
    }

    await order.save();
    res.json({ log, order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
