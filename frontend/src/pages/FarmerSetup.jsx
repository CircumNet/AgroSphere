import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, MapPin, Ruler, Phone, FileText, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { createFarmerProfile } from '../services/api';

const FARM_TYPES = [
  { value: 'crop', label: '🌾 Crop Farming', desc: 'Maize, rice, cassava, etc.' },
  { value: 'livestock', label: '🐄 Livestock', desc: 'Cattle, goats, poultry, etc.' },
  { value: 'mixed', label: '🌿 Mixed Farming', desc: 'Both crops and livestock' },
  { value: 'aquaculture', label: '🐟 Aquaculture', desc: 'Fish farming' },
];

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara'
];

export default function FarmerSetup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    location: '',
    farm_type: '',
    farm_size: '',
    farm_size_unit: 'hectares',
    phone: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.location || !form.farm_type || !form.farm_size) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await createFarmerProfile({ ...form, farm_size: parseFloat(form.farm_size) });
      toast.success('Farm profile created! 🌾');
      navigate('/farmer');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-primary-800">AgroSphere AI</span>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-primary-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-slide-up">
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Set up your farm</h1>
            <p className="text-gray-500 text-sm mb-6">Tell us about your farming operation</p>

            <div className="space-y-5">
              <div>
                <label className="label">Farm type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {FARM_TYPES.map(({ value, label, desc }) => (
                    <button key={value} type="button"
                      onClick={() => setForm({ ...form, farm_type: value })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${form.farm_type === value ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                      <div className={`font-semibold text-sm ${form.farm_type === value ? 'text-primary-700' : 'text-gray-700'}`}>{label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label"><MapPin className="w-4 h-4 inline mr-1" />State / Location *</label>
                <select className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
                  <option value="">Select your state</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="label"><Ruler className="w-4 h-4 inline mr-1" />Farm size *</label>
                <div className="flex gap-2">
                  <input type="number" className="input flex-1" placeholder="e.g. 2.5" min="0.1" step="0.1"
                    value={form.farm_size} onChange={e => setForm({ ...form, farm_size: e.target.value })} />
                  <select className="input w-32"
                    value={form.farm_size_unit} onChange={e => setForm({ ...form, farm_size_unit: e.target.value })}>
                    <option value="hectares">hectares</option>
                    <option value="acres">acres</option>
                    <option value="plots">plots</option>
                  </select>
                </div>
              </div>

              <button onClick={() => {
                if (!form.farm_type || !form.location || !form.farm_size) { toast.error('Fill required fields'); return; }
                setStep(2);
              }} className="btn-primary w-full flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Almost done!</h1>
            <p className="text-gray-500 text-sm mb-6">Add contact info to boost your credit score</p>

            <div className="space-y-5">
              <div>
                <label className="label"><Phone className="w-4 h-4 inline mr-1" />Phone number</label>
                <input type="tel" className="input" placeholder="+234 800 000 0000"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>

              <div>
                <label className="label"><FileText className="w-4 h-4 inline mr-1" />Farm description</label>
                <textarea className="input resize-none" rows={4}
                  placeholder="Tell lenders about your farm, experience, and what you grow..."
                  value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">A detailed bio increases your credit score</p>
              </div>

              <div className="card bg-primary-50 border-primary-100">
                <p className="text-xs font-semibold text-primary-700 mb-1">📊 Profile summary</p>
                <p className="text-xs text-primary-600">{form.farm_type} farm · {form.farm_size} {form.farm_size_unit} · {form.location}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Saving...' : 'Launch Farm 🚀'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
