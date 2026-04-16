import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, Download, Printer, CheckCircle2, RefreshCw, X, Trash2 } from 'lucide-react';
import { fetchCompletedOrders, deleteOrder } from '../api/api';

export default function CompletedOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = (params = {}) => {
    setLoading(true);
    fetchCompletedOrders(params)
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => { toast.error('Failed to load orders'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this completed order? This will also remove its associated payment records.')) return;
    try {
      await deleteOrder(id);
      toast.success('Order deleted');
      handleSearch();
    } catch (err) {
      toast.error('Failed to delete order');
    }
  };

  const handleSearch = () => {
    load({ from, to, search });
  };

  const handleClear = () => {
    setSearch(''); setFrom(''); setTo('');
    load();
  };

  const handlePrint = () => {
    const rows = orders.map((o, i) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 8px;">${i + 1}</td>
        <td style="padding:10px 8px;">${o.clientName}</td>
        <td style="padding:10px 8px;">${o.type}</td>
        <td style="padding:10px 8px;">${o.specification || '—'}</td>
        <td style="padding:10px 8px;text-align:center;">${o.quantity}</td>
        <td style="padding:10px 8px;text-align:center;">${o.sentQty}</td>
        <td style="padding:10px 8px;">₹${(o.rate || 0).toLocaleString('en-IN')}</td>
        <td style="padding:10px 8px;">₹${((o.rate || 0) * o.quantity).toLocaleString('en-IN')}</td>
        <td style="padding:10px 8px;">${new Date(o.deliveryDate).toLocaleDateString('en-IN')}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>Completed Orders - SK Trading</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#1e293b}
        h1{font-size:22px;font-weight:700;margin-bottom:4px}
        p{color:#64748b;font-size:13px;margin-bottom:20px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th{background:#f1f5f9;padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b}
      </style>
      </head><body>
      <h1>SK Trading Company — Completed Orders</h1>
      <p>Generated on ${new Date().toLocaleString('en-IN')}</p>
      <table>
        <thead><tr>
          <th>#</th><th>Client</th><th>Type</th><th>Spec</th>
          <th>Qty</th><th>Sent</th><th>Rate</th><th>Total Value</th><th>Delivery</th>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      <header className="bg-white border-b border-slate-100 shadow-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">Completed Orders</h1>
                <p className="text-xs text-slate-400">{orders.length} order{orders.length !== 1 ? 's' : ''} completed</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button id="btn-refresh" onClick={() => load({ from, to, search })} className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button id="btn-print" onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-all shadow-sm">
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="input-search"
                type="text"
                placeholder="Search client or type..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-teal-400 focus:outline-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 whitespace-nowrap">From:</span>
              <input id="input-from" type="date" className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-teal-400 focus:outline-none" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 whitespace-nowrap">To:</span>
              <input id="input-to" type="date" className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-teal-400 focus:outline-none" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <button id="btn-search" onClick={handleSearch} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-all">
              Search
            </button>
            {(search || from || to) && (
              <button id="btn-clear" onClick={handleClear} className="px-4 py-2.5 border border-slate-200 text-slate-500 text-sm rounded-xl hover:bg-slate-50 flex items-center gap-1 transition-all">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-slate-700">No completed orders found</h3>
            <p className="text-slate-400 mt-2">Try adjusting your search or filters</p>
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
                    <th className="table-th text-center">Qty</th>
                    <th className="table-th text-center">Sent</th>
                    <th className="table-th">Rate</th>
                    <th className="table-th">Total Value</th>
                    <th className="table-th">Delivery Date</th>
                    <th className="table-th">Completed On</th>
                    <th className="table-th text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order, idx) => (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-td text-slate-400 font-medium">{idx + 1}</td>
                      <td className="table-td font-semibold text-slate-800">{order.clientName}</td>
                      <td className="table-td capitalize">{order.type}</td>
                      <td className="table-td text-slate-500 max-w-xs truncate">{order.specification || '—'}</td>
                      <td className="table-td text-center font-semibold">{order.quantity}</td>
                      <td className="table-td text-center text-blue-600 font-semibold">{order.sentQty}</td>
                      <td className="table-td">₹{(order.rate || 0).toLocaleString('en-IN')}</td>
                      <td className="table-td font-semibold text-teal-700">
                        ₹{((order.rate || 0) * order.quantity).toLocaleString('en-IN')}
                      </td>
                      <td className="table-td">{new Date(order.deliveryDate).toLocaleDateString('en-IN')}</td>
                      <td className="table-td text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="table-td text-center">
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
