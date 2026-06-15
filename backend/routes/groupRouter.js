const express = require("express");
const groupRouter = express.Router();
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const { 
  handleGroupCreate, 
  handleGetGroups, 
  handleGetGroup, 
  handleAddExpense, 
  handleMemberUpdates,
  handleFilterGroup,
  scanReceiptController,
  handleGetLedger,
  handleSendEmail,
  handleSettlement,
  handleGetRecentActivity,
  handleGetRecentTransactions
} = require("../controllers/groupController");

groupRouter.post("/create", handleGroupCreate);
groupRouter.get("/all", handleGetGroups);
groupRouter.get("/:id", handleGetGroup);
groupRouter.post("/expense/:fixedGroupId", handleAddExpense);
groupRouter.post("/update-members", handleMemberUpdates);
groupRouter.post("/filter-groups", handleFilterGroup);
groupRouter.post("/scan-receipt", upload.single('receipt'), scanReceiptController);
groupRouter.get('/ledger/:id', handleGetLedger);
groupRouter.post('/ledger/action', handleSendEmail)
groupRouter.post('/settle', handleSettlement)
groupRouter.get("/recent-activity/:userId", handleGetRecentActivity);
groupRouter.get("/recent-transactions/:userId", handleGetRecentTransactions);

module.exports = { groupRouter };