import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Activity, LayoutDashboard, Home as HomeIcon, Globe } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
                Clinical<span className="text-blue-500">Risk</span> AI
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                <HomeIcon size={18} />
                <span>Home</span>
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <a href="#" className="p-2 text-slate-400 hover:text-white transition-colors">
                <Globe size={20} />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Activity className="text-blue-500 w-4 h-4" />
            <span className="text-sm font-bold text-slate-300">Neuro-Fuzzy Stratification System</span>
          </div>
          <p className="text-slate-500 text-xs uppercase tracking-widest">
            © 2026 ClinicalRisk AI • Advanced Decision Support v2.1
          </p>
        </div>
      </footer>
    </div>
  );
}
