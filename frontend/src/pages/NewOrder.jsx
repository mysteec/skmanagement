import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, User, Package, FileText, DollarSign, Hash, Calendar } from 'lucide-react';
import { fetchClients, createOrder } from '../api/api';

const ORDER_TYPES = [
  { value: 'bag', label: 'Bag', emoji: '👜', color: 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' },
  { value: 'packaging', label: 'Packaging', emoji: '📦', color: 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' },
  { value: 'fabric', label: 'Fabric', emoji: '🧵', color: 'bg-violet-50 border-violet-300 text-violet-700 hover:bg-violet-100' },
];

const DELIVERY_QUICK = [
  { label: '10 Days', days: 10 },
  { label: '15 Days', days: 15 },
  { label: '20 Days', days: 20 },
];

const STEPS = [
  { id: 1, label: 'Client', icon: User },
  { id: 2, label: 'Type', icon: Package },
  { id: 3, label: 'Specification', icon: FileText },
  { id: 4, label: 'Rate', icon: DollarSign },
  { id: 5, label: 'Quantity', icon: Hash },
  { id: 6, label: 'Delivery', icon: Calendar },
  { id: 7, label: 'Summary', icon: Check },
];

function PageHeader({ title, onBack }) {
  return (
    <header className="bg-white border-b border-slate-100 shadow-sm px-6 py-4">
      <div className="max-w-2xl mx-auto flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SK</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-800">{title}</h1>
            <p className="text-xs text-slate-400">SK Trading Company</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-1 flex-wrap py-4">
      {steps.map((step, idx) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;
        return (
          <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-500 text-white scale-110 shadow-md' : 'bg-slate-100 text-slate-400'}`}>
              {isDone ? <Check className="w-4 h-4" /> : step.id}
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 w-6 mx-1 rounded transition-all duration-300 ${step.id < currentStep ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NewOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const [form, setForm] = useState({
    clientName: '',
    type: '',
    specification: '',
    rate: '',
    quantity: '',
    deliveryDate: '',
  });

  useEffect(() => {
    fetchClients().then(setClients).catch(() => {});
  }, []);

  const filteredClients = clients.filter(c =>
    c.toLowerCase().includes(form.clientName.toLowerCase())
  );

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const addDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const canNext = () => {
    if (step === 1) return form.clientName.trim().length > 0;
    if (step === 2) return form.type !== '';
    if (step === 3) return true; // optional
    if (step === 4) return form.rate !== '' && Number(form.rate) >= 0;
    if (step === 5) return form.quantity !== '' && Number(form.quantity) > 0;
    if (step === 6) return form.deliveryDate !== '';
    return true;
  };

  const handleNext = () => {
    if (!canNext()) { toast.error('Please fill in this field before continuing'); return; }
    setStep(s => s + 1);
  };

  const handlePrev = () => setStep(s => s - 1);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await createOrder({
        clientName: form.clientName.trim(),
        type: form.type,
        specification: form.specification.trim(),
        rate: Number(form.rate),
        quantity: Number(form.quantity),
        deliveryDate: form.deliveryDate,
      });
      toast.success('Order saved successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const deliveryLabel = form.deliveryDate
    ? new Date(form.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader title="New Order" onBack={() => navigate('/')} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <StepIndicator steps={STEPS} currentStep={step} />

        {/* ── Step 1: Client Name ── */}
        {step === 1 && (
          <div className="step-card relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl"><User className="w-5 h-5 text-blue-600" /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Client Name</h2>
                <p className="text-sm text-slate-400">Who is this order for?</p>
              </div>
            </div>
            <div className="relative">
              <input
                ref={inputRef}
                id="input-client"
                type="text"
                placeholder="Type client name..."
                className="input-field"
                value={form.clientName}
                onChange={e => { set('clientName', e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                autoComplete="off"
              />
              {showSuggestions && filteredClients.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-2xl mt-1 shadow-lg overflow-hidden">
                  {filteredClients.slice(0, 5).map(c => (
                    <li
                      key={c}
                      className="px-5 py-3 hover:bg-blue-50 cursor-pointer text-slate-700 font-medium transition-colors"
                      onMouseDown={() => { set('clientName', c); setShowSuggestions(false); }}
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Order Type ── */}
        {step === 2 && (
          <div className="step-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-xl"><Package className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Order Type</h2>
                <p className="text-sm text-slate-400">What kind of product?</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {ORDER_TYPES.map(t => (
                <button
                  key={t.value}
                  id={`type-${t.value}`}
                  onClick={() => set('type', t.value)}
                  className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 font-semibold text-sm transition-all duration-200
                    ${form.type === t.value ? t.color + ' shadow-md scale-105 border-2' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}
                  `}
                >
                  <span className="text-3xl">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Specification ── */}
        {step === 3 && (
          <div className="step-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-100 rounded-xl"><FileText className="w-5 h-5 text-violet-600" /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Specification</h2>
                <p className="text-sm text-slate-400">Any details about the order? (optional)</p>
              </div>
            </div>
            <textarea
              id="input-spec"
              rows={4}
              placeholder="e.g. Size 12x16, Blue color, Logo printed..."
              className="input-field resize-none"
              value={form.specification}
              onChange={e => set('specification', e.target.value)}
            />
          </div>
        )}

        {/* ── Step 4: Rate ── */}
        {step === 4 && (
          <div className="step-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-xl"><DollarSign className="w-5 h-5 text-amber-600" /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Rate per Unit</h2>
                <p className="text-sm text-slate-400">Price per piece (₹)</p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-semibold">₹</span>
              <input
                id="input-rate"
                type="number"
                min="0"
                placeholder="0.00"
                className="input-field pl-10"
                value={form.rate}
                onChange={e => set('rate', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── Step 5: Quantity ── */}
        {step === 5 && (
          <div className="step-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-100 rounded-xl"><Hash className="w-5 h-5 text-teal-600" /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Quantity</h2>
                <p className="text-sm text-slate-400">Total number of pieces to produce</p>
              </div>
            </div>
            <input
              id="input-quantity"
              type="number"
              min="1"
              placeholder="e.g. 500"
              className="input-field"
              value={form.quantity}
              onChange={e => set('quantity', e.target.value)}
            />
            {form.rate && form.quantity && (
              <p className="mt-3 text-sm text-slate-500">
                Total value: <span className="font-semibold text-slate-700">
                  ₹{(Number(form.rate) * Number(form.quantity)).toLocaleString('en-IN')}
                </span>
              </p>
            )}
          </div>
        )}

        {/* ── Step 6: Delivery Date ── */}
        {step === 6 && (
          <div className="step-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-100 rounded-xl"><Calendar className="w-5 h-5 text-rose-600" /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Delivery Date</h2>
                <p className="text-sm text-slate-400">When should the order be ready?</p>
              </div>
            </div>
            <div className="flex gap-3 mb-5">
              {DELIVERY_QUICK.map(q => (
                <button
                  key={q.days}
                  id={`delivery-${q.days}`}
                  onClick={() => set('deliveryDate', addDays(q.days))}
                  className={`flex-1 py-3 rounded-2xl border-2 font-semibold text-sm transition-all duration-200
                    ${form.deliveryDate === addDays(q.days)
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-rose-300'}`}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <p className="text-xs text-slate-400 mb-2 ml-1">Or pick a date:</p>
              <input
                id="input-delivery-date"
                type="date"
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
                value={form.deliveryDate}
                onChange={e => set('deliveryDate', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── Step 7: Summary ── */}
        {step === 7 && (
          <div className="step-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-xl"><Check className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Order Summary</h2>
                <p className="text-sm text-slate-400">Review before saving</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Client', value: form.clientName },
                { label: 'Order Type', value: form.type ? form.type.charAt(0).toUpperCase() + form.type.slice(1) : '—' },
                { label: 'Specification', value: form.specification || '—' },
                { label: 'Rate per Unit', value: form.rate ? `₹${Number(form.rate).toLocaleString('en-IN')}` : '—' },
                { label: 'Quantity', value: form.quantity ? `${Number(form.quantity).toLocaleString('en-IN')} pcs` : '—' },
                { label: 'Delivery Date', value: deliveryLabel },
                {
                  label: 'Total Value',
                  value: form.rate && form.quantity
                    ? `₹${(Number(form.rate) * Number(form.quantity)).toLocaleString('en-IN')}`
                    : '—',
                  highlighted: true
                },
              ].map(row => (
                <div key={row.label} className={`flex items-center justify-between p-4 rounded-2xl
                  ${row.highlighted ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}`}>
                  <span className="text-sm text-slate-500 font-medium">{row.label}</span>
                  <span className={`font-semibold text-sm ${row.highlighted ? 'text-emerald-700 text-base' : 'text-slate-800'}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div className={`flex gap-4 mt-6 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
          {step > 1 && (
            <button
              id="btn-prev"
              onClick={handlePrev}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border-2 border-slate-200 text-slate-600 font-semibold text-base hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          )}

          {step < 7 ? (
            <button
              id="btn-next"
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base transition-all active:scale-95 shadow-sm hover:shadow-md"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-save-order"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base transition-all active:scale-95 shadow-sm hover:shadow-md disabled:opacity-60"
            >
              {saving ? 'Saving...' : (
                <>
                  <Check className="w-5 h-5" />
                  Save Order
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
