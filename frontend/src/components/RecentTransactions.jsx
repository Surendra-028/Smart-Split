import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from './StoreContext';

export default function RecentTransactions() {
  const { url, user } = useContext(StoreContext);
  const [txns, setTxns] = useState([]);

  useEffect(() => {
    const fetchTxns = async () => {
      if (!user?.id) return;
      const res = await axios.get(`${url}/api/group/recent-transactions/${user.id}`);
      if (res.data.success) setTxns(res.data.transactions);
    };
    fetchTxns();
  }, [url, user]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-4">Recent Transactions</h3>
      <div className="space-y-4">
        {txns.map((txn, idx) => {
          const isSender = txn.from === user.id;
          return (
            <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{isSender ? `To: ${txn.toName}` : `From: ${txn.fromName}`}</p>
                <p className="text-[10px] text-slate-400">{new Date(txn.date).toLocaleDateString()}</p>
              </div>
              <span className={`text-sm font-bold ${isSender ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isSender ? '-' : '+'} Rs. {parseFloat(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .flex { flex-direction: row; }
        }
      `}</style>
    </div>
  );
}