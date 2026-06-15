import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from './StoreContext';
import { Mail, CheckCircle, Bell, X, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function TransactionsLedger() {
  const [activeTab, setActiveTab] = useState('owed-to-me');
  const [data, setData] = useState({ owedToMe: [], iOwe: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [settleItem, setSettleItem] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loadingActionId, setLoadingActionId] = useState(null);
  const { url, user, setUser } = useContext(StoreContext);

  const fetchLedger = async () => {
    if (!user?.id) return;
    try {
      const response = await axios.get(`${url}/api/group/ledger/${user.id}`);
      setData(response.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchLedger();
    }
  }, []);

  const handleAction = async (type, item) => {
    setLoadingActionId(item.email + type);
    try {
      const response = await axios.post(`${url}/api/group/ledger/action`, {
        action: type,
        targetEmail: item.email,
        amount: item.amount,
        name: user.name
      });
      toast.success(response.data.message);
      setSettleItem(null);
      setPaymentAmount('');
      await fetchLedger();
    } catch (err) {
      alert("Action failed. Please try again.");
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleSettlement = async () => {
    try {
      const formData = {
        targetEmail: settleItem.email,
        amount: paymentAmount,
        senderEmail: user.email
      };
      const response = await axios.post(`${url}/api/group/settle`, formData);
      if (response.data.success) {
        const sender = response.data.sender;
        setUser({
          id: sender._id,
          name: sender.name,
          email: sender.email,
          balance: sender.balance,
          iOwe: sender.iOwe,
          owedToMe: sender.owedToMe
        });
        setSettleItem(null);
        toast.success(response.data.message);
        fetchLedger();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openSettle = (item) => {
    setSettleItem(item);
    setPaymentAmount(item.amount.toString());
  };

  const currentList = activeTab === 'owed-to-me' ? data.owedToMe : data.iOwe;

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto px-2 sm:px-4">
      {settleItem && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Settle Balance</h3>
              <button onClick={() => setSettleItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Paying: <span className="font-semibold text-slate-900">{settleItem.name}</span></p>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Amount (Rs.)</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-3 w-4 h-4 text-emerald-600" />
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setSettleItem(null)} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={async () => {
                await handleSettlement();
              }} className="flex-1 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-slate-800 transition-colors">Proceed</button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total to Collect</p>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">Rs. {data.owedToMe.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total to Pay</p>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">Rs. {data.iOwe.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(2)}</p>
        </div>
      </div>
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button onClick={() => setActiveTab('owed-to-me')} className={`pb-3 text-sm font-semibold border-b-2 px-4 ${activeTab === 'owed-to-me' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}>Collections ({data.owedToMe.length})</button>
        <button onClick={() => setActiveTab('i-owe')} className={`pb-3 text-sm font-semibold border-b-2 px-4 ${activeTab === 'i-owe' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'}`}>Borrowings ({data.iOwe.length})</button>
      </div>
      {isLoading ? <div className="p-8 text-center text-sm">Loading...</div> : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {currentList.length === 0 ? <div className="p-8 text-center text-sm text-slate-400">No personal balances found.</div> :
            currentList.map((item, idx) => (
              <div key={idx} className="p-4 sm:p-5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {activeTab === 'owed-to-me' ? (
                      <button
                        onClick={() => handleAction('remind', item)}
                        disabled={loadingActionId === item.email + 'remind'}
                        className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50"
                        title="Reply"
                      >
                        {loadingActionId === item.email + 'remind' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      </button>
                    ) : (
                      <>
                        <button onClick={() => openSettle(item)} className="p-2 text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors" title="Settle"><CheckCircle className="w-4 h-4" /></button>
                        <button
                          onClick={() => handleAction('reply', item)}
                          disabled={loadingActionId === item.email + 'reply'}
                          className="p-2 text-black bg-slate-100 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50"
                          title="Remind"
                        >
                          {loadingActionId === item.email + 'reply' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                        </button>
                      </>
                    )}
                  </div>
                  <span className={`font-bold w-32 text-right whitespace-nowrap ${activeTab === 'owed-to-me' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {activeTab === 'owed-to-me' ? '+' : '-'} Rs. {parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}