const mongoose = require('mongoose');

const TransactionHistorySchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fromName: String,
  toName: String,
  amount: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TransactionHistory", TransactionHistorySchema);