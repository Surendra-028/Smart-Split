import React, { useContext, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { StoreContext } from './StoreContext';
import RecentActivity from './RecentActivity';
import RecentTransactions from './RecentTransactions';
import axios from 'axios';

export default function DashboardView() {
  const { user, url, setUser } = useContext(StoreContext)

  const handleUserDetails = async (req, res) => {

    if (!user?.id) return;

    const response = await axios.get(`${url}/api/user/${user.id}`)
    if (response.data.success) {
      const userData = response.data.user;
      setUser({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        balance: userData.balance || 0,
        iOwe: userData.iOwe || 0,
        owedToMe: userData.owedToMe || 0
      });
    } else {
      console.log(response.data.message)
    }
  }

  useEffect(() => {
    handleUserDetails();
  }, [user?.id])


  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Total Balance" amount={user?.balance || 0} icon={<Wallet />} color="emerald" />
        <StatCard title="You Owe" amount={user?.iOwe || 0} icon={<ArrowDownLeft />} color="rose" />
        <StatCard title="You Are Owed" amount={user?.owedToMe || 0} icon={<ArrowUpRight />} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <RecentActivity />
        <RecentTransactions />
      </div>
    </div>
  );
}

const StatCard = ({ title, amount, icon, color }) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600"
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">Rs. {(amount || 0).toFixed(2)}</p>
      </div>
    </div>
  );
}