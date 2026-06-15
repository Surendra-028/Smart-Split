import React, { useContext, useState } from 'react';
import { Sparkles, ArrowRight, Shield, Zap, Check, Users, FileText, Smartphone, Split, Layers, Eye, Mail, Lock, User, X } from 'lucide-react';
import axios from 'axios';
import { StoreContext } from './StoreContext';
import { jwtDecode } from 'jwt-decode'

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { url, activePage, setActivePage, token, setToken, setUser } = useContext(StoreContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const closeModals = () => {
    setIsLogin(false);
    setIsRegister(false);
    setFormData({ name: '', email: '', password: '' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? `${url}/api/user/login` : `${url}/api/user/register`;
      const payload = isLogin ? { email: formData.email, password: formData.password } : formData;

      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        const receivedToken = response.data.token;

        localStorage.setItem('token', receivedToken);

        const decoded = jwtDecode(receivedToken);

        setUser({
          id : decoded.id,
          name: decoded.name || "User",
          email: decoded.email || ""
        });

        setToken(receivedToken);
        setActivePage('dashboard');
        closeModals();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "An authentication error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-base font-black tracking-tight text-slate-900">SmartSplit</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-500">
          <a href="#features" className="hover:text-slate-900 transition">Core Features</a>
          <a href="#workflow" className="hover:text-slate-900 transition">How It Works</a>
          <a href="#security" className="hover:text-slate-900 transition">Engine Security</a>
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => { setIsRegister(false); setIsLogin(true); }}
            className="px-3 sm:px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition rounded-xl hover:bg-slate-100"
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setIsRegister(true); }}
            className="px-3 sm:px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition rounded-xl shadow-xs"
          >
            Sign Up
          </button>
        </div>
      </header>

      <main className="flex-1 pt-28 sm:pt-36 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-24 sm:space-y-32 pb-24">
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            <span>Integrated with Gemini Pro AI Core</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] sm:leading-none">
            The intelligent expense engine that handles the details.
          </h1>

          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Stop arguing over shared bills or typing price rows manually. Upload any store receipt, verify the AI breakdown, select who bought what, and let our minimization algorithms settle the rest.
          </p>

          <div className="pt-2">
            <button
              onClick={() => { setIsLogin(false); setIsRegister(true); }}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition shadow-lg shadow-emerald-500/10 inline-flex items-center justify-center space-x-2"
            >
              <span>Create Your Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section id="workflow" className="relative max-w-5xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Interactive Split Framework</h2>
            <p className="text-xs text-slate-400 font-medium">A live preview of the Page 4 & Page 5 user interface workflow</p>
          </div>

          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 blur-3xl -z-10 rounded-3xl" />

          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="bg-white/10 border border-white/5 px-4 sm:px-12 py-0.5 rounded-lg text-[10px] sm:text-xs font-mono text-slate-400 truncate">
                https://app.equisplit.com/verify-and-split
              </div>
              <div className="w-12 hidden sm:block" />
            </div>

            <div className="bg-slate-50 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="md:col-span-2 space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800">📦 Item 1: Gym T-Shirt</span>
                    <span className="text-xs font-bold text-emerald-600">$30.00</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold flex items-center space-x-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" /> <span>Me</span>
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-md text-[10px] font-medium">Sneha K.</span>
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-md text-[10px] font-medium">Amit S.</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800">📦 Item 2: Premium Textbook</span>
                    <span className="text-xs font-bold text-emerald-600">$20.00</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-md text-[10px] font-medium">Me</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold flex items-center space-x-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" /> <span>Sneha K.</span>
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-md text-[10px] font-medium">Amit S.</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center space-x-1 text-slate-400 mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Minimized Standings Matrix</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">Circular debts have been aggregated automatically down to:</p>
                </div>
                <div className="space-y-1.5">
                  <div className="bg-white/5 border border-white/5 p-2 rounded-lg flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Sneha Kapoor Owes</span>
                    <span className="font-bold text-emerald-400">+$20.00</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2 rounded-lg flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Amit Sharma Owes</span>
                    <span className="font-bold text-emerald-400">+$70.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Engine Capabilities</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Five integrated layers built to eliminate financial friction completely.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-10 h-10 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">1. Gemini AI Receipt Parsing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload image file structures directly. Our integrated neural pipeline reads raw printed receipt textures and creates perfect text item arrays instantly.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-10 h-10 flex items-center justify-center">
                <Split className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">2. Itemized Checklist Splitting</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Assign singular lines to specific members with easy checkbox menus. Perfect for isolating unique choices, shared meals, and custom item values.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-10 h-10 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">3. Adaptive Routing Context</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan globally from the home dashboard to prompt group creation menus, or scan inside a group to bypass selections and lock parameters instantly.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-10 h-10 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">4. Manual Bill Entry Backup</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No receipt sheet nearby? Switch configurations smoothly to input flat-rate house rent balances, utility statements, or simple cash loans directly.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-10 h-10 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">5. Algorithmic Debt Reduction</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The transaction ledger automatically resolves secondary debt networks, simplifying multi-user payments down to minimal direct endpoints.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-center items-center text-center border-dashed bg-slate-50/40">
              <Eye className="w-8 h-8 text-slate-300 mb-2" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Verification Complete</h3>
              <p className="text-[11px] text-slate-400 max-w-[180px] mt-0.5">All five production modules are mapped and secure.</p>
            </div>
          </div>
        </section>

        <section id="security" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg font-bold text-slate-900">Database Layer Integrity</h3>
            <p className="text-xs text-slate-500 max-w-xl">
              All transactions are processed securely via native MongoDB document streams backed by Express session tokens. Your personal expense ledger routes remain fully isolated.
            </p>
          </div>
          <div className="flex bg-slate-50 border border-slate-100 p-3 rounded-xl items-center space-x-2 shrink-0">
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Mobile-Responsive Viewports Enabled</span>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white py-6 text-center text-xs text-slate-400 font-semibold tracking-wide">
        &copy; 2026 SmartSplit System Core. All rights reserved.
      </footer>

      {(isLogin || isRegister) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={closeModals}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-slate-900">
                  {isRegister ? 'Create Your Engine Profile' : 'Welcome Back to SmartSplit'}
                </h3>
                <p className="text-xs text-slate-400 max-w-[280px]">
                  {isRegister ? 'Initialize your account parameters to begin AI receipt parsing' : 'Access your unified group expense matrices and balance logs'}
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {isRegister && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="name"
                        required={isRegister}
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Rahul Sharma"
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="rahul@domain.com"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-md flex items-center justify-center space-x-2 group"
                >
                  <span>{isRegister ? 'Register Account' : 'Secure Authentication'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </button>
              </form>

              <div className="border-t border-slate-100 pt-4 text-center">
                <p className="text-xs font-medium text-slate-500">
                  {isRegister ? 'Already running our engine?' : "Don't have a ledger profile yet?"}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setIsRegister(!isRegister); }}
                    className="text-emerald-600 font-bold hover:underline transition ml-1"
                  >
                    {isRegister ? 'Login Securely' : 'Sign Up Instantly'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
