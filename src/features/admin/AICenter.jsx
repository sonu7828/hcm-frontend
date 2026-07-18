import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
   Zap, Brain, Cpu, Search, Target, TrendingUp, MessageSquare, ShieldCheck,
   Settings, Activity, Play, BarChart3, Lightbulb, Sparkles, Bot, Terminal,
   Database, ArrowUpRight, MoreVertical, CheckCircle2, Sliders, PlayCircle
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';
import AIModuleModal from '../../shared/components/admin/AIModuleModal';
import TrainModelsModal from '../../shared/components/admin/TrainModelsModal';
import LogsDrawer from '../../shared/components/admin/LogsDrawer';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';

const AICenter = () => {
   const { aiModules, aiLogs, updateAiModule, showToast, addAiLog } = useAdmin();
   const [isTrainOpen, setIsTrainOpen] = useState(false);
   const [isLogsOpen, setIsLogsOpen] = useState(false);
   const [moduleToEdit, setModuleToEdit] = useState(null);

   const visualMap = {
      'Resume Screening': { icon: Search, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
      'Attrition Prediction': { icon: TrendingUp, color: 'text-rose-600 dark:text-rose-455', bg: 'bg-rose-50 dark:bg-rose-950/30' },
      'Smart Hiring Suggestions': { icon: Target, color: 'text-emerald-600 dark:text-emerald-450', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
      'AI Chat Assistant': { icon: MessageSquare, color: 'text-primary-600 dark:text-primary-450', bg: 'bg-primary-50 dark:bg-primary-950/30' },
      'Performance Insights': { icon: BarChart3, color: 'text-amber-600 dark:text-amber-450', bg: 'bg-amber-50 dark:bg-amber-950/30' },
      'Automated Job Posting': { icon: Lightbulb, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
   };

   // Stats calculations
   const stats = useMemo(() => {
      const totalModules = aiModules.length;
      const activeModules = aiModules.filter(m => m.status === 'Active').length;
      const avgPrecision = totalModules > 0 
         ? Math.round(aiModules.reduce((acc, m) => acc + m.confidence, 0) / totalModules)
         : 0;

      return [
         { label: 'Total AI Modules', value: totalModules, icon: Cpu, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
         { label: 'Active Automations', value: activeModules, icon: Zap, color: 'text-emerald-600 dark:text-emerald-450', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
         { label: 'Average Precision', value: `${avgPrecision}%`, icon: Target, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
      ];
   }, [aiModules]);

   const handleTestModule = (name) => {
      addAiLog({ label: `Triggered inference test run for: ${name}`, type: 'In Progress' });
      showToast(`Test run initiated for ${name}`);
      setTimeout(() => {
         addAiLog({ label: `Successfully completed inference for ${name}`, type: 'Success' });
         showToast(`Inference test succeeded for ${name}`);
      }, 2500);
   };

   return (
      <div className="space-y-6 sm:space-y-8 pb-12 animate-fade-in focus:outline-none">
         {/* Header */}
         <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-1.5 bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded-lg">
                        <Brain size={20} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 dark:text-primary-400">Enterprise AI Engine</span>
                  </div>
                  <h1 className="hcm-page-title">AI Center</h1>
                  <p className="hcm-page-subtitle">Manage and configure AI-powered automation across your HCM ecosystem</p>
               </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
               <button onClick={() => showToast('System Health checks passed. All models online.')} className="btn-secondary px-4 py-2.5 font-bold flex items-center gap-2 text-sm">
                  <Activity size={16} />
                  <span>System Health</span>
               </button>
               <button onClick={() => setIsLogsOpen(true)} className="btn-secondary px-4 py-2.5 font-bold flex items-center gap-2 text-sm">
                  <Terminal size={16} />
                  <span>View Logs</span>
               </button>
               <button onClick={() => setIsTrainOpen(true)} className="btn-primary px-5 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 text-sm">
                  <Bot size={16} fill="currentColor" />
                  <span>Train Models</span>
               </button>
            </div>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat, idx) => (
               <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="card p-4 sm:p-6"
               >
                  <div className="flex items-center gap-4">
                     <div className={cn("p-3 rounded-2xl shrink-0", stat.bg, stat.color)}>
                        <stat.icon size={24} />
                     </div>
                     <div>
                        <p className="card-title mb-1.5">{stat.label}</p>
                        <h3 className="card-value">{stat.value}</h3>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>

         <div className="space-y-6">
            {/* Section Title */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
               <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">Cognitive Automation Modules</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Activate and parameterize specialized model weights</p>
               </div>
            </div>

            {/* AI Module Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
               {aiModules.map((mod, idx) => {
                  const visuals = visualMap[mod.name] || { icon: Bot, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/40' };
                  const Icon = visuals.icon;
                  return (
                     <motion.div
                        key={mod.id}
                        whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.05)' }}
                        className="card p-4 sm:p-6 flex flex-col h-full bg-white dark:bg-slate-900 border-none shadow-soft"
                     >
                        <div className="flex items-start justify-between mb-5">
                           <div className={cn("p-2.5 rounded-xl group-hover:scale-105 transition-transform shrink-0", visuals.bg, visuals.color)}>
                              <Icon size={22} />
                           </div>
                           <div className="flex flex-col items-end">
                              <div className={cn(
                                 "px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border mb-2 transition-colors",
                                 mod.status === 'Active' 
                                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/30" 
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-450 dark:text-slate-500 border-slate-100 dark:border-slate-800"
                              )}>
                                 {mod.status}
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{mod.confidence}% Precision</p>
                           </div>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">{mod.name}</h3>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-550 leading-relaxed flex-1">{mod.desc}</p>
                        
                        <div className="mt-6 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/60 pt-4 shrink-0">
                           <button onClick={() => setModuleToEdit(mod)} className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-widest flex items-center gap-2 group/btn hover:text-primary-700 dark:hover:text-primary-300">
                              Configure Rules <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                           </button>
                           <ActionDropdown
                              actions={[
                                 { label: 'Configure Rules', icon: Sliders, onClick: () => setModuleToEdit(mod) },
                                 { label: mod.status === 'Active' ? 'Disable Module' : 'Enable Module', icon: Activity, onClick: () => updateAiModule(mod.id, { status: mod.status === 'Active' ? 'Inactive' : 'Active' }) },
                                 { label: 'View Analytics', icon: BarChart3, onClick: () => showToast(`Analytics loaded for ${mod.name}`) },
                                 { label: 'Run Inference Test', icon: PlayCircle, onClick: () => handleTestModule(mod.name) }
                              ]}
                           />
                        </div>
                     </motion.div>
                  )
               })}
            </div>
         </div>

         {/* Modals & Drawers */}
         <AIModuleModal
            isOpen={!!moduleToEdit}
            onClose={() => setModuleToEdit(null)}
            module={moduleToEdit}
         />

         <TrainModelsModal
            isOpen={isTrainOpen}
            onClose={() => setIsTrainOpen(false)}
         />

         <LogsDrawer
            isOpen={isLogsOpen}
            onClose={() => setIsLogsOpen(false)}
         />
      </div>
   );
};

export default AICenter;
