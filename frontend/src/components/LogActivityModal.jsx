import { useState } from 'react';
import { X, Leaf, Beef, Wheat, Droplets, Sprout, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { logActivity } from '../services/api';

const ACTIVITY_TYPES = [
  { value: 'planting', label: 'Planting', icon: Sprout, color: 'bg-green-100 text-green-700' },
  { value: 'feeding', label: 'Feeding', icon: Beef, color: 'bg-orange-100 text-orange-700' },
  { value: 'harvesting', label: 'Harvesting', icon: Wheat, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'watering', label: 'Watering', icon: Droplets, color: 'bg-blue-100 text-blue-700' },
  { value: 'fertilizing', label: 'Fertilizing', icon: Leaf, color: 'bg-lime-100 text-lime-700' },
  { value: 'other', label: 'Other', icon: Plus, color: 'bg-gray-100 text-gray-700' },
];

export default function LogActivityModal({ onClose, onSuccess }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    activity_type: '',
    description: '',
    quantity: '',
    unit: '',
    date: today,
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.activity_type) { toast.error('Select an activity type'); return; }
    setLoading(true);
    try {
      await logActivity(form);
      toast.success('Activity logged! 📝');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="font-display font-bold text-xl">Log Activity</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Activity type */}
          <div>
            <label className="label">Activity type *</label>
            <div className="grid grid-cols-3 gap-2">
              {ACTIVITY_TYPES.map(({ value, label, icon: Icon, color }) => (
                <button key={value} type="button"
                  onClick={() => setForm({ ...form, activity_type: value })}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${form.activity_type === value ? 'border-primary-600 bg-primary-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-medium ${form.activity_type === value ? 'text-primary-700' : 'text-gray-600'}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <input type="text" className="input" placeholder="e.g. Planted maize in north field"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantity</label>
              <input type="text" className="input" placeholder="e.g. 50"
                value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <label className="label">Unit</label>
              <input type="text" className="input" placeholder="kg / bags / L"
                value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Date *</label>
            <input type="date" className="input" value={form.date} max={today}
              onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={3} placeholder="Any additional observations..."
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Log Activity'}
          </button>
        </form>
      </div>
    </div>
  );
}
