import React, { useState, useEffect, useContext, useRef } from 'react';
import { X, Plus, Trash2, Sparkles, FileText, Loader2 } from 'lucide-react';
import { StoreContext } from './StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AIReceiptFlow({ onClose, fixedGroupId, onSuccess }) {
  const { url, user, handleGetDetails, token, setUser } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState('ai');
  const [groupMembers, setGroupMembers] = useState([]);
  const fileInputRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        const response = await axios.get(`${url}/api/group/${fixedGroupId}`);
        if (response.data.success) {
          const membersList = response.data.group.members || [];
          setGroupMembers(membersList);

          const currentUserId = user._id || user.id;
          if (currentUserId) {
            setPaidBy(currentUserId);
          } else if (membersList.length > 0) {
            setPaidBy(membersList[0]._id || membersList[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };
    if (fixedGroupId) fetchGroupMembers();
  }, [fixedGroupId, url, user]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsScanning(true);
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await axios.post(`${url}/api/group/scan-receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const { description: aiDesc, totalAmount: aiTotal, items: aiItems } = response.data.data;

        setDescription(aiDesc || 'Scanned Receipt');
        setTotalAmount(aiTotal ? aiTotal.toString() : '0.00');

        const allMemberIds = groupMembers.map(m => m._id || m.id).filter(Boolean);

        const initializedItems = (aiItems || []).map(item => ({
          itemName: item.itemName,
          price: item.price.toString(),
          assignedTo: allMemberIds
        }));

        setItems(initializedItems);
        setActiveTab('manual');
        toast.success('Receipt scanned successfully');
      } else {
        toast.error(response.data.message || 'Failed to parse receipt');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error scanning receipt');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddItem = () => {
    const allMemberIds = groupMembers.map(m => m._id || m.id).filter(Boolean);
    setItems([
      ...items,
      { itemName: '', price: '', assignedTo: allMemberIds }
    ]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);

    if (field === 'price') {
      calculateTotal(updatedItems);
    }
  };

  const calculateTotal = (currentItems) => {
    const sum = currentItems.reduce((acc, item) => {
      return acc + (parseFloat(item.price) || 0);
    }, 0);
    if (sum > 0) {
      setTotalAmount(sum.toString());
    }
  };

  const toggleMemberAssignment = (itemIndex, member) => {
    const memberId = member._id || member.id;
    if (!memberId) return;

    const updatedItems = [...items];
    const currentAssignments = [...updatedItems[itemIndex].assignedTo];

    if (currentAssignments.includes(memberId)) {
      updatedItems[itemIndex].assignedTo = currentAssignments.filter(id => id !== memberId);
    } else {
      updatedItems[itemIndex].assignedTo = [...currentAssignments, memberId];
    }
    setItems(updatedItems);
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        description,
        totalAmount: parseFloat(totalAmount) || 0,
        paidBy: paidBy,
        items: items.map(item => ({
          itemName: item.itemName,
          price: parseFloat(item.price) || 0,
          assignedTo: item.assignedTo
        })),
        userId : user.id
      };

      const response = await axios.post(`${url}/api/group/expense/${fixedGroupId}`, payload);
      if (response.data.success) {
        toast.success("Expense added successfully");
        setUser(response.data.you)
        if (handleGetDetails && token) {
          await handleGetDetails(token);
        }
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error adding expense");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Add Expense</h3>
            <p className="text-xs text-slate-400">Add an expense to your group</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-200/60 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-3 text-xs font-bold flex items-center justify-center space-x-2 border-b-2 transition ${activeTab === 'ai' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scan Receipt</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`py-3 text-xs font-bold flex items-center justify-center space-x-2 border-b-2 transition ${activeTab === 'manual' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manual Expense</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {activeTab === 'ai' ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
              {isScanning ? (
                <>
                  <Loader2 className="w-8 h-8 text-emerald-500 mx-auto animate-spin" />
                  <p className="text-xs font-semibold text-slate-600">Scanning receipt...</p>
                </>
              ) : (
                <>
                  <Sparkles className="w-8 h-8 text-emerald-500 mx-auto animate-pulse" />
                  <p className="text-xs font-semibold text-slate-600">Scan receipt with AI</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition shadow-sm"
                  >
                    Upload Receipt
                  </button>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitExpense} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dinner"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Paid By</label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    {groupMembers.map(m => (
                      <option key={m._id || m.id} value={m._id || m.id}>
                        {m.name} {m._id === (user._id || user.id) && '(You)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Amount</label>
                  <input
                    type="text"
                    disabled
                    placeholder="0.00"
                    value={totalAmount}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, itemIndex) => (
                    <div key={itemIndex} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/30 space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          required
                          placeholder="Item name"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(itemIndex, 'itemName', e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition"
                        />
                        <input
                          type="number"
                          required
                          step="0.01"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => handleItemChange(itemIndex, 'price', e.target.value)}
                          className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500 transition"
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(itemIndex)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Split with:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {groupMembers.map(m => {
                            const mId = m._id || m.id;
                            const isAssigned = item.assignedTo.includes(mId);
                            return (
                              <button
                                type="button"
                                key={mId}
                                onClick={() => toggleMemberAssignment(itemIndex, m)}
                                className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition ${isAssigned ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                              >
                                {m.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('ai')}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={items.length === 0}
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition"
                >
                  Save Expense
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}