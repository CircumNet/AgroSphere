import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import LenderDashboard from './pages/LenderDashboard';
import FarmerSetup from './pages/FarmerSetup';
import FarmerDetail from './pages/FarmerDetail';
import Splash from './pages/Splash';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Splash />;
  if (user.role === 'farmer') return <Navigate to="/farmer" replace />;
  return <Navigate to="/lender" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif' } }} />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/farmer" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>} />
          <Route path="/farmer/setup" element={<ProtectedRoute role="farmer"><FarmerSetup /></ProtectedRoute>} />
          <Route path="/lender" element={<ProtectedRoute role="lender"><LenderDashboard /></ProtectedRoute>} />
          <Route path="/lender/farmer/:id" element={<ProtectedRoute role="lender"><FarmerDetail /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
