import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Sprout, Leaf, Beef, Wheat, Droplets, Plus, Mail, Calendar, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getFarmerById, getCreditScore } from '../services/api';
import Navbar from '../components/Navbar';
import CreditRing from '../components/CreditRing';
import toast from 'react-hot-toast';

const ACTIVITY_ICONS = {
  planting: { icon: Sprout, color: 'bg-green-100 text-green-700' },
  feeding: { icon: Beef, color: 'bg-orange-100 text-orange-700' },
  harvesting: { icon: Wheat, color: 'bg-yellow-100 text-yellow-700' },
  watering: { icon: Droplets, color: 'bg-blue-100 text-blue-700' },
  fertilizing: { icon: Leaf, color: 'bg-lime-100 text-lime-700' },
  other: { icon: Plus, color: 'bg-gray-100 text-gray-600' },
};

const PIE_COLORS = ['#16a34a', '#f97316', '#eab308', '#3b82f6', '#84cc16', '#9ca3af'];

function getActivityDistribution(activities) {
  const counts = {};
  activities.forEach(a => {
    counts[a.activity_type] = (counts[a.activity_type] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export default function FarmerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [creditData, setCreditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([getFarmerById(id), getCreditScore(id)])
      .then(([farmerRes, creditRes]) => {
        setFarmer(farmerRes.data);
        setCreditData(creditRes.data);
      })
      .catch(() => toast.error('Failed to load farmer data'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!farmer) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="font-semibold text-gray-600">Farmer not found</p>
        <button onClick={() => navigate('/lender')} className="btn-primary mt-4">Back to Dashboard</button>
      </div>
    </div>
  );

  const activityDist = getActivityDistribution(farmer.activities || []);
  const riskColor = { Low: 'bg-green-100 text-green-700', Medium: 'bg-yellow-100 text-yellow-700', High: 'bg-red-100 text-red-700' };

  // Monthly activity chart
  const monthlyData = (() => {
    const counts = {};
    (farmer.activities || []).forEach(a => {
      const month = a.date?.slice(0, 7);
      if (month) counts[month] = (counts[month] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
        count
      }));
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Farmer Profile" />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Back */}
        <button onClick={() => navigate('/lender')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to all farmers
        </button>

        {/* Profile card */}
        <div className="card animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-700 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">{farmer.full_name?.[0]}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-xl text-gray-900">{farmer.full_name}</h1>
                {creditData && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskColor[creditData.risk_level]}`}>
                    {creditData.risk_level} Risk
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{farmer.email}</span>
                {farmer.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{farmer.phone}</span>}
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{farmer.location}</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Sprout className="w-3 h-3" />{farmer.farm_type} farming</span>
                <span>{farmer.farm_size} {farmer.farm_size_unit}</span>
              </div>
              {farmer.bio && <p className="text-sm text-gray-600 mt-2 italic">"{farmer.bio}"</p>}
            </div>
            {creditData && <CreditRing score={creditData.score} size={80} />}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl border border-gray-100 p-1 gap-1">
          {['overview', 'activities', 'analytics'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab === 'overview' ? '📊 Overview' : tab === 'activities' ? '📋 Activities' : '📈 Analytics'}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && creditData && (
          <div className="space-y-4 animate-fade-in">
            {/* Score breakdown */}
            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-primary-600" /> Credit Analysis</h2>
              <div className="space-y-3">
                {[
                  { label: 'Activity Volume', value: creditData.breakdown?.volume, max: 30 },
                  { label: 'Consistency', value: creditData.breakdown?.consistency, max: 30 },
                  { label: 'Activity Diversity', value: creditData.breakdown?.diversity, max: 20 },
                  { label: 'Profile Completeness', value: creditData.breakdown?.profile, max: 20 },
                ].map(({ label, value, max }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-800">{value}/{max}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all"
                        style={{ width: `${(value / max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Activities', value: farmer.activities?.length || 0, color: 'text-primary-700 bg-primary-50' },
                { label: 'Credit Score', value: creditData.score, color: creditData.score >= 70 ? 'text-green-700 bg-green-50' : creditData.score >= 40 ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50' },
                { label: 'Farm Size', value: `${farmer.farm_size}${farmer.farm_size_unit === 'hectares' ? 'ha' : 'ac'}`, color: 'text-blue-700 bg-blue-50' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-2xl p-4 ${color}`}>
                  <p className="text-2xl font-display font-bold">{value}</p>
                  <p className="text-xs opacity-70 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Recommendation for lender */}
            <div className={`card border-l-4 ${creditData.risk_level === 'Low' ? 'border-l-green-500 bg-green-50' : creditData.risk_level === 'Medium' ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-red-500 bg-red-50'}`}>
              <p className={`font-semibold text-sm ${creditData.risk_level === 'Low' ? 'text-green-800' : creditData.risk_level === 'Medium' ? 'text-yellow-800' : 'text-red-800'}`}>
                {creditData.risk_level === 'Low' ? '✅ Recommended for financing' : creditData.risk_level === 'Medium' ? '⚠️ Consider with conditions' : '❌ High risk — requires review'}
              </p>
              <p className={`text-xs mt-1 ${creditData.risk_level === 'Low' ? 'text-green-700' : creditData.risk_level === 'Medium' ? 'text-yellow-700' : 'text-red-700'}`}>
                {creditData.risk_level === 'Low' ? 'This farmer demonstrates consistent activity and a strong farm profile.' : creditData.risk_level === 'Medium' ? 'This farmer is building their track record. Request additional documentation.' : 'Limited farm activity history. Encourage more consistent logging before financing.'}
              </p>
            </div>
          </div>
        )}

        {/* ACTIVITIES */}
        {activeTab === 'activities' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex justify-between">
              <h2 className="font-semibold text-gray-800">Activity Log</h2>
              <span className="text-sm text-gray-400">{farmer.activities?.length} records</span>
            </div>
            {!farmer.activities?.length ? (
              <div className="card text-center py-10">
                <Sprout className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No activities recorded yet</p>
              </div>
            ) : farmer.activities.map((activity) => {
              const meta = ACTIVITY_ICONS[activity.activity_type] || ACTIVITY_ICONS.other;
              const Icon = meta.icon;
              return (
                <div key={activity.id} className="card flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm capitalize text-gray-800">{activity.activity_type}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" /> {activity.date}
                      </div>
                    </div>
                    {activity.description && <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>}
                    {activity.quantity && <p className="text-xs text-gray-400">{activity.quantity} {activity.unit}</p>}
                    {activity.notes && <p className="text-xs text-gray-400 italic mt-1">"{activity.notes}"</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 animate-fade-in">
            {monthlyData.length > 1 && (
              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-4">Monthly Activity</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={monthlyData} barSize={28}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activityDist.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-4">Activity Mix</h3>
                <div className="flex items-center gap-4">
                  <PieChart width={120} height={120}>
                    <Pie data={activityDist} cx={55} cy={55} innerRadius={30} outerRadius={55} dataKey="value">
                      {activityDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                  <div className="space-y-1.5">
                    {activityDist.map(({ name, value }, i) => (
                      <div key={name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="capitalize text-gray-600">{name}</span>
                        <span className="font-semibold text-gray-800 ml-auto">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-3">Lender Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Farmer has logged <strong>{farmer.activities?.length}</strong> activities total</p>
                <p>• Primary farm type: <strong>{farmer.farm_type}</strong></p>
                <p>• Farm size: <strong>{farmer.farm_size} {farmer.farm_size_unit}</strong> in {farmer.location}</p>
                <p>• Credit score: <strong className={creditData?.risk_level === 'Low' ? 'text-green-600' : creditData?.risk_level === 'Medium' ? 'text-yellow-600' : 'text-red-600'}>{creditData?.score}/100 ({creditData?.risk_level} Risk)</strong></p>
                {farmer.activities?.length > 0 && (
                  <p>• Most recent activity: <strong>{farmer.activities[0]?.date}</strong></p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
