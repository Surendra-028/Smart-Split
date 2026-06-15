import React, { useContext, useState } from 'react';
import DashboardView from './components/DashboardView';
import GroupsDirectory from './components/GroupsDirectory';
import GroupWorkspace from './components/GroupWorkspace';
import TransactionsLedger from './components/TransactionsLedger';
import ProfileSettings from './components/ProfileSettings';
import { Layers, User, LogOut, Settings } from 'lucide-react';
import LandingPage from './components/LandingPage';
import { StoreContext } from './components/StoreContext';
import { ToastContainer } from 'react-toastify';

export default function App() {
  const { activePage, setActivePage, user, setUser, setToken } = useContext(StoreContext);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigateToGroup = (id) => {
    setSelectedGroupId(id);
    setActivePage('group-detail');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser({ name: '', email: '' });
    setActivePage('landingpage');
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {activePage !== 'landingpage' && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
            <div 
              className="flex items-center space-x-2 cursor-pointer" 
              onClick={() => { setActivePage('dashboard'); setIsDropdownOpen(false); }}
            >
              <div className="bg-emerald-500 text-white p-2 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">SmartSplit</span>
            </div>

            <nav className="flex items-center space-x-1 sm:space-x-4">
              <button 
                onClick={() => { setActivePage('groups'); setIsDropdownOpen(false); }}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                  activePage === 'groups' || activePage === 'group-detail'
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Groups
              </button>
              <button 
                onClick={() => { setActivePage('transactions'); setIsDropdownOpen(false); }}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                  activePage === 'transactions' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Transactions
              </button>
              
              <div className="relative ml-2">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition focus:outline-none ${
                    activePage === 'settings' 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' 
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  <User className="w-4 h-4" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right flex flex-col overflow-hidden">
                      <div className="px-5 pt-4 pb-3">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {user?.name || 'user'}
                        </p>
                        <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                          {user?.email || 'user@gmail.com'}
                        </p>
                      </div>

                      <div className="border-t border-slate-100">
                        <button
                          onClick={() => { setActivePage('settings'); setIsDropdownOpen(false); }}
                          className="w-full px-5 py-3 text-left text-[14px] font-medium text-slate-600 hover:bg-slate-50 transition flex items-center space-x-3"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Manage Account</span>
                        </button>
                      </div>
                      
                      <div className="border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full px-5 py-3 text-left text-[14px] font-medium text-rose-500 hover:bg-slate-50 transition flex items-center space-x-3"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </div>
        </header>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ToastContainer autoClose={1000}/>
        {activePage === 'landingpage' && <LandingPage />}
        {activePage === 'dashboard' && <DashboardView onNavigateToGroup={navigateToGroup} />}
        {activePage === 'groups' && <GroupsDirectory onGroupClick={navigateToGroup} />}
        {activePage === 'group-detail' && <GroupWorkspace groupId={selectedGroupId} onBack={() => setActivePage('groups')} />}
        {activePage === 'transactions' && <TransactionsLedger /> }
        {activePage === 'settings' && <ProfileSettings onBack={() => setActivePage('dashboard')} />}
      </main>
    </div>
  );
}