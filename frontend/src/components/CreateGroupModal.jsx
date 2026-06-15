import React, { useState, useContext, useEffect } from 'react';
import { Search, FolderPlus, ArrowRight } from 'lucide-react';
import { StoreContext } from './StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function CreateGroupModal({ onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [category, setCategory] = useState('Trip');
  const [searchQuery, setSearchQuery] = useState('');
  const { url, user } = useContext(StoreContext);
  const [selectedFriends, setSelectedFriends] = useState([
    { _id: user._id || user.id, name: user.name, email: user.email }
  ]);
  const [searchResults, setSearchResults] = useState([]);

  const handleGetAll = async () => {
    try {
      const response = await axios.get(`${url}/api/user/all`);
      if (response.data.success) {
        const allUsers = response.data.users;
        const users = [];
        for (let u of allUsers) {
          users.push({ name: u.name, email: u.email, _id: u._id });
        }
        setSearchResults(users);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateGroup = async () => {
    const members = selectedFriends.map(friend => friend._id);
    const formData = {
      name: groupName,
      description: category,
      members: members,
      expenses: []
    };
    try {
      const response = await axios.post(`${url}/api/group/create`, formData);
      if (response.data.success) {
        toast.success("Group Created");
        if (onGroupCreated) onGroupCreated();
        onClose();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };      

  useEffect(() => {
    handleGetAll();
  }, []);

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

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
        
        <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100 space-y-5">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-500 text-white p-2 rounded-xl">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create Group</h3>
              <p className="text-xs text-slate-400">Assemble a new billing boundary</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Group Name</label>
            <input 
              type="text" 
              placeholder="e.g., Road Trip 2026" 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {['Trip', 'Home', 'Other'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    category === cat ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Roster</label>
            <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
              <span className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200">
                {user.name}
              </span>
              {selectedFriends.length > 0 && selectedFriends.map((f) => (
                <div key = {f._id}>
                {f.name !== user.name ? <span className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200">
                  {f.name}
                </span> : <></>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 flex flex-col justify-between space-y-5">
          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invite Friends</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Type friend's email address..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {mockSearchResults.map((f) => {
                const isSelected = selectedFriends.some(selected => selected._id === f._id);
                return (
                  <div key={f._id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{f.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{f.email}</p>
                    </div>
                    {!isSelected ? (
                      <button
                        type="button"
                        onClick={() => addFriend(f)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition flex items-center space-x-1 shrink-0"
                      >
                        <span>Add</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-2xl shadow-xs shrink-0 select-none">
                        Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">
              Cancel
            </button>
            <button 
              type="button"
              disabled={!groupName || selectedFriends.length < 2}
              onClick={handleCreateGroup}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-500/10 transition"
            >
              Create Group 🔥
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}