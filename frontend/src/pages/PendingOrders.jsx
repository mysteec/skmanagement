import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Clock, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { fetchPendingOrders, deleteOrder } from '../api/api';

function StatusBadge({ status }) {
  const map = {
    'Pending': 'badge badge-pending',
    'In Progress': 'badge badge-progress',
  };
  return <span className={map[status] || 'badge badge-pending'}>{status}</span>;
}

function DeliveryStatus({ deliveryDate }) {
  const today = new Date();
  const dDate = new Date(deliveryDate);
  const diff = Math.ceil((dDate - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) return <span className="text-rose-600 font-semibold text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Overdue</span>;
  if (diff <= 2) return <span className="text-rose-500 font-semibold text-xs">{diff}d left</span>;
  if (diff <= 5) return <span className="text-amber-500 font-semibold text-xs">{diff}d left</span>;
  return <span className="text-slate-400 text-xs">{diff}d left</span>;
}

export default function PendingOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchPendingOrders()
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => { toast.error('Failed to load orders'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order? This will also remove its production logs and payments.')) return;
    try {
      await deleteOrder(id);
      toast.success('Order deleted');
      load();
    } catch (err) {
      toast.error('Failed to delete order');
    }
  };

  const handleDownloadPDF = () => {
    const rows = orders.map((o, i) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 8px;">${i + 1}</td>
        <td style="padding:10px 8px;">${o.clientName}</td>
        <td style="padding:10px 8px;">${o.type}</td>
        <td style="padding:10px 8px;">${o.specification || '—'}</td>
        <td style="padding:10px 8px;text-align:center;">${o.quantity}</td>
        <td style="padding:10px 8px;text-align:center;">${o.completedQty}</td>
        <td style="padding:10px 8px;text-align:center;">${o.sentQty}</td>
        <td style="padding:10px 8px;text-align:center;">${o.quantity - o.completedQty}</td>
        <td style="padding:10px 8px;">${new Date(o.deliveryDate).toLocaleDateString('en-IN')}</td>
        <td style="padding:10px 8px;">${o.status}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>Pending Orders - SK Trading</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#1e293b}
        h1{font-size:22px;font-weight:700;margin-bottom:4px}
        p{color:#64748b;font-size:13px;margin-bottom:20px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th{background:#f1f5f9;padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b}
      </style>
      </head><body>
      <h1>SK Trading Company — Pending Orders</h1>
      <p>Generated on ${new Date().toLocaleString('en-IN')}</p>
      <table>
        <thead><tr>
          <th>#</th><th>Client</th><th>Type</th><th>Spec</th>
          <th>Total</th><th>Done</th><th>Sent</th><th>Pending</th>
          <th>Delivery</th><th>Status</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      </body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) { win.focus(); setTimeout(() => win.print(), 500); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <header className="bg-white border-b border-slate-100 shadow-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">Pending Orders</h1>
                <p className="text-xs text-slate-400">{orders.length} order{orders.length !== 1 ? 's' : ''} pending</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              id="btn-refresh"
              onClick={load}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="btn-download-pdf"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-slate-700">All caught up!</h3>
            <p className="text-slate-400 mt-2">No pending orders at the moment</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="table-th">#</th>
                    <th className="table-th">Client</th>
                    <th className="table-th">Type</th>
                    <th className="table-th">Specification</th>
                    <th className="table-th text-center">Total Qty</th>
                    <th className="table-th text-center">Completed</th>
                    <th className="table-th text-center">Sent</th>
                    <th className="table-th text-center">Pending</th>
                    <th className="table-th">Delivery</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order, idx) => {
                    const pending = order.quantity - order.completedQty;
                    const overdue = new Date(order.deliveryDate) < new Date();
                    return (
                      <tr key={order._id} className={`hover:bg-slate-50 transition-colors ${overdue ? 'bg-rose-50/40' : ''}`}>
                        <td className="table-td font-medium text-slate-400">{idx + 1}</td>
                        <td className="table-td font-semibold text-slate-800">{order.clientName}</td>
                        <td className="table-td capitalize">{order.type}</td>
                        <td className="table-td text-slate-500 max-w-xs truncate">{order.specification || '—'}</td>
                        <td className="table-td text-center font-semibold">{order.quantity}</td>
                        <td className="table-td text-center text-emerald-600 font-semibold">{order.completedQty}</td>
                        <td className="table-td text-center text-blue-600 font-semibold">{order.sentQty}</td>
                        <td className="table-td text-center">
                          <span className={`font-bold ${pending > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{pending}</span>
                        </td>
                        <td className="table-td">
                          <div>
                            <p className="text-sm">{new Date(order.deliveryDate).toLocaleDateString('en-IN')}</p>
                            <DeliveryStatus deliveryDate={order.deliveryDate} />
                          </div>
                        </td>
                        <td className="table-td"><StatusBadge status={order.status} /></td>
                        <td className="table-td text-center">
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
