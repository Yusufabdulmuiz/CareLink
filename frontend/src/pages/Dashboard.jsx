import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Users, Clock, CheckCircle2, Search, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickSearch, setQuickSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${apiUrl}/api/patients`);
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true; 

    const loadData = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${apiUrl}/api/patients`);
        
        if (isMounted) { 
          setPatients(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        if (isMounted) console.error('Error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false; 
    };
  }, []);

  const totalBills = patients.length;
  const paidPatients = patients.filter(p => p.status && p.status.toLowerCase() === 'paid');
  const pendingPatients = patients.filter(p => p.status && p.status.toLowerCase() === 'pending');
  
  const totalRevenue = paidPatients.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingRevenue = pendingPatients.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const handleQuickLookup = (e) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    setHasSearched(true);
    const found = patients.find(p => 
      (p.id && p.id.toLowerCase().includes(quickSearch.toLowerCase())) ||
      (p.phone && p.phone.includes(quickSearch)) ||
      (p.name && p.name.toLowerCase().includes(quickSearch.toLowerCase()))
    );
    setSearchResult(found || null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="text-teal-600 shrink-0" size={24} />
            Clinic Overview
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Real-time payment analytics.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin text-teal-600' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Stat Cards remain same but responsive grid makes them work perfectly */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><Users size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Bills</p>
            <h3 className="text-xl font-black text-slate-800">{loading ? '...' : totalBills}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
            <h3 className="text-xl font-black text-slate-800">{loading ? '...' : `₦${pendingRevenue.toLocaleString()}`}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Revenue</p>
            <h3 className="text-xl font-black text-slate-800">{loading ? '...' : `₦${totalRevenue.toLocaleString()}`}</h3>
          </div>
        </div>
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-5 rounded-2xl shadow-md text-white flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase opacity-80">Quick Action</p>
          <Link to="/new-patient" className="mt-2 flex items-center justify-between bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-xs font-bold transition-all">
            New Patient Bill <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Search className="text-teal-600" size={20} />
            Patient Status Verification
          </h3>
          <p className="text-slate-500 text-xs mt-1">Verify payment before lab admission.</p>
        </div>

        <form onSubmit={handleQuickLookup} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by ID, Phone, or Name..."
            value={quickSearch}
            onChange={(e) => { setQuickSearch(e.target.value); setHasSearched(false); }}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
          <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all whitespace-nowrap">
            Check Status
          </button>
        </form>

        {hasSearched && (
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 transition-all">
            {searchResult ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-mono font-bold text-slate-400">{searchResult.id}</p>
                  <h4 className="font-bold text-slate-800">{searchResult.name}</h4>
                  <p className="text-xs text-slate-600">{searchResult.testType} • ₦{Number(searchResult.amount).toLocaleString()}</p>
                </div>
                {searchResult.status?.toLowerCase() === 'paid' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 size={14} /> CLEARED
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock size={14} /> PENDING
                  </span>
                )}
              </div>
            ) : (
              <p className="text-center text-xs text-slate-500">No matching record found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;