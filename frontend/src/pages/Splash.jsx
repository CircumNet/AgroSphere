import { Link } from 'react-router-dom';
import { Sprout, TrendingUp, Shield, CloudRain } from 'lucide-react';

export default function Splash() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 pt-8">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
            <Sprout className="w-5 h-5 text-primary-700" />
          </div>
          <span className="font-display font-bold text-white text-lg">AgroSphere AI</span>
        </div>
        <Link to="/login" className="text-primary-200 text-sm font-medium hover:text-white transition-colors">Sign in</Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mb-6 animate-pulse-slow">
          <Sprout className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-4 leading-tight">
          Smart Credit<br />for Every Farmer
        </h1>
        <p className="text-primary-200 text-lg mb-10 max-w-sm">
          Log your farm activities. Build your credit score. Unlock financial access.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link to="/register" className="btn-primary text-center bg-white text-primary-700 hover:bg-primary-50">
            Get Started Free
          </Link>
          <Link to="/login" className="btn-secondary text-center border-white text-white hover:bg-white/10">
            I have an account
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mt-12 w-full max-w-sm">
          {[
            { icon: TrendingUp, title: "Credit Scoring", desc: "AI-powered farm score" },
            { icon: CloudRain, title: "Weather Alerts", desc: "Real-time insights" },
            { icon: Shield, title: "Secure & Safe", desc: "Your data protected" },
            { icon: Sprout, title: "Farm Ledger", desc: "Digital activity log" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-left">
              <Icon className="w-5 h-5 text-primary-200 mb-2" />
              <div className="text-white font-semibold text-sm">{title}</div>
              <div className="text-primary-300 text-xs">{desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-primary-400 text-xs pb-6">
        Built for farmers across Africa 🌍
      </footer>
    </div>
  );
}
