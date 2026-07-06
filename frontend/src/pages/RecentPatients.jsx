import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, RefreshCw, CheckCircle2, Clock, XCircle, Send, AlertCircle } from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${apiUrl}/api/patients`);
      const sortedData = Array.isArray(response.data) ? response.data.reverse() : [];
      setPatients(sortedData);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Could not load patient records. Ensure your backend server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getPatients = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${apiUrl}/api/patients`);
        if (isMounted) {
          const sortedData = Array.isArray(response.data) ? response.data.reverse() : [];
          setPatients(sortedData);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching patients:', err);
          setError('Could not load patient records.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getPatients();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleResendWhatsApp = (patient) => {
    const link = patient.checkoutUrl || patient.checkoutLink || '#';
    let cleanPhone = (patient.phone || '').replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '234' + cleanPhone.slice(1);

    const message = `Hello ${patient.name},\n\nHere is your reminder for your CareLink medical billing link (*${patient.testType}* - ₦${Number(patient.amount).toLocaleString()}).\n\nPlease complete your payment securely via Nomba:\n${link}\n\nThank you!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredPatients = patients.filter((pat) => {
    const matchesSearch = 
      (pat.name && pat.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pat.id && pat.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pat.phone && pat.phone.includes(searchTerm));
      
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (pat.status && pat.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
       <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
           <Users className="text-teal-600" size={28} />
                   Recent Patients
           </h1>
        <p className="text-slate-500 text-sm mt-1">
          View and manage billing records for all patients registered in the clinic.
        </p>
        </div>

        <button
          onClick={fetchPatients}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-sm transition-all text-sm self-start sm:self-auto"
        >
          <RefreshCw size={16} className={`text-teal-600 ${loading ? 'animate-spin' : ''}`} />
          Refresh Records
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by patient name, ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="paid">Paid Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Patient ID</th>
                <th className="py-4 px-6">Patient Details</th>
                <th className="py-4 px-6">Test Type</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Payment Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                    <RefreshCw size={24} className="animate-spin text-teal-600 mx-auto mb-2" />
                    Loading clinic records from database...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No patient records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat, index) => {
                  const isPaid = pat.status && pat.status.toLowerCase() === 'paid';
                  const isPending = pat.status && pat.status.toLowerCase() === 'pending';

                  return (
                    <tr key={pat.id || index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-slate-500 font-semibold">
                        {pat.id || `pat_${index}`}
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{pat.name || 'Unknown Patient'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{pat.phone || 'No phone'}</p>
                      </td>

                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {pat.testType || 'General Consultation'}
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-800">
                        ₦{Number(pat.amount || 0).toLocaleString()}
                      </td>

                      <td className="py-4 px-6">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            Paid
                          </span>
                        ) : isPending ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock size={14} className="text-amber-600" />
                              Pending
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1">Waiting for Webhook Sync</p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                            <XCircle size={14} className="text-red-600" />
                            {pat.status || 'Failed'}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResendWhatsApp(pat)}
                            title="Resend WhatsApp Link"
                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                          >
                            <Send size={15} />
                            <span className="hidden lg:inline">WhatsApp</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Patients;