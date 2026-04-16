import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, User, Package, Hash, Send } from 'lucide-react';
import { fetchPendingOrders, logProduction } from '../api/api';

const STEPS = [
  { id: 1, label: 'Client', icon: User },
  { id: 2, label: 'Order', icon: Package },
  { id: 3, label: 'Qty', icon: Hash },
  { id: 4, label: 'Sent?', icon: Send },
  { id: 5, label: 'Review', icon: Check },
];

function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {steps.map((step, idx) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;
        return (
          <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-emerald-500 text-white scale-110 shadow-md' : 'bg-slate-100 text-slate-400'}`}>
              {isDone ? <Check className="w-4 h-4" /> : step.id}
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 w-8 mx-1 rounded transition-all duration-300 ${step.id < currentStep ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TodaysProduction({ isUpdate = false }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    clientName: '',
    orderId: '',
    orderInfo: null,
    quantity: '',
    sent: null,
    sentQty: '',
  });

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  useEffect(() => {
    fetchPendingOrders()
      .then(data => {
        setOrders(data);
        const uniqueClients = [...new Set(data.map(o => o.clientName))];
        setClients(uniqueClients);
      })
      .catch(() => toast.error('Failed to load orders'));
  }, []);

  const handleClientSelect = (client) => {
    set('clientName', client);
    const clientOrders = orders.filter(o => o.clientName === client);
    setFilteredOrders(clientOrders);
    set('orderId', '');
    set('orderInfo', null);
  };

  const handleOrderSelect = (order) => {
    set('orderId', order._id);
    set('orderInfo', order);
  };

  const canNext = () => {
    if (step === 1) return form.clientName !== '';
    if (step === 2) return form.orderId !== '';
    if (step === 3) return form.quantity !== '' && Number(form.quantity) > 0;
    if (step === 4) return form.sent !== null;
    return true;
  };

  const handleNext = () => {
    if (!canNext()) { toast.error('Please make a selection'); return; }
    // Skip sentQty sub-step if not sent
    setStep(s => s + 1);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await logProduction({
        orderId: form.orderId,
        quantityProduced: Number(form.quantity),
        sent: form.sent,
        sentQty: form.sent ? Number(form.sentQty || 0) : 0,
      });
      toast.success(isUpdate ? 'Progress updated!' : 'Production logged!');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const title = isUpdate ? 'Update Progress' : "Today's Production";
  const accentColor = isUpdate ? 'violet' : 'emerald';
  const accentMap = {
    emerald: {
      header: 'bg-emerald-500',
      icon: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      btn: 'bg-emerald-500 hover:bg-emerald-600',
      border: 'border-emerald-500',
      text: 'text-emerald-700',
      step: 'bg-emerald-500',
    },
    violet: {
      header: 'bg-violet-500',
      icon: 'text-violet-600',
      iconBg: 'bg-violet-100',
      btn: 'bg-violet-500 hover:bg-violet-600',
      border: 'border-violet-500',
      text: 'text-violet-700',
      step: 'bg-violet-500',
    }
  };
  const ac = accentMap[accentColor];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-${accentColor}-50`}>
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${ac.header} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">SK</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-800">{title}</h1>
              <p className="text-xs text-slate-400">SK Trading Company</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <StepIndicator steps={STEPS} currentStep={step} />

        {/* Step 1: Select Client */}
        {step === 1 && (
          <div className="step-card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 ${ac.iconBg} rounded-xl`}><User className={`w-5 h-5 ${ac.icon}`} /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Select Client</h2>
                <p className="text-sm text-slate-400">Which client's order?</p>
              </div>
            </div>
            {clients.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No pending orders found</p>
            ) : (
              <div className="space-y-3">
                {clients.map(client => (
                  <button
                    key={client}
                    id={`client-${client.replace(/\s/g, '-')}`}
                    onClick={() => handleClientSelect(client)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-medium transition-all duration-200
                      ${form.clientName === client
                        ? `${ac.border} ${accentColor === 'emerald' ? 'bg-emerald-50 text-emerald-800' : 'bg-violet-50 text-violet-800'} shadow-sm`
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    {client}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Order */}
        {step === 2 && (
          <div className="step-card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 ${ac.iconBg} rounded-xl`}><Package className={`w-5 h-5 ${ac.icon}`} /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Select Order</h2>
                <p className="text-sm text-slate-400">Choose the order to update</p>
              </div>
            </div>
            <div className="space-y-3">
              {filteredOrders.map(order => (
                <button
                  key={order._id}
                  id={`order-${order._id}`}
                  onClick={() => handleOrderSelect(order)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200
                    ${form.orderId === order._id
                      ? `${ac.border} ${accentColor === 'emerald' ? 'bg-emerald-50' : 'bg-violet-50'} shadow-sm`
                      : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-800">{order.type.charAt(0).toUpperCase() + order.type.slice(1)}</p>
                      <p className="text-sm text-slate-500">{order.specification || 'No specification'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">{order.completedQty}/{order.quantity}</p>
                      <p className="text-xs text-slate-400">completed</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Quantity */}
        {step === 3 && (
          <div className="step-card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 ${ac.iconBg} rounded-xl`}><Hash className={`w-5 h-5 ${ac.icon}`} /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Quantity Produced</h2>
                <p className="text-sm text-slate-400">
                  Remaining: <strong>{form.orderInfo ? form.orderInfo.quantity - form.orderInfo.completedQty : '—'}</strong> pcs
                </p>
              </div>
            </div>
            <input
              id="input-qty"
              type="number"
              min="1"
              max={form.orderInfo ? form.orderInfo.quantity - form.orderInfo.completedQty : undefined}
              placeholder="Enter quantity..."
              className="input-field"
              value={form.quantity}
              onChange={e => set('quantity', e.target.value)}
            />
          </div>
        )}

        {/* Step 4: Sent? */}
        {step === 4 && (
          <div className="step-card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 ${ac.iconBg} rounded-xl`}><Send className={`w-5 h-5 ${ac.icon}`} /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Was it Sent?</h2>
                <p className="text-sm text-slate-400">Did you dispatch this batch to the client?</p>
              </div>
            </div>
            <div className="flex gap-4 mb-5">
              <button
                id="btn-sent-yes"
                onClick={() => set('sent', true)}
                className={`flex-1 py-5 rounded-2xl border-2 font-bold text-lg transition-all duration-200
                  ${form.sent === true ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}
              >
                ✅ Yes, Sent
              </button>
              <button
                id="btn-sent-no"
                onClick={() => { set('sent', false); set('sentQty', ''); }}
                className={`flex-1 py-5 rounded-2xl border-2 font-bold text-lg transition-all duration-200
                  ${form.sent === false ? 'bg-slate-700 text-white border-slate-700 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
              >
                🚫 Not Yet
              </button>
            </div>
            {form.sent === true && (
              <div>
                <p className="text-sm text-slate-500 mb-2 ml-1">How many were sent?</p>
                <input
                  id="input-sent-qty"
                  type="number"
                  min="1"
                  max={form.quantity}
                  placeholder="Sent quantity"
                  className="input-field"
                  value={form.sentQty}
                  onChange={e => set('sentQty', e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="step-card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-xl"><Check className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Review Entry</h2>
                <p className="text-sm text-slate-400">Confirm before saving</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Client', value: form.clientName },
                { label: 'Order Type', value: form.orderInfo ? form.orderInfo.type.charAt(0).toUpperCase() + form.orderInfo.type.slice(1) : '—' },
                { label: 'Quantity Produced', value: `${form.quantity} pcs` },
                { label: 'Sent to Client', value: form.sent ? `Yes — ${form.sentQty || 0} pcs` : 'Not Yet', highlighted: true },
              ].map(row => (
                <div key={row.label} className={`flex items-center justify-between p-4 rounded-2xl ${row.highlighted ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}`}>
                  <span className="text-sm text-slate-500 font-medium">{row.label}</span>
                  <span className="font-semibold text-sm text-slate-800">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex gap-4 mt-6 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
          {step > 1 && (
            <button
              id="btn-prev"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border-2 border-slate-200 text-slate-600 font-semibold text-base hover:bg-slate-50 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          )}
          {step < 5 ? (
            <button
              id="btn-next"
              onClick={handleNext}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl ${ac.btn} text-white font-semibold text-base transition-all active:scale-95 shadow-sm hover:shadow-md`}
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-save-production"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base transition-all active:scale-95 shadow-sm disabled:opacity-60"
            >
              {saving ? 'Saving...' : (
                <><Check className="w-5 h-5" /> {isUpdate ? 'Update Progress' : 'Save Production'}</>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
