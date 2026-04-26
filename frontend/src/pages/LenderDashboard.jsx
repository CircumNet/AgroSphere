import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Users, TrendingUp, ChevronRight, MapPin, Sprout, Star } from 'lucide-react';
import { getAllFarmers } from '../services/api';
import Navbar from '../components/Navbar';
import CreditRing from '../components/CreditRing';
import toast from 'react-hot-toast';

const RISK_BADGE = {
  Low: 'badge-low',
  Medium: 'badge-medium',
  High: 'badge-high',
};

export default function LenderDashboard() {
  const [farmers, setFarmers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortBy, setSortBy] = useState('score_desc');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllFarmers()
      .then(res => { setFarmers(res.data); setFiltered(res.data); })
      .catch(() => toast.error('Failed to load farmers'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...farmers];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f =>
        f.full_name.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.farm_type.toLowerCase().includes(q)
      );
    }

    if (riskFilter !== 'All') {
      result = result.filter(f => f.risk_level === riskFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'score_desc') return b.credit_score - a.credit_score;
      if (sortBy === 'score_asc') return a.credit_score - b.credit_score;
      if (sortBy === 'activity_desc') return b.activity_count - a.activity_count;
      if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
      return 0;
    });

    setFiltered(result);
  }, [search, riskFilter, sortBy, farmers]);

  const stats = {
    total: farmers.length,
    low: farmers.filter(f => f.risk_level === 'Low').length,
    medium: farmers.filter(f => f.risk_level === 'Medium').length,
    high: farmers.filter(f => f.risk_level === 'High').length,
    avgScore: farmers.length ? Math.round(farmers.reduce((a, f) => a + f.credit_score, 0) / farmers.length) : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Lender Dashboard" />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="font-display font-bold text-2xl text-gray-900">Farmer Portfolio</h1>
          <p className="text-gray-500 text-sm mt-1">Discover creditworthy farmers for financing</p>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
          {[
            { label: 'Total Farmers', value: stats.total, icon: Users, color: 'text-blue-700 bg-blue-50' },
            { label: 'Avg Score', value: stats.avgScore, icon: TrendingUp, color: 'text-primary-700 bg-primary-50' },
            { label: 'Low Risk', value: stats.low, icon: Star, color: 'text-green-700 bg-green-50' },
            { label: 'High Risk', value: stats.high, icon: SlidersHorizontal, color: 'text-red-700 bg-red-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-2xl p-4 ${color}`}>
              <Icon className="w-5 h-5 opacity-70 mb-2" />
              <p className="text-2xl font-display font-bold">{value}</p>
              <p className="text-xs opacity-70">{label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search farmers, location, farm type..."
                className="input pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${showFilters ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:block">Filter</span>
            </button>
          </div>

          {showFilters && (
            <div className="card space-y-4 animate-slide-up">
              <div>
                <label className="label">Risk Level</label>
                <div className="flex gap-2 flex-wrap">
                  {['All', 'Low', 'Medium', 'High'].map(r => (
                    <button key={r} onClick={() => setRiskFilter(r)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${riskFilter === r ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Sort by</label>
                <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="score_desc">Highest Score First</option>
                  <option value="score_asc">Lowest Score First</option>
                  <option value="activity_desc">Most Active First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Farmer list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No farmers found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">{filtered.length} farmer{filtered.length !== 1 ? 's' : ''}</p>
            {filtered.map((farmer, idx) => (
              <div key={farmer.id}
                onClick={() => navigate(`/lender/farmer/${farmer.id}`)}
                className="card flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-primary-100 transition-all group animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}>

                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">{farmer.full_name[0]}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{farmer.full_name}</p>
                    <span className={RISK_BADGE[farmer.risk_level]}>{farmer.risk_level} Risk</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{farmer.location}</span>
                    <span className="flex items-center gap-1"><Sprout className="w-3 h-3" />{farmer.farm_type} · {farmer.farm_size} {farmer.farm_size_unit}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{farmer.activity_count} activities logged</p>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2">
                  <CreditRing score={farmer.credit_score} size={56} />
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
