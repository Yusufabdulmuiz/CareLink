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

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${apiUrl}/api/patients`);
        if (isMounted) {
          setPatients(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading dashboard stats:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="text-teal-600" size={28} />
            Clinic Overview Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time billing performance and Nomba payment reconciliation analytics.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all"
          title="Refresh Statistics"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin text-teal-600' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-teal-50 text-teal-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bills Generated</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? '...' : totalBills}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Reconciliation</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {loading ? '...' : `₦${pendingRevenue.toLocaleString()}`}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">{pendingPatients.length} bills pending</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmed Revenue</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {loading ? '...' : `₦${totalRevenue.toLocaleString()}`}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">{paidPatients.length} bills settled</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-6 rounded-2xl shadow-md text-white flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">Fast Checkout</p>
            <h4 className="text-lg font-bold mt-1">New Patient Bill</h4>
          </div>
          <Link
            to="/new-patient"
            className="mt-4 inline-flex items-center justify-between bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            Generate Link <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Search className="text-teal-600" size={20} />
            Instant Patient Status Verification
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Quickly verify payment confirmation before admitting a patient into diagnostic lab rooms.
          </p>
        </div>

        <form onSubmit={handleQuickLookup} className="flex gap-4">
          <input
            type="text"
            placeholder="Enter Patient ID (e.g., pat_1783...), phone number, or name..."
            value={quickSearch}
            onChange={(e) => { setQuickSearch(e.target.value); setHasSearched(false); }}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
          >
            Check Status
          </button>
        </form>

        {hasSearched && (
          <div className="p-6 rounded-xl border transition-all animate-fade-in">
            {searchResult ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-semibold text-slate-400">{searchResult.id}</span>
                  <h4 className="text-lg font-bold text-slate-800 mt-0.5">{searchResult.name}</h4>
                  <p className="text-sm text-slate-600">{searchResult.testType} — <span className="font-bold">₦{Number(searchResult.amount).toLocaleString()}</span></p>
                </div>
                <div>
                  {searchResult.status && searchResult.status.toLowerCase() === 'paid' ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      CLEARED FOR LAB (PAID)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock size={18} className="text-amber-600" />
                      PAYMENT PENDING
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500 font-medium py-2">
                No patient record found matching "<span className="font-bold">{quickSearch}</span>".
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;