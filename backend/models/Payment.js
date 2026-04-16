const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' }
});

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  totalPayable: { type: Number, required: true, default: 0 },
  receivedAmount: { type: Number, default: 0 },
  paymentHistory: [paymentHistorySchema],
  status: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' },
  createdAt: { type: Date, default: Date.now }
});

// Auto-calculate status before save
paymentSchema.pre('save', function (next) {
  if (this.receivedAmount <= 0) {
    this.status = 'Unpaid';
  } else if (this.receivedAmount >= this.totalPayable) {
    this.status = 'Paid';
  } else {
    this.status = 'Partial';
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
