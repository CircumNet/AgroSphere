import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sprout, Leaf, Beef, Wheat, Droplets, Trash2, TrendingUp, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { getMyProfile, getMyActivities, getMyCreditScore, deleteActivity } from '../services/api';
import Navbar from '../components/Navbar';
import CreditRing from '../components/CreditRing';
import WeatherWidget from '../components/WeatherWidget';
import LogActivityModal from '../components/LogActivityModal';

const ACTIVITY_ICONS = {
  planting: { icon: Sprout, color: 'bg-green-100 text-green-700' },
  feeding: { icon: Beef, color: 'bg-orange-100 text-orange-700' },
  harvesting: { icon: Wheat, color: 'bg-yellow-100 text-yellow-700' },
  watering: { icon: Droplets, color: 'bg-blue-100 text-blue-700' },
  fertilizing: { icon: Leaf, color: 'bg-lime-100 text-lime-700' },
  other: { icon: Plus, color: 'bg-gray-100 text-gray-600' },
};

function groupActivitiesByMonth(activities) {
  const counts = {};
  activities.forEach(a => {
    const month = a.date?.slice(0, 7);
    if (month) counts[month] = (counts[month] || 0) + 1;
  });
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      count
    }));
}

export default function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [creditData, setCreditData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = useCallback(async () => {
    try {
      const [profileRes, actRes, creditRes] = await Promise.allSettled([
        getMyProfile(), getMyActivities(), getMyCreditScore()
      ]);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
      else if (profileRes.reason?.response?.status === 404) { navigate('/farmer/setup'); return; }
      if (actRes.status === 'fulfilled') setActivities(actRes.value.data);
      if (creditRes.status === 'fulfilled') setCreditData(creditRes.value.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this activity?')) return;
    try {
      await deleteActivity(id);
      toast.success('Activity deleted');
      loadData();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading your farm...</p>
      </div>
    </div>
  );

  const displayedActivities = showAllActivities ? activities : activities.slice(0, 5);
  const chartData = groupActivitiesByMonth(activities);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Farmer Dashboard" />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Welcome */}
        <div className="animate-fade-in">
          <h1 className="font-display font-bold text-2xl text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          {profile && (
            <p className="text-sm text-gray-500 mt-1">
              {profile.farm_type} farm · {profile.farm_size} {profile.farm_size_unit} · {profile.location}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl border border-gray-100 p-1 gap-1">
          {['overview', 'activities', 'score'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab === 'score' ? '📊 Score' : tab === 'activities' ? '📋 Activities' : '🏠 Overview'}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fade-in">
            {/* Credit score card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-lg">Credit Score</h2>
                  <p className="text-xs text-gray-500">Based on your farm activity</p>
                </div>
                {creditData && <CreditRing score={creditData.score} size={90} />}
              </div>

              {creditData && (
                <>
                  {/* Score breakdown */}
                  <div className="space-y-2 mt-2">
                    {[
                      { label: 'Activity Volume', value: creditData.breakdown?.volume, max: 30 },
                      { label: 'Consistency', value: creditData.breakdown?.consistency, max: 30 },
                      { label: 'Activity Diversity', value: creditData.breakdown?.diversity, max: 20 },
                      { label: 'Profile Completeness', value: creditData.breakdown?.profile, max: 20 },
                    ].map(({ label, value, max }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{label}</span>
                          <span className="font-medium text-gray-700">{value}/{max}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full transition-all duration-700"
                            style={{ width: `${(value / max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  {creditData.recommendations?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {creditData.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 bg-primary-50 rounded-xl p-3">
                          <AlertCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-primary-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Activities', value: activities.length, color: 'text-primary-700 bg-primary-50' },
                { label: 'This month', value: activities.filter(a => a.date?.startsWith(new Date().toISOString().slice(0, 7))).length, color: 'text-blue-700 bg-blue-50' },
                { label: 'Farm size', value: profile ? `${profile.farm_size}${profile.farm_size_unit === 'hectares' ? 'ha' : profile.farm_size_unit === 'acres' ? 'ac' : 'pl'}` : '—', color: 'text-orange-700 bg-orange-50' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-2xl p-4 ${color}`}>
                  <p className="text-2xl font-display font-bold">{value}</p>
                  <p className="text-xs opacity-70 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Weather */}
            <WeatherWidget city={profile?.location?.toLowerCase() || 'lagos'} />

            {/* Activity chart */}
            {chartData.length > 1 && (
              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-600" /> Activity Trend
                </h3>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={chartData} barSize={28}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ACTIVITIES TAB */}
        {activeTab === 'activities' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-bold text-lg">Farm Ledger</h2>
              <span className="text-sm text-gray-500">{activities.length} total</span>
            </div>

            {activities.length === 0 ? (
              <div className="card text-center py-12">
                <Sprout className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-semibold text-gray-500">No activities yet</p>
                <p className="text-sm text-gray-400 mt-1">Log your first farm activity to start building credit</p>
              </div>
            ) : (
              <>
                {displayedActivities.map((activity) => {
                  const meta = ACTIVITY_ICONS[activity.activity_type] || ACTIVITY_ICONS.other;
                  const Icon = meta.icon;
                  return (
                    <div key={activity.id} className="card flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm capitalize text-gray-800">{activity.activity_type}</p>
                            {activity.description && <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>}
                            {activity.quantity && (
                              <p className="text-xs text-gray-400 mt-0.5">{activity.quantity} {activity.unit}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-400">{activity.date}</p>
                            <button onClick={() => handleDelete(activity.id)}
                              className="mt-1 text-red-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {activity.notes && (
                          <p className="text-xs text-gray-400 mt-1 italic">"{activity.notes}"</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {activities.length > 5 && (
                  <button onClick={() => setShowAllActivities(!showAllActivities)}
                    className="w-full text-center text-sm text-primary-600 font-medium py-3 flex items-center justify-center gap-1 hover:text-primary-700">
                    {showAllActivities ? <><ChevronUp className="w-4 h-4" /> Show less</> : <><ChevronDown className="w-4 h-4" /> Show all {activities.length} activities</>}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* SCORE TAB */}
        {activeTab === 'score' && creditData && (
          <div className="space-y-4 animate-fade-in">
            <div className="card flex flex-col items-center py-8">
              <CreditRing score={creditData.score} size={150} />
              <h2 className="font-display font-bold text-2xl mt-4">
                {creditData.score >= 70 ? 'Excellent Standing' : creditData.score >= 40 ? 'Building Credit' : 'Getting Started'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Your AgroSphere credit score</p>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4">Score Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Activity Volume', value: creditData.breakdown?.volume, max: 30, desc: 'More activities = higher score' },
                  { label: 'Consistency', value: creditData.breakdown?.consistency, max: 30, desc: 'Regular weekly logging' },
                  { label: 'Activity Diversity', value: creditData.breakdown?.diversity, max: 20, desc: 'Different types of activities' },
                  { label: 'Profile Completeness', value: creditData.breakdown?.profile, max: 20, desc: 'Fill in all profile fields' },
                ].map(({ label, value, max, desc }) => (
                  <div key={label}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      <span className="text-sm font-bold text-primary-700">{value}<span className="font-normal text-gray-400">/{max}</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-700"
                        style={{ width: `${(value / max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">💡 Recommendations</h3>
              <div className="space-y-2">
                {creditData.recommendations?.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                    <span className="text-primary-500 font-bold text-sm">{i + 1}.</span>
                    <p className="text-sm text-gray-600">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-lg shadow-primary-600/30 flex items-center justify-center transition-all active:scale-95 z-30">
        <Plus className="w-7 h-7" />
      </button>

      {showModal && <LogActivityModal onClose={() => setShowModal(false)} onSuccess={loadData} />}
    </div>
  );
}
