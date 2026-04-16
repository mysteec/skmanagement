import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ─── Orders ──────────────────────────────────────────────────────────────────
export const fetchClients = () => api.get('/orders/clients').then(r => r.data);
export const fetchPendingOrders = () => api.get('/orders/pending').then(r => r.data);
export const fetchCompletedOrders = (params = {}) => api.get('/orders/completed', { params }).then(r => r.data);
export const fetchAllOrders = () => api.get('/orders').then(r => r.data);
export const fetchOrder = (id) => api.get(`/orders/${id}`).then(r => r.data);
export const createOrder = (data) => api.post('/orders', data).then(r => r.data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data).then(r => r.data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`).then(r => r.data);

// ─── Production ───────────────────────────────────────────────────────────────
export const fetchProductionLogs = (orderId) => api.get(`/production/${orderId}`).then(r => r.data);
export const logProduction = (data) => api.post('/production', data).then(r => r.data);
export const updateProductionLog = (id, data) => api.put(`/production/${id}`, data).then(r => r.data);

// ─── Payments ─────────────────────────────────────────────────────────────────
export const fetchPaymentsOverview = () => api.get('/payments/overview').then(r => r.data);
export const fetchPaymentByOrder = (orderId) => api.get(`/payments/order/${orderId}`).then(r => r.data);
export const createPayment = (data) => api.post('/payments', data).then(r => r.data);
export const addReceived = (id, data) => api.put(`/payments/${id}/receive`, data).then(r => r.data);
export const updatePayment = (id, data) => api.put(`/payments/${id}`, data).then(r => r.data);

export default api;
