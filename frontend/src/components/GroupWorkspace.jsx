import React, { useState, useContext, useEffect } from 'react';
import { ArrowLeft, UserPlus, Sparkles, FileText, Zap, X, User, Check, CheckCircle2 } from 'lucide-react';
import { StoreContext } from './StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import AIReceiptFlow from './AIReceiptFlow';

export default function GroupWorkspace({ groupId, onBack }) {
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const { url, user, token, handleGetDetails } = useContext(StoreContext);
  const [isAddMember, setIsAddMember] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [workspaceTab, setWorkspaceTab] = useState('expenses');

  const currentUserId = user?._id || user?.id;

  const fetchGroupWorkspaceDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/group/${groupId}`);
      if (response.data.success) {
        setGroupData(response.data.group);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAll = async () => {
    try {
      const response = await axios.get(`${url}/api/user/all`);
      if (response.data.success) {
        const allUsers = response.data.users;
        const users = allUsers.map(u => ({ name: u.name, email: u.email, _id: u._id }));
        setSearchResults(users);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (groupId) {
      handleGetAll();
      fetchGroupWorkspaceDetails();
    }
  }, [groupId]);

  useEffect(() => {
    if (isAddMember && groupData?.members) {
      setSelectedFriends(groupData.members.map(m => ({ _id: m._id, name: m.name, email: m.email })));
    }
  }, [isAddMember, groupData]);

  const mockSearchResults = searchResults.filter(f =>
    f.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
    searchQuery !== ''
  );

  const addFriend = (friend) => {
    if (!selectedFriends.some(f => f._id === friend._id)) {
      setSelectedFriends([...selectedFriends, friend]);
    }
    setSearchQuery('');
  };

  const removeFriend = (friendId) => {
    setSelectedFriends(selectedFriends.filter(f => f._id !== friendId));
  };

  const handleSaveMembers = async () => {
    try {
      const memberIds = selectedFriends.map(f => f._id);
      const response = await axios.post(`${url}/api/group/update-members`, {
        groupId,
        members: memberIds
      });

      if (response.data.success) {
        toast.success("Group members updated successfully");
        setIsAddMember(false);
        fetchGroupWorkspaceDetails();
      } else {
        toast.error(response.data.message || "Failed to update members");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating group members");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Group not found.</p>
        <button onClick={onBack} className="text-emerald-500 text-sm font-medium mt-2 underline">
          Go Back
        </button>
      </div>
    );
  }

  const calculateUserShare = (expense, paidByMe) => {
    if (expense.txType === 'payment' || expense.description.includes('paid')) {
      return expense.totalAmount || 0;
    }

    if (!expense.items || expense.items.length === 0) {
      const totalMembers = groupData.members?.length || 1;
      const equalShare = (expense.totalAmount || 0) / totalMembers;
      return paidByMe ? (expense.totalAmount || 0) - equalShare : equalShare;
    }

    let userCost = 0;
    expense.items.forEach(item => {
      const assignedCount = item.assignedTo?.length || 0;
      if (assignedCount === 0) {
        userCost += item.price / (groupData.members?.length || 1);
      } else {
        const isAssignedToMe = item.assignedTo.some(member => {
          const mId = typeof member === 'object' && member !== null ? member._id : member;
          return mId === currentUserId;
        });
        if (isAssignedToMe) {
          userCost += item.price / assignedCount;
        }
      }
    });

    return paidByMe ? (expense.totalAmount || 0) - userCost : userCost;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </button>
      </div>

      <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {groupData.description === 'Home' ? '🏠' : groupData.description === 'Trip' ? '✈️' : '📂'} {groupData.name}
          </h2>
        </div>
        <button 
          onClick={() => setIsAddMember(true)} 
          className="flex items-center space-x-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 transition shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Members</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Group Balances</h3>
            <div className="space-y-3">
              {groupData.members?.map((member) => {
                const isOriginalUser = member._id === currentUserId;
                const specificUserBalObj = groupData.balances?.find(b => (b.user?._id || b.user) === member._id) || { owedToMe: 0, iOwe: 0 };
                const computedNetDisplayValue = specificUserBalObj.owedToMe - specificUserBalObj.iOwe;

                return (
                  <div key={member._id} className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${isOriginalUser ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                      {member.name} {isOriginalUser && '(You)'}
                    </span>
                    <span className={`font-bold ${computedNetDisplayValue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {computedNetDisplayValue >= 0 ? `+Rs. ${computedNetDisplayValue.toFixed(2)}` : `-Rs. ${Math.abs(computedNetDisplayValue).toFixed(2)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-200" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-100">Smart Split</h4>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              Balances are automatically calculated based on individual item assignments inside group transactions.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Expenses</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFlowModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Scan Receipt</span>
                </button>
                <button
                  onClick={() => setShowFlowModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {groupData.expenses && groupData.expenses.length > 0 ? (
                groupData.expenses.map((expense) => {
                  const expensePaidById = typeof expense.paidBy === 'object' && expense.paidBy !== null
                    ? expense.paidBy?._id
                    : expense.paidBy;

                  const paidByMe = expensePaidById === currentUserId;

                  const payerName = typeof expense.paidBy === 'object' && expense.paidBy !== null
                    ? expense.paidBy?.name 
                    : (groupData.members.find(m => m._id === expense.paidBy)?.name || 'Unknown');

                  const isSettlementPaymentType = expense.txType === 'payment' || expense.description.includes('paid');
                  const displayContextAmount = calculateUserShare(expense, paidByMe);

                  return (
                    <div
                      key={expense._id}
                      onClick={() => { if (!isSettlementPaymentType) setSelectedExpense(expense); }}
                      className={`py-4 flex items-center justify-between first:pt-0 last:pb-0 px-2 rounded-xl transition ${isSettlementPaymentType ? 'cursor-default bg-slate-50/40' : 'cursor-pointer hover:bg-slate-50/80'}`}
                    >
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSettlementPaymentType ? 'text-slate-500 italic' : 'text-slate-900'}`}>
                          {expense.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          {isSettlementPaymentType ? 'Direct Settlement Record' : `Paid by ${paidByMe ? 'You' : payerName}`} • {expense.date ? new Date(expense.date).toLocaleDateString() : 'Today'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900">Rs. {displayContextAmount.toFixed(2)}</p>
                        {!isSettlementPaymentType && (
                          <p className={`text-xs font-medium ${paidByMe ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {paidByMe ? 'You lent' : 'You borrowed'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-sm text-slate-400">No transactions added yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAddMember && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Manage Group Members</h3>
                <p className="text-xs text-slate-400">Add or remove members from {groupData.name}</p>
              </div>
              <button type="button" onClick={() => setIsAddMember(false)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-200/60 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Friends</label>
                <input 
                  type="text" 
                  placeholder="Search by email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              {mockSearchResults.length > 0 && (
                <div className="border border-slate-100 rounded-xl max-h-[150px] overflow-y-auto divide-y divide-slate-100 bg-white shadow-xs">
                  {mockSearchResults.map((f) => {
                    const isAlreadySelected = selectedFriends.some(selected => selected._id === f._id);
                    return (
                      <div key={f._id} className="p-2.5 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{f.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{f.email}</p>
                        </div>
                        {!isAlreadySelected ? (
                          <button
                            type="button"
                            onClick={() => addFriend(f)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-[10px] font-bold text-white px-2.5 py-1.5 rounded-lg transition flex items-center space-x-1"
                          >
                            <span>Add</span>
                          </button>
                        ) : (
                          <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-400 font-semibold px-2 py-1 rounded-md flex items-center space-x-1">
                            <Check className="w-2.5 h-2.5" />
                            <span>Added</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Group Members ({selectedFriends.length})</label>
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-0.5">
                  {selectedFriends.map((f) => (
                    <div key={f._id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{f.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{f.email}</p>
                        </div>
                      </div>
                      {f._id !== currentUserId && (
                        <button
                          type="button"
                          onClick={() => removeFriend(f._id)}
                          className="text-slate-400 hover:text-rose-500 p-1 hover:bg-rose-50 rounded-lg transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center space-x-2">
              <button 
                type="button" 
                onClick={() => setIsAddMember(false)} 
                className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200/60 rounded-xl transition"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveMembers}
                className="flex-1 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-md transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showFlowModal && (
        <AIReceiptFlow
          onClose={() => setShowFlowModal(false)}
          fixedGroupId={groupId}
          onSuccess={fetchGroupWorkspaceDetails}
        />
      )}

      {selectedExpense && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-slate-900">{selectedExpense.description}</h3>
                <p className="text-xs text-slate-400">Expense Breakdown</p>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-200/60 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
                <h4 className="text-3xl font-black text-slate-900 mt-1">Rs. {selectedExpense.totalAmount?.toFixed(2)}</h4>
                <p className="text-xs text-slate-500 mt-1.5">
                  Paid by <span className="font-semibold text-slate-700">
                    {typeof selectedExpense.paidBy === 'object' && selectedExpense.paidBy !== null
                      ? selectedExpense.paidBy?.name 
                      : (groupData.members.find(m => m._id === selectedExpense.paidBy)?.name || 'Unknown')}
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Items</label>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-white overflow-hidden shadow-xs">
                  {selectedExpense.items?.map((item, index) => (
                    <div key={item._id || index} className="p-4 flex flex-col space-y-1.5 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-800 truncate">{item.itemName}</p>
                        <p className="font-bold text-slate-900">Rs. {item.price?.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] font-medium text-slate-400 self-center mr-1">Split with:</span>
                        {item.assignedTo && item.assignedTo.length > 0 ? (
                          item.assignedTo.map((member) => {
                            const matchedMember = typeof member === 'object' && member !== null
                              ? member
                              : groupData.members.find(m => m._id === member);
                            return (
                              <span key={matchedMember?._id || member} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                                {matchedMember?.name || 'Unknown'}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 italic">Everyone</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setSelectedExpense(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}