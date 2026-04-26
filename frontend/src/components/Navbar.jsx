import { Sprout, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar({ title }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-primary-800 text-sm hidden sm:block">AgroSphere AI</span>
          {title && <span className="text-gray-300 hidden sm:block">·</span>}
          {title && <span className="text-gray-600 text-sm font-medium hidden sm:block">{title}</span>}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-700" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.full_name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold hidden sm:block ${user?.role === 'lender' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
              {user?.role}
            </span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
