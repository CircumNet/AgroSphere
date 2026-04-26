import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Eye, EyeOff, Tractor, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { register } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'farmer' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data.access_token, res.data.user);
      toast.success('Account created!');
      navigate(res.data.user.role === 'farmer' ? '/farmer/setup' : '/lender');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-primary-800">AgroSphere AI</span>
        </div>

        <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Create account</h1>
        <p className="text-gray-500 mb-8">Join thousands of farmers building credit</p>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: 'farmer', icon: Tractor, label: 'I\'m a Farmer', desc: 'Log activities & build credit' },
            { value: 'lender', icon: Building2, label: 'I\'m a Lender', desc: 'Discover creditworthy farmers' },
          ].map(({ value, icon: Icon, label, desc }) => (
            <button key={value} type="button"
              onClick={() => setForm({ ...form, role: value })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${form.role === value ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <Icon className={`w-5 h-5 mb-2 ${form.role === value ? 'text-primary-600' : 'text-gray-400'}`} />
              <div className={`font-semibold text-sm ${form.role === value ? 'text-primary-700' : 'text-gray-700'}`}>{label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input type="text" className="input" placeholder="John Doe" required
              value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email address</label>
            <input type="email" className="input" placeholder="you@example.com" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="input pr-12" placeholder="Min. 6 characters" required
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
