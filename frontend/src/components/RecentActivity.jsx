import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from './StoreContext';

export default function RecentActivity() {
  const { url, user } = useContext(StoreContext);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user?.id) return;
      try {
        const response = await axios.get(`${url}/api/group/recent-activity/${user.id}`);
        if (response.data && response.data.success) {
          setActivity(response.data.activity || []);
        }
      } catch (err) {
        console.error("Error fetching activity:", err);
      }
    };
    fetchActivity();
  }, [url, user]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-4">Recent Activity</h3>
      <div className="space-y-6">
        {activity.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start border-b border-slate-50 pb-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.description}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{item.groupName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">
                Rs. {parseFloat(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-xs font-bold ${item.status === 'LENT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {item.status === 'LENT' ? 'You lent' : 'You borrowed'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .flex { flex-direction: row; }
        }
      `}</style>
    </div>
  );
}