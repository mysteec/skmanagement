const mongoose = require('mongoose');

const productionLogSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  quantityProduced: { type: Number, required: true },
  sent: { type: Boolean, default: false },
  sentQty: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
});

module.exports = mongoose.model('ProductionLog', productionLogSchema);
