import React, { useState, useContext, useEffect } from 'react';
import { Plus, Search, Home, Plane, Folder } from 'lucide-react';
import CreateGroupModal from './CreateGroupModal';
import { StoreContext } from './StoreContext';
import axios from 'axios';

export default function GroupsDirectory({ onGroupClick }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const { url, user } = useContext(StoreContext);

  const handleGetGroups = async () => {
    try {
      const response = await axios.post(`${url}/api/group/filter-groups`, { 
        id: user._id || user.id 
      });
      if (response.data.success) {
        setGroups(response.data.groups || []);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      handleGetGroups();
    }
  }, [user]);

  const renderUserStatus = (group) => {
    const currentUserId = user._id || user.id;
    if (!group.balances || !currentUserId) return <span className="text-slate-500">Rs. 0.00</span>;

    const userBalance = group.balances.find(
      b => (b.user?._id || b.user || '').toString() === currentUserId.toString()
    );

    if (!userBalance) return <span className="text-slate-500">Settled Up</span>;

    if (userBalance.owedToMe > 0) {
      return <span className="text-emerald-600 font-bold text-sm">Owed: Rs. {userBalance.owedToMe.toFixed(2)}</span>;
    }
    if (userBalance.iOwe > 0) {
      return <span className="text-rose-500 font-bold text-sm">You owe: Rs. {userBalance.iOwe.toFixed(2)}</span>;
    }

    return <span className="text-slate-500 text-sm font-bold">Settled Up</span>;
  };

  const filteredGroups = groups.filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Groups</h2>
          <p className="text-sm text-slate-500">Manage and track your shared expenses</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-emerald-500/10 flex items-center justify-center space-x-2 self-start sm:self-auto transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Group</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search groups..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 transition shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredGroups.map((group) => (
          <div 
            key={group._id}
            onClick={() => onGroupClick(group._id)}
            className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm cursor-pointer hover:shadow transition flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-lg">{group.name}</h4>
                <p className="text-xs text-slate-400 truncate max-w-[200px]">
                  {group.members?.length || 0} members
                </p>
              </div>
              <div className={`p-2 rounded-xl ${
                group.description === 'Home' ? 'bg-orange-50 text-orange-600' : group.description === 'Trip' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {group.description === 'Home' ? <Home className="w-5 h-5" /> : group.description === 'Trip' ? <Plane className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <span className="text-xs font-medium text-slate-400">Your Status</span>
              {renderUserStatus(group)}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <CreateGroupModal 
          onClose={() => setIsModalOpen(false)} 
          onGroupCreated={handleGetGroups}
        />
      )}
    </div>
  );
}