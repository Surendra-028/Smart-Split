const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    itemName: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  date: {
    type: Date,
    default: Date.now
  }
});

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  expenses: [ExpenseSchema],
  balances: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    owedToMe: {
      type: Number,
      default: 0
    },
    iOwe: {
      type: Number,
      default: 0
    }
  }],
  ledger: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, default: 0 }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Group = mongoose.model("group", GroupSchema);

module.exports = {
  Group,
  ExpenseSchema
};