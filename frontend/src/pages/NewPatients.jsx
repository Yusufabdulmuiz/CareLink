import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Send, Copy, Check, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';

const TEST_TYPES = [
  { name: 'Malaria Parasite & Widal Test', price: 8000 },
  { name: 'Full Blood Count (FBC)', price: 12000 },
  { name: 'Comprehensive Body Checkup', price: 28000 },
  { name: 'Chest X-Ray Screening', price: 15000 },
  { name: 'Fasting Blood Sugar (FBS)', price: 5000 },
  { name: 'Custom Diagnostic Test', price: '' },
];

const NewPatient = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    testType: TEST_TYPES[0].name,
    amount: TEST_TYPES[0].price,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [generatedBill, setGeneratedBill] = useState(null);

  useEffect(() => {
    if (!generatedBill || generatedBill.status === 'paid') return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/patients`);
        const updatedRecord = res.data.find(p => p.orderReference === generatedBill.orderReference);

        if (updatedRecord && updatedRecord.status === 'paid') {
          setGeneratedBill(updatedRecord);
        }
      } catch (err) {
        console.error('Polling check failed:', err.message);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [generatedBill]);

  const handleTestChange = (e) => {
    const selectedName = e.target.value;
    const foundTest = TEST_TYPES.find(t => t.name === selectedName);
    setFormData({
      ...formData,
      testType: selectedName,
      amount: foundTest ? foundTest.price : '',
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedBill(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await axios.post(`${apiUrl}/api/patients`, {
        name: formData.name,
        phone: formData.phone,
        testType: formData.testType,
        amount: Number(formData.amount),
      });

      setGeneratedBill(response.data);
    } catch (err) {
      console.error('Error generating link:', err);
      setError(err.response?.data?.message || 'Failed to connect to backend server. Ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppUrl = () => {
    if (!generatedBill) return '#';
    
    let cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '234' + cleanPhone.slice(1);
    }

    const message = `Hello ${formData.name},\n\nHere is your CareLink secure medical billing link for your upcoming *${formData.testType}* (₦${Number(formData.amount).toLocaleString()}).\n\nPlease complete your payment using this Nomba secure link prior to your lab consultation:\n${generatedBill.checkoutUrl}\n\nThank you!`;
    
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const isPaid = generatedBill?.status === 'paid';

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-1 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <UserPlus className="text-teal-600 shrink-0" size={24} />
          <span>Generate New Patient Medical Bill</span>
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
          Generate a unique, secure billing reference and forward payment instructions instantly to the patient via WhatsApp        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">Patient Full Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g., Amina Ibrahim"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">WhatsApp Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="08012345678"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">Diagnostic Test Type</label>
              <select
                name="testType"
                value={formData.testType}
                onChange={handleTestChange}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
              >
                {TEST_TYPES.map((test, index) => (
                  <option key={index} value={test.name}>{test.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">Total Amount (₦)</label>
              <input
                type="number"
                name="amount"
                required
                placeholder="Enter bill amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 sm:gap-3 text-red-700 text-xs sm:text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 sm:py-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin shrink-0" />
                <span>Generating Link...</span>
              </>
            ) : (
              <>
                <Send size={18} className="shrink-0" />
                <span>Generate Secure Payment Link</span>
              </>
            )}
          </button>
        </form>
      </div>

      {generatedBill && (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-5 sm:p-8 shadow-md animate-fade-in space-y-5 sm:space-y-6">
  <div>
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-2.5 transition-colors ${
      isPaid 
        ? 'bg-emerald-100 text-emerald-800 border-emerald-400' 
        : 'bg-amber-100 text-amber-800 border-amber-300'
    }`}>
      {!isPaid && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0"></span>}
      {isPaid && <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>}
      <span>{isPaid ? 'PAYMENT VERIFIED' : 'AWAITING PATIENT PAYMENT'}</span>
    </span>
    
    <h3 className="text-lg sm:text-xl font-bold text-slate-800">Billing Reference Generated</h3>
    <p className="text-xs sm:text-sm text-slate-600 mt-1">
      Transaction ID: <span className="font-mono font-semibold text-slate-800">{generatedBill.id}</span>
    </p>
  </div>

  <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
    <div className="overflow-hidden w-full">
      <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Secure Payment Portal</p>
      <p className="text-xs sm:text-sm font-mono text-teal-700 truncate font-medium mt-0.5">
        {generatedBill.checkoutUrl}
      </p>
    </div>
    <button
      onClick={() => handleCopy(generatedBill.checkoutUrl)}
      className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold shrink-0"
    >
      {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
    </button>
  </div>

  <div className="pt-1">
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full py-3.5 sm:py-4 bg-[#25D366] hover:bg-[#1ebd5b] active:bg-[#19a54f] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base px-2 text-center"
    >
      <MessageSquare size={20} fill="currentColor" className="shrink-0" />
      <span>Forward Billing Details to Patient</span>
    </a>
    <p className="text-center text-[11px] sm:text-xs text-slate-500 mt-2">
      This will open a secure WhatsApp session with the patient containing their lab test details and payment portal.
    </p>
  </div>
</div>
      )}
    </div>
  );
};

export default NewPatient;