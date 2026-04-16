const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clientName: { type: String, required: true, trim: true },
  type: { type: String, enum: ['bag', 'packaging', 'fabric'], required: true },
  specification: { type: String, trim: true, default: '' },
  rate: { type: Number, required: true, default: 0 },
  quantity: { type: Number, required: true },
  completedQty: { type: Number, default: 0 },
  sentQty: { type: Number, default: 0 },
  deliveryDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

// Virtual for pending quantity
orderSchema.virtual('pendingQty').get(function () {
  return this.quantity - this.completedQty;
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
