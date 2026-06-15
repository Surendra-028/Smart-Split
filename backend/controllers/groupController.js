const mongoose = require('mongoose');
const { GoogleGenAI, Type } = require("@google/genai");
const fs = require('fs').promises;
const { existsSync } = require('fs');
const { Group } = require("../models/Group");
const User = require('../models/userModel')
const nodemailer = require('nodemailer')
const TransactionHistory = require('../models/TransactionModel');

const handleGetRecentTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const txns = await TransactionHistory.find({
      $or: [{ from: userId }, { to: userId }]
    }).sort({ date: -1 });

    return res.json({ success: true, transactions: txns });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const handleGetRecentActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const groups = await Group.find({ members: userId });

    let allExpenses = [];

    groups.forEach(group => {
      group.expenses.forEach(exp => {
        const isPayer = exp.paidBy.toString() === userId;
        const userItems = exp.items.filter(item => item.assignedTo.includes(userId));
        const isParticipant = userItems.length > 0;
        
        if (isPayer || isParticipant) {
          let calculatedAmount = 0;
          
          if (isPayer) {
            calculatedAmount = exp.totalAmount;
          } else if (isParticipant) {
            calculatedAmount = userItems.reduce((sum, item) => sum + (item.price / item.assignedTo.length), 0);
          }

          allExpenses.push({
            description: exp.description,
            amount: calculatedAmount,
            date: exp.date || new Date(),
            groupName: group.name,
            status: isPayer ? 'LENT' : 'BORROWED'
          });
        }
      });
    });

    return res.status(200).json({ 
      success: true, 
      activity: allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20) 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const handleGetLedger = async (req, res) => {
  const currentUserId = req.params.id;
  try {
    const groups = await Group.find({ "members": currentUserId });

    const summary = { owedToMe: [], iOwe: [] };
    const netBalances = {};

    groups.forEach(group => {
      group.ledger.forEach(txn => {
        const from = txn.from.toString();
        const to = txn.to.toString();

        if (from === currentUserId) {
          if (!netBalances[to]) netBalances[to] = 0;
          netBalances[to] -= txn.amount;
        } else if (to === currentUserId) {
          if (!netBalances[from]) netBalances[from] = 0;
          netBalances[from] += txn.amount;
        }
      });
    });

    for (const userId in netBalances) {
      const balance = netBalances[userId];
      if (Math.abs(balance) > 0.01) {
        const userDoc = await User.findById(userId).select('name email');
        if (balance > 0) {
          summary.owedToMe.push({ name: userDoc.name, email: userDoc.email, amount: balance.toFixed(2) });
        } else {
          summary.iOwe.push({ name: userDoc.name, email: userDoc.email, amount: Math.abs(balance).toFixed(2) });
        }
      }
    }

    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const handleGroupCreate = async (req, res) => {
  const { name, description, members } = req.body;
  try {
    const newGroup = await Group.create({
      name,
      description,
      members,
      expenses: [],
      ledger: []
    });
    return res.json({ success: true, message: "Group Created", group: newGroup });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const handleGetGroup = async (req, res) => {
  const id = req.params.id;
  try {
    const group = await Group.findById(id)
      .populate('members', 'name email')
      .populate({
        path: 'expenses.paidBy',
        select: 'name email'
      })
      .populate({
        path: 'expenses.items.assignedTo',
        select: 'name email'
      });
    return res.json({ success: true, group: group });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const handleGetGroups = async (req, res) => {
  try {
    const data = await Group.find({}).populate('members', 'name email');
    return res.json({ success: true, message: "All Groups", groups: data });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const handleAddExpense = async (req, res) => {
  try {
    const { fixedGroupId } = req.params;
    const { description, totalAmount, paidBy, items, userId } = req.body;

    if (!description || !totalAmount || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid expense data" });
    }

    const group = await Group.findById(fixedGroupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });

    const payerId = new mongoose.Types.ObjectId(paidBy);
    const parsedItems = items.map(item => ({
      itemName: item.itemName,
      price: parseFloat(item.price) || 0,
      assignedTo: item.assignedTo.map(id => new mongoose.Types.ObjectId(id))
    }));

    group.expenses.push({
      description,
      totalAmount: parseFloat(totalAmount),
      paidBy: payerId,
      items: parsedItems
    });

    const memberIds = group.members.map(m => m.toString());
    const debtMatrix = {};
    memberIds.forEach(m => {
      debtMatrix[m] = {};
      memberIds.forEach(target => debtMatrix[m][target] = 0);
    });

    group.expenses.forEach(exp => {
      const pId = exp.paidBy.toString();
      exp.items.forEach(item => {
        const share = item.price / item.assignedTo.length;
        item.assignedTo.forEach(uid => {
          const uIdStr = uid.toString();
          if (uIdStr !== pId) {
            debtMatrix[uIdStr][pId] += share;
          }
        });
      });
    });

    const newLedger = [];
    memberIds.forEach((u1, i) => {
      memberIds.slice(i + 1).forEach(u2 => {
        const net = debtMatrix[u1][u2] - debtMatrix[u2][u1];
        if (Math.abs(net) > 0.005) {
          newLedger.push({
            from: new mongoose.Types.ObjectId(net > 0 ? u1 : u2),
            to: new mongoose.Types.ObjectId(net > 0 ? u2 : u1),
            amount: Math.abs(net)
          });
        }
      });
    });

    group.ledger = newLedger;
    
    const userBalances = {};
    memberIds.forEach(id => userBalances[id] = { owedToMe: 0, iOwe: 0 });

    newLedger.forEach(txn => {
      userBalances[txn.from.toString()].iOwe += txn.amount;
      userBalances[txn.to.toString()].owedToMe += txn.amount;
    });

    group.balances = Object.keys(userBalances).map(uId => ({
      user: new mongoose.Types.ObjectId(uId),
      ...userBalances[uId]
    }));

    await group.save();

    for (const uId of memberIds) {
      await User.findByIdAndUpdate(uId, {
        owedToMe: userBalances[uId].owedToMe,
        iOwe: userBalances[uId].iOwe
      });
    }

    return res.status(200).json({ 
      success: true, 
      group,
      you: await User.findById(userId)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const handleMemberUpdates = async (req, res) => {
  const { members, groupId } = req.body;
  try {
    const group = await Group.findById(groupId);
    group.members = members;
    await group.save();
    return res.json({ success: true, message: "Member Changes Successful" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const handleFilterGroup = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.json({ success: false, message: "User ID is required" });
    }
    const groups = await Group.find({ members: id });
    return res.json({ success: true, groups: groups });
  } catch (error) {
    return res.json({ success: false, message: "Server error filtering groups" });
  }
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const scanReceiptController = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, message: "No receipt file attached" });
    }
    const receiptBuffer = await fs.readFile(req.file.path);
    const base64Image = receiptBuffer.toString("base64");
    const receiptPart = {
      inlineData: { data: base64Image, mimeType: req.file.mimetype },
    };
    const prompt = "Analyze this receipt image. Extract a friendly high-level description for the shopping trip, the overall total amount, and an itemized breakdown array containing the names and prices of each discrete line item.";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt, receiptPart],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            totalAmount: { type: Type.NUMBER },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemName: { type: Type.STRING },
                  price: { type: Type.NUMBER }
                },
                required: ["itemName", "price"]
              }
            }
          },
          required: ["description", "totalAmount", "items"]
        }
      }
    });
    const extractedData = JSON.parse(response.text);
    return res.json({ success: true, data: extractedData });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server AI matrix failure" });
  } finally {
    if (req.file && existsSync(req.file.path)) {
      await fs.unlink(req.file.path);
    }
  }
};


const handleSendNotification = async (req, res) => {
  try {
    const { friendId, amount, groupName } = req.body;
    return res.status(200).json({ success: true, message: "Notification reminder sent over matrix channels" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.USER_PASS
  }
})

const handleSendEmail = async (req, res) => {
  const { action, targetEmail, amount, name } = req.body;
  try {
    const mailOptions = {
      from: `SplitWise App -> ${name}`,
      to: targetEmail,
      subject: action === 'remind' ? 'Payment Remainder' : 'Settlement Over',
      text: action === 'remind' ? `Hello, this is a message regarding your balance of Rs. ${amount}.` 
      : `Hello, I will do payment of ${amount}`
    }
    await transporter.sendMail(mailOptions)
    return res.json({success : true, message : "Email Sent"})
  } catch (error) {
    console.log(error)
    return res.json({success : false, message : error})
  }
}

const handleSettlement = async (req, res) => {
  const { senderEmail, targetEmail, amount } = req.body;
  const payAmount = parseFloat(amount);

  try {
    const sender = await User.findOne({ email : senderEmail });
    const receiver = await User.findOne({ email : targetEmail });

    const senderId = sender._id;
    const receiverId = receiver._id;

    await TransactionHistory.create({
      from: senderId,
      to: receiverId,
      fromName: sender.name,
      toName: receiver.name,
      amount: payAmount
    });

    const groups = await Group.find({
      "ledger": { $elemMatch: { from: senderId, to: receiverId } }
    });

    await Promise.all(groups.map(async (group) => {
      await Group.updateOne(
        { _id: group._id },
        {
          $inc: {
            "ledger.$[txn].amount": -payAmount,
            "balances.$[payer].iOwe": -payAmount,
            "balances.$[receiver].owedToMe": -payAmount
          }
        },
        {
          arrayFilters: [
            { "txn.from": senderId, "txn.to": receiverId },
            { "payer.user": senderId },
            { "receiver.user": receiverId }
          ]
        }
      );
    }));

    await User.updateOne({ _id: senderId }, { $inc: { balance: -payAmount, iOwe: -payAmount } });
    await User.updateOne({ _id: receiverId }, { $inc: { balance: payAmount, owedToMe: -payAmount } });

    const updatedUser = await User.findOne({email : senderEmail})

    return res.json({ success: true, message: "Payment recorded", sender : updatedUser });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
module.exports = {
  handleGroupCreate,
  handleGetGroups,
  handleGetGroup,
  handleAddExpense,
  handleMemberUpdates,
  handleFilterGroup,
  scanReceiptController,
  handleGetLedger,
  handleSettlement,
  handleSendNotification,
  handleSendEmail,
  handleGetRecentActivity,
  handleGetRecentTransactions
};