import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NewOrder from './pages/NewOrder';
import TodaysProduction from './pages/TodaysProduction';
import UpdateProgress from './pages/UpdateProgress';
import PendingOrders from './pages/PendingOrders';
import CompletedOrders from './pages/CompletedOrders';
import PaymentManagement from './pages/PaymentManagement';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-order" element={<NewOrder />} />
        <Route path="/todays-production" element={<TodaysProduction />} />
        <Route path="/update-progress" element={<UpdateProgress />} />
        <Route path="/pending-orders" element={<PendingOrders />} />
        <Route path="/completed-orders" element={<CompletedOrders />} />
        <Route path="/payment-management" element={<PaymentManagement />} />
      </Routes>
    </div>
  );
}

export default App;
