import React, { useState, useMemo, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Loader2, RefreshCw } from 'lucide-react';

// modular imports
import InputPanel from '../components/InputPanel';
import RiskDisplay from '../components/RiskDisplay';
import RadarProfile from '../components/RadarProfile';
import FuzzificationChart from '../components/FuzzificationChart';
import PopulationScatter from '../components/PopulationScatter';
import RuleLog from '../components/RuleLog';

// --- Utility: Fuzzy Logic Helpers ---
const trimf = (x, a, b, c) => {
  if (x <= a || x >= c) return 0;
  if (x <= b) return (x - a) / (b - a);
  return (c - x) / (c - b);
};

const generateFuzzyData = (min, max, sets) => {
  const data = [];
  const step = (max - min) / 60;
  for (let x = min; x <= max; x += step) {
    const point = { x: Math.round(x) };
    Object.keys(sets).forEach(key => {
      point[key] = trimf(x, ...sets[key]);
    });
    data.push(point);
  }
  return data;
};

// --- Static Constants ---
const HEALTHY_BASELINE = { age: 30, blood_pressure: 120, cholesterol: 190 };

const INITIAL_FUZZY_SETS = {
  blood_pressure: { Low: [90, 90, 130], Medium: [110, 135, 160], High: [140, 160, 200] },
  age: { Low: [20, 20, 55], Medium: [40, 60, 80], High: [65, 100, 100] },
  cholesterol: { Low: [100, 100, 220], Medium: [200, 250, 300], High: [280, 400, 400] },
  risk_score: { Low: [0, 0, 50], Medium: [25, 50, 75], High: [50, 100, 100] }
};

const POPULATION_DATA = Array.from({ length: 30 }, (_, i) => {
  const bp = 90 + Math.random() * 110;
  const chol = 100 + Math.random() * 300;
  return {
    blood_pressure: Math.round(bp),
    cholesterol: Math.round(chol),
    isHighRisk: bp > 155 || chol > 270
  };
});

export default function Dashboard() {
  const [vitals, setVitals] = useState({ age: 55, blood_pressure: 130, cholesterol: 220 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('blood_pressure');
  const [fuzzySets, setFuzzySets] = useState(INITIAL_FUZZY_SETS);

  const handleVitalsChange = (name, value) => {
    setVitals(prev => ({ ...prev, [name]: value }));
  };

  const analyzeRisk = async () => {
    setLoading(true);
    const toastId = toast.loading('Consulting inference engine...');
    
    try {
      const response = await fetch('http://localhost:8000/predict-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitals)
      });
      
      if (!response.ok) throw new Error('Engine Offline');
      
      const data = await response.json();
      setResult(data);
      
      // Update fuzzy sets if the backend provides dynamically learned parameters
      if (data.membership_parameters && data.membership_parameters.length === 27) {
        const p = data.membership_parameters;
        setFuzzySets({
          age: { Low: p.slice(0,3), Medium: p.slice(3,6), High: p.slice(6,9) },
          blood_pressure: { Low: p.slice(9,12), Medium: p.slice(12,15), High: p.slice(15,18) },
          cholesterol: { Low: p.slice(18,21), Medium: p.slice(21,24), High: p.slice(24,27) },
          risk_score: INITIAL_FUZZY_SETS.risk_score // Output is static
        });
      }
      
      toast.success('Risk Assessment Completed', { id: toastId });
    } catch (error) {
      console.error("Error analyzing risk:", error);
      toast.error('Error: Inference Engine Offline', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Run initial inference
  useEffect(() => {
    analyzeRisk();
  }, []);

  const fuzzyChartData = useMemo(() => {
    const ranges = { age: [20, 100], blood_pressure: [90, 200], cholesterol: [100, 400], risk_score: [0, 100] };
    const [min, max] = ranges[activeTab];
    return generateFuzzyData(min, max, fuzzySets[activeTab]);
  }, [activeTab, fuzzySets]);

  const radarData = useMemo(() => [
    { subject: 'Age', A: vitals.age, B: HEALTHY_BASELINE.age },
    { subject: 'BP', A: vitals.blood_pressure, B: HEALTHY_BASELINE.blood_pressure },
    { subject: 'Chol', A: vitals.cholesterol, B: HEALTHY_BASELINE.cholesterol },
  ], [vitals]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" reverseOrder={false} toastOptions={{
        style: { background: '#0f172a', color: '#fff', border: '1px solid #1e293b', fontSize: '13px' }
      }} />

      <motion.header 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Clinical Risk Dashboard</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ANFIS Model v2.1 • Real-time Processing
            </p>
          </div>
        </div>
        <button 
          onClick={analyzeRisk}
          disabled={loading}
          className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh Inference
        </button>
      </motion.header>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        
        {/* --- LEFT COL: Patient Inputs (3/12) --- */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="lg:col-span-3">
          <InputPanel 
            vitals={vitals} 
            onChange={handleVitalsChange} 
            onPredict={analyzeRisk} 
            loading={loading} 
          />
        </motion.div>

        {/* --- RIGHT COL: Visual Analytics (9/12) --- */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Top Row: Primary Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <RiskDisplay result={result} />
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <RadarProfile data={radarData} />
            </motion.div>
          </div>

          {/* Middle Row: Logic Visualization */}
          <motion.div 
            variants={cardVariants} 
            initial="hidden" 
            animate="visible" 
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
               {/* Tab Switcher Overlay */}
               <div className="flex flex-wrap gap-2 mb-6 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-fit z-10">
                {Object.keys(fuzzySets).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      activeTab === tab 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>
              
              <div className="h-[24rem]">
                <FuzzificationChart 
                  data={fuzzyChartData} 
                  activeTab={activeTab} 
                  vitals={vitals} 
                  result={result} 
                />
              </div>
            </div>
          </motion.div>

          {/* Bottom Row: Context & Logs */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <PopulationScatter 
                data={POPULATION_DATA} 
                currentPatient={{ blood_pressure: vitals.blood_pressure, cholesterol: vitals.cholesterol, isHighRisk: (result?.crisp_risk_score || 0) > 70 }} 
              />
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
              <RuleLog rules={result?.triggered_rules} />
            </motion.div>
          </div>

        </div>
      </div>
      
      {/* Skeleton Loading Overlay (Advanced UI Polish) */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[60] pointer-events-none flex items-center justify-center"
          >
            <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border-b-4 border-b-blue-600">
              <Loader2 className="text-blue-500 animate-spin w-10 h-10" />
              <div className="text-center">
                <p className="text-blue-400 font-black tracking-[0.2em] text-[10px] uppercase mb-1">Inference in Progress</p>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest animate-pulse">Computing Centroid Defuzzification...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
