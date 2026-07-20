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
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all ${timeRange === range
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
              { module: 'Payroll Center & Billing', pct: `${statsData?.moduleUtilization?.payroll || 0}%`, width: `${statsData?.moduleUtilization?.payroll || 0}%`, color: 'bg-violet-500' },
              { module: 'Time & Attendance Tracker', pct: `${statsData?.moduleUtilization?.attendance || 0}%`, width: `${statsData?.moduleUtilization?.attendance || 0}%`, color: 'bg-emerald-500' },
              { module: 'AI Recruiter & Resume AI', pct: `${statsData?.moduleUtilization?.ai || 0}%`, width: `${statsData?.moduleUtilization?.ai || 0}%`, color: 'bg-blue-500' },
              { module: 'Benefits & Health HCM', pct: `${statsData?.moduleUtilization?.benefits || 0}%`, width: `${statsData?.moduleUtilization?.benefits || 0}%`, color: 'bg-amber-500' },
              { module: 'Compliance & Audits Center', pct: `${statsData?.moduleUtilization?.compliance || 0}%`, width: `${statsData?.moduleUtilization?.compliance || 0}%`, color: 'bg-rose-500' }
            ].map((mod, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>{mod.module}</span>
                  <span>{mod.pct}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${mod.color} transition-all duration-1000`} style={{ width: mod.width }} />
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
              System Audits
            </h3>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
              <Zap size={10} className="animate-pulse" /> Live Logs
            </span>
          </div>

          <div className="space-y-3">
            {statsData?.recentAudits?.map((audit, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-xs font-bold"
              >
                <div>
                  <p className="text-slate-700 dark:text-slate-200">{audit.action}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={audit.details}>Role: {audit.user?.role || 'SYSTEM'} • {audit.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {new Date(audit.createdAt).toLocaleDateString()}
                </span>
              </div>
            )) || <p className="text-sm text-slate-500">No recent audits found.</p>}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GlobalAnalytics;
