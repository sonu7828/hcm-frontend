import React, { useState, useEffect } from 'react';
import { superAdminAPI } from '../../utils/apiService';
import {
  BarChart2,
  TrendingUp,
  Activity,
  Cpu,
  Database,
  Globe,
  RefreshCw,
  Download,
  Calendar,
  Zap,
  Users,
  ShieldAlert,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../shared/components/layout/PageHeader';
import { StatCard } from './StatCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

  const GlobalAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [isSimulating, setIsSimulating] = useState(true);
  const [systemLoad, setSystemLoad] = useState(42.5);
  const [activeSockets, setActiveSockets] = useState(1240);
  const [latency, setLatency] = useState(24);
  const [showToast, setShowToast] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await superAdminAPI.getAnalytics(timeRange);
        if (response?.data?.success) {
          setStatsData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to fetch analytics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  // Live simulation tick for premium interactive feel
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSystemLoad(prev => {
        const change = (Math.random() - 0.5) * 4;
        return Math.max(10, Math.min(95, parseFloat((prev + change).toFixed(1))));
      });
      setActiveSockets(prev => {
        const change = Math.round((Math.random() - 0.5) * 20);
        return Math.max(100, prev + change);
      });
      setLatency(prev => {
        const change = Math.round((Math.random() - 0.5) * 4);
        return Math.max(10, Math.min(120, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const triggerExport = async () => {
    setShowToast(true);
    try {
      const response = await superAdminAPI.exportAnalytics(timeRange);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_export_${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export:', err);
    }
    setTimeout(() => setShowToast(false), 3000);
  };

  // Real database analytics stats
  const analyticsStats = [
    {
      label: 'New Platform Users',
      value: statsData?.newUsers || 0,
      sub: 'Joined in this period',
      icon: Users,
      color: 'from-violet-500 to-indigo-600',
      bg: 'bg-violet-50 dark:bg-violet-950/20',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-100 dark:border-violet-900/30'
    },
    {
      label: 'New Organizations',
      value: statsData?.newOrganizations || 0,
      sub: 'Tenant signups',
      icon: Globe,
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30'
    },
    {
      label: 'Ecosystem Jobs',
      value: statsData?.newJobs || 0,
      sub: 'Job posts created',
      icon: Activity,
      color: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/30'
    },
    {
      label: 'Support Tickets',
      value: statsData?.newTickets || 0,
      sub: 'Helpdesk requests',
      icon: ShieldAlert,
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30'
    }
  ];

  return (
    <motion.div
      className="space-y-8 w-full text-left"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-100 text-sm font-bold"
          >
            <Download className="text-amber-400" size={16} />
            <span>Compiling and downloading CSV report...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <PageHeader
        icon={BarChart2}
        title="Global Analytics Suite"
        subtitle="Platform-wide server loads, API telemetry, database efficiency, and ecosystem performance logs."
      >
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {['7d', '30d', '12m'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all ${
                timeRange === range
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <button
          onClick={triggerExport}
          className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-primary-200 dark:shadow-none"
        >
          <Download size={16} />
          <span>Export Analytics</span>
        </button>
      </PageHeader>

      {/* Analytics KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsStats.map((stat, idx) => (
          <StatCard
            key={idx}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            sub={stat.sub}
            style={stat}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Interactive Charts & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time System Load Chart - 2 Cols */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 p-6 shadow-soft flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-violet-600 animate-spin" style={{ animationDuration: '6s' }} />
              <h2 className="hcm-section-heading">
                Live Server Cluster Load
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isSimulating ? 'Live Streaming' : 'Paused'}
                </span>
              </div>
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 transition-all"
              >
                {isSimulating ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>

          {/* SVG Animated Sparkline representing load */}
          <div className="h-[220px] relative w-full flex items-end justify-center mb-4">
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between pointer-events-none opacity-20">
              <div className="w-full border-t border-dashed border-slate-400" />
              <div className="w-full border-t border-dashed border-slate-400" />
              <div className="w-full border-t border-dashed border-slate-400" />
            </div>
            
            {/* Visual Vector Grid Graph */}
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Dynamic simulated path based on current state */}
              <path
                d={`M 0 ${160 - systemLoad} Q 80 ${130 - systemLoad * 0.4} 150 ${145 - systemLoad * 0.8} T 300 ${180 - systemLoad * 1.2} T 420 ${100 - systemLoad * 0.6} T 500 ${190 - systemLoad}`}
                fill="url(#loadGradient)"
                stroke="#8b5cf6"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-[3000ms] ease-in-out"
              />
              <circle
                cx="500"
                cy={190 - systemLoad}
                r="6"
                fill="#8b5cf6"
                className="transition-all duration-[3000ms] ease-in-out animate-pulse"
              />
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/80">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average CPU Load</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1 transition-all">{systemLoad}%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kubernetes Nodes</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">24 Active</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peak Hour Latency</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">42ms</p>
            </div>
          </div>
        </motion.div>

        {/* System Health / Hubs list */}
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 p-6 shadow-soft flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Globe size={18} className="text-emerald-500 animate-pulse" />
              <h2 className="hcm-section-heading">
                Global Edge Regions
              </h2>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'US-East (Virginia)', lat: '12ms', status: 'Healthy', load: '48%' },
                { name: 'EU-West (Frankfurt)', lat: '28ms', status: 'Healthy', load: '65%' },
                { name: 'AP-South (Singapore)', lat: '36ms', status: 'Optimal', load: '32%' },
                { name: 'US-West (Oregon)', lat: '15ms', status: 'Healthy', load: '58%' },
                { name: 'SA-East (São Paulo)', lat: '52ms', status: 'Degraded', load: '84%', warning: true }
              ].map((hub, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{hub.name}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <span>Latency: {hub.lat}</span>
                      <span>•</span>
                      <span>Load: {hub.load}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${hub.warning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${hub.warning ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {hub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 dark:border-slate-800/80 text-xs font-bold text-slate-400 flex items-center gap-2">
            <ShieldAlert size={14} className="text-amber-500 animate-bounce" />
            <span>SA-East experiences transient cloud networking throttling.</span>
          </div>
        </motion.div>
      </div>

      {/* Module Utilization Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module Popularity */}
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="hcm-section-heading flex items-center gap-2">
              <Activity size={18} className="text-indigo-600" />
              Ecosystem Module Utilization
            </h3>
            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
              Monthly Active Use
            </span>
          </div>

          <div className="space-y-4">
            {[
              { module: 'Payroll Center & Billing', pct: '88%', width: 'w-[88%]', color: 'bg-violet-500' },
              { module: 'Time & Attendance Tracker', pct: '74%', width: 'w-[74%]', color: 'bg-emerald-500' },
              { module: 'AI Recruiter & Resume AI', pct: '62%', width: 'w-[62%]', color: 'bg-blue-500' },
              { module: 'Benefits & Health HCM', pct: '49%', width: 'w-[49%]', color: 'bg-amber-500' },
              { module: 'Compliance & Audits Center', pct: '38%', width: 'w-[38%]', color: 'bg-rose-500' }
            ].map((mod, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>{mod.module}</span>
                  <span>{mod.pct}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${mod.color} ${mod.width} transition-all duration-1000`} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security & Access Token Logs */}
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="hcm-section-heading flex items-center gap-2">
              <Users size={18} className="text-emerald-500" />
              API Key & System Audits
            </h3>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
              <Zap size={10} className="animate-pulse" /> 18 Active Keys
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Production JWT Sync Key', role: 'System Admin', scope: 'global:write', age: '2 hours ago' },
              { label: 'AI Engine Integration Key', role: 'Candidate Portal', scope: 'ai:generate', age: '4 hours ago' },
              { label: 'HR Webhook Webhook Key', role: 'Recruiting Service', scope: 'webhooks:post', age: '1 day ago' },
              { label: 'Payroll Export Token', role: 'Executive Financials', scope: 'billing:read', age: '3 days ago' }
            ].map((key, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-xs font-bold"
              >
                <div>
                  <p className="text-slate-700 dark:text-slate-200">{key.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Role: {key.role} • Scope: {key.scope}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">{key.age}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GlobalAnalytics;
