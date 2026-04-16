import { useNavigate } from 'react-router-dom';
import {
  PlusCircle, Factory, RefreshCw, Clock, CheckCircle2, CreditCard
} from 'lucide-react';

const modules = [
  {
    label: 'New Order',
    icon: PlusCircle,
    path: '/new-order',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800',
    hoverBg: 'hover:bg-blue-100',
  },
  {
    label: "Today's Production",
    icon: Factory,
    path: '/todays-production',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-500',
    textColor: 'text-emerald-800',
    hoverBg: 'hover:bg-emerald-100',
  },
  {
    label: 'Update Progress',
    icon: RefreshCw,
    path: '/update-progress',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    iconColor: 'text-violet-500',
    textColor: 'text-violet-800',
    hoverBg: 'hover:bg-violet-100',
  },
  {
    label: 'Pending Orders',
    icon: Clock,
    path: '/pending-orders',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    textColor: 'text-amber-800',
    hoverBg: 'hover:bg-amber-100',
  },
  {
    label: 'Completed Orders',
    icon: CheckCircle2,
    path: '/completed-orders',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    iconColor: 'text-teal-500',
    textColor: 'text-teal-800',
    hoverBg: 'hover:bg-teal-100',
  },
  {
    label: 'Payment Management',
    icon: CreditCard,
    path: '/payment-management',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    iconColor: 'text-rose-500',
    textColor: 'text-rose-800',
    hoverBg: 'hover:bg-rose-100',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow">
              <span className="text-white font-bold text-lg">SK</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">SK Trading Company</h1>
              <p className="text-xs text-slate-400 font-medium">Management System</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 hidden sm:block">{today}</p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-400 mt-1 text-sm">Select a module to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.path}
                id={`btn-${mod.path.replace('/', '')}`}
                onClick={() => navigate(mod.path)}
                className={`module-btn ${mod.bg} ${mod.border} ${mod.hoverBg} focus:ring-4 focus:ring-slate-200 min-h-[25vh] md:min-h-[140px]`}
              >
                <div className={`p-3 rounded-2xl bg-white shadow-sm`}>
                  <Icon className={`w-8 h-8 ${mod.iconColor}`} strokeWidth={1.8} />
                </div>
                <span className={`text-base font-semibold ${mod.textColor} text-center leading-snug`}>
                  {mod.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-300 text-xs mt-12">
          SK Trading Company © {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
}
