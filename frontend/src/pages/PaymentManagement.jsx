import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CreditCard, Plus, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { fetchPaymentsOverview, createPayment, addReceived, updatePayment } from '../api/api';

function StatusBadge({ status }) {
  const map = {
    Unpaid: 'badge badge-unpaid',
    Partial: 'badge badge-partial',
    Paid: 'badge badge-paid',
  };
  return <span className={map[status] || 'badge badge-unpaid'}>{status}</span>;
}

function PaymentBar({ received, total }) {
  const pct = total > 0 ? Math.min((received / total) * 100, 100) : 0;
  const color = pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
      <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function PaymentManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // [{order, payment}]
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ totalPayable: '', amount: '', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetchPaymentsOverview()
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { toast.error('Failed to load payments'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const toggleExpand = (id) => {
    setExpanded(prev => prev === id ? null : id);
    setForm({ totalPayable: '', amount: '', note: '' });
  };

  const handleSetPayable = async (item) => {
    if (!form.totalPayable || Number(form.totalPayable) <= 0) {
      toast.error('Enter a valid total payable amount');
      return;
    }
    setSubmitting(true);
    try {
      if (item.payment) {
        await updatePayment(item.payment._id, { totalPayable: Number(form.totalPayable) });
      } else {
        await createPayment({ orderId: item.order._id, totalPayable: Number(form.totalPayable) });
      }
      toast.success('Total payable updated!');
      setForm(p => ({ ...p, totalPayable: '' }));
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReceived = async (item) => {
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      await addReceived(item.payment._id, { amount: Number(form.amount), note: form.note });
      toast.success('Payment recorded!');
      setForm(p => ({ ...p, amount: '', note: '' }));
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      <header className="bg-white border-b border-slate-100 shadow-sm px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">Payment Management</h1>
                <p className="text-xs text-slate-400">Track client payments</p>
              </div>
            </div>
          </div>
          <button id="btn-refresh" onClick={load} className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-slate-700">No completed orders yet</h3>
            <p className="text-slate-400 mt-2">Complete an order to manage its payment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map(item => {
              const { order, payment } = item;
              const isOpen = expanded === order._id;
              const received = payment?.receivedAmount || 0;
              const total = payment?.totalPayable || 0;
              const remaining = total - received;
              const status = payment?.status || 'Unpaid';

              return (
                <div key={order._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Summary Row */}
                  <button
                    id={`payment-${order._id}`}
                    onClick={() => toggleExpand(order._id)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-800">{order.clientName}</h3>
                        <StatusBadge status={status} />
                      </div>
                      <p className="text-sm text-slate-400 capitalize">{order.type} · {order.quantity} pcs · {new Date(order.deliveryDate).toLocaleDateString('en-IN')}</p>
                      {payment && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Received: ₹{received.toLocaleString('en-IN')} / ₹{total.toLocaleString('en-IN')}</span>
                            <span className={remaining > 0 ? 'text-rose-500 font-semibold' : 'text-emerald-600 font-semibold'}>
                              {remaining > 0 ? `₹${remaining.toLocaleString('en-IN')} remaining` : 'Fully Paid'}
                            </span>
                          </div>
                          <PaymentBar received={received} total={total} />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-slate-400">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Expanded Panel */}
                  {isOpen && (
                    <div className="border-t border-slate-100 px-6 py-5 bg-slate-50 animate-slide-up">
                      {/* Order info */}
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                          { label: 'Total Qty', value: order.quantity },
                          { label: 'Sent', value: order.sentQty },
                          { label: 'Delivery', value: new Date(order.deliveryDate).toLocaleDateString('en-IN') },
                        ].map(item => (
                          <div key={item.label} className="bg-white rounded-xl p-3 text-center">
                            <p className="text-lg font-bold text-slate-800">{item.value}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Set total payable */}
                      <div className="bg-white rounded-2xl p-4 mb-4">
                        <h4 className="text-sm font-semibold text-slate-600 mb-3">
                          {payment ? 'Update Total Payable' : 'Set Total Payable Amount'}
                        </h4>
                        {payment && (
                          <p className="text-sm text-slate-500 mb-3">Current: ₹{payment.totalPayable.toLocaleString('en-IN')}</p>
                        )}
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
                            <input
                              id="input-total-payable"
                              type="number"
                              min="0"
                              placeholder="Enter total payable"
                              className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-400 focus:outline-none text-sm"
                              value={form.totalPayable}
                              onChange={e => setForm(p => ({ ...p, totalPayable: e.target.value }))}
                            />
                          </div>
                          <button
                            id="btn-set-payable"
                            onClick={() => handleSetPayable(item)}
                            disabled={submitting}
                            className="px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
                          >
                            {payment ? 'Update' : 'Set'}
                          </button>
                        </div>
                      </div>

                      {/* Add received payment */}
                      {payment && (
                        <div className="bg-white rounded-2xl p-4 mb-4">
                          <h4 className="text-sm font-semibold text-slate-600 mb-3">Add Received Payment</h4>
                          <div className="flex gap-3 mb-3">
                            <div className="relative flex-1">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
                              <input
                                id="input-received-amount"
                                type="number"
                                min="1"
                                placeholder="Amount received"
                                className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:outline-none text-sm"
                                value={form.amount}
                                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                              />
                            </div>
                            <button
                              id="btn-add-received"
                              onClick={() => handleAddReceived(item)}
                              disabled={submitting}
                              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-1 disabled:opacity-60"
                            >
                              <Plus className="w-4 h-4" /> Add
                            </button>
                          </div>
                          <input
                            id="input-payment-note"
                            type="text"
                            placeholder="Note (optional)"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-sm"
                            value={form.note}
                            onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                          />
                        </div>
                      )}

                      {/* Payment history */}
                      {payment?.paymentHistory?.length > 0 && (
                        <div className="bg-white rounded-2xl p-4">
                          <h4 className="text-sm font-semibold text-slate-600 mb-3">Payment History</h4>
                          <div className="space-y-2">
                            {payment.paymentHistory.map((h, i) => (
                              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                <div>
                                  <p className="text-sm font-semibold text-emerald-700">+₹{h.amount.toLocaleString('en-IN')}</p>
                                  {h.note && <p className="text-xs text-slate-400">{h.note}</p>}
                                </div>
                                <p className="text-xs text-slate-400">{new Date(h.date).toLocaleDateString('en-IN')}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
