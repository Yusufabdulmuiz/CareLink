import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Search, 
  User, 
  Settings, 
  CheckCircle2, 
  Menu, 
  X 
} from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard Overview', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Recent Patients', path: '/patients', icon: <Users size={20} /> },
    { name: 'New Patient', path: '/new-patient', icon: <UserPlus size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shrink-0
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <span className="text-xl font-bold text-teal-600 flex items-center gap-2">
            <span className="bg-teal-600 text-white px-2 py-0.5 rounded text-lg font-black">+</span> 
            CareLink
          </span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
            title="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-teal-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <p className="font-semibold text-slate-700">Nomba API Gateway</p>
            <p className="text-emerald-600 font-medium flex items-center gap-1.5 mt-1">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Webhook Connected
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm flex items-center justify-between px-4 sm:px-8 shrink-0 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 lg:hidden shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Open Sidebar"
            >
              <Menu size={24} />
            </button>
            <span className="text-lg font-bold text-teal-600 flex items-center gap-1.5">
              <span className="bg-teal-600 text-white px-1.5 py-0.5 rounded text-sm font-black">+</span> 
              CareLink
            </span>
          </div>

          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search patient ID, name, or Nomba ref..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-slate-500 shrink-0">
            <div className="text-right mr-2 hidden xl:block">
              <p className="text-xs font-semibold text-slate-700">Receptionist Desk</p>
              <p className="text-xs text-slate-400">Main Outpatient Clinic</p>
            </div>
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="User Profile">
              <User size={20} />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors hidden sm:block" title="Settings">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;