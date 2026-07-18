import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Download, User, X, ExternalLink, MapPin, Mail, Phone, Calendar, Loader2, ArrowRight, Eye, CheckCircle2, XCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useHR } from '../../context/HRContext';
import { useAdmin } from '../../context/AdminContext';

const STAGES_CONFIG = [
  { id: 'Applied', label: 'Applied', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  { id: 'Screening', label: 'Screening', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' },
  { id: 'Shortlisted', label: 'Shortlisted', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' },
  { id: 'Interview', label: 'Interview', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' },
  { id: 'Offer', label: 'Offer', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' },
  { id: 'Hired', label: 'Hired', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' },
];

const HiringPipeline = () => {
  const { candidates, moveCandidateStage, showToast, interviews = [], offers = [] } = useHR();
  const { users } = useAdmin();
  const navigate = useNavigate();

  const [activeCandidate, setActiveCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Dynamic roles filter based on available candidates
  const uniqueRoles = useMemo(() => {
    const roles = new Set(candidates.map(c => c.role).filter(Boolean));
    return Array.from(roles).sort();
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.role?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = filterRole ? c.role === filterRole : true;
      const matchStage = filterStage ? c.stage === filterStage : c.stage !== 'Rejected';
      return matchSearch && matchRole && matchStage;
    });
  }, [candidates, searchTerm, filterRole, filterStage]);

  const handleExportPipeline = () => {
    setIsExporting(true);
    showToast('Compiling recruitment funnel data...', 'info');
    setTimeout(() => {
      try {
        const headers = ['Candidate Name', 'Target Role', 'Current Pipeline Stage', 'AI Match Rating', 'Experience'];
        const rows = candidates
          .filter(c => c.stage !== 'Rejected')
          .map(c => [
            `"${c.name}"`,
            `"${c.role}"`,
            `"${c.stage}"`,
            `"${c.match}%"`,
            `"${c.exp || 'N/A'}"`
          ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `hiring_pipeline_funnel_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Pipeline data exported successfully!', 'success');
      } catch (err) {
        showToast('Error exporting pipeline data', 'error');
      } finally {
        setIsExporting(false);
      }
    }, 1500);
  };

  const isInterviewCompleted = (cand) => {
    const candidateInterviews = interviews.filter(i => i.applicationId === cand.id || i.candidate === cand.name);
    if (candidateInterviews.length === 0) return false;
    return candidateInterviews.some(i => i.status === 'Completed');
  };

  const isOfferAccepted = (cand) => {
    const candidateOffers = offers.filter(o => o.applicationId === cand.id || o.candidate === cand.name);
    if (candidateOffers.length === 0) return false;
    return candidateOffers.some(o => o.status === 'Accepted');
  };

  const isNextButtonDisabled = (cand) => {
    if (cand.stage === 'Interview' && !isInterviewCompleted(cand)) return true;
    if (cand.stage === 'Offer' && !isOfferAccepted(cand)) return true;
    return false;
  };

  const getNextButtonText = (cand) => {
    if (cand.stage === 'Interview' && !isInterviewCompleted(cand)) return 'Interview Pending';
    if (cand.stage === 'Offer' && !isOfferAccepted(cand)) return 'Offer Pending';
    return 'Move to Next Stage';
  };

  const moveNextStage = (cand, fromListView = false) => {
    const currentIndex = STAGES_CONFIG.findIndex(s => s.id === cand.stage);
    if (currentIndex < STAGES_CONFIG.length - 1) {
      const nextStage = STAGES_CONFIG[currentIndex + 1].id;
      moveCandidateStage(cand.id, nextStage);
      
      // Only update modal if it's already open, or if this action came from inside the modal
      if (!fromListView || activeCandidate?.id === cand.id) {
        setActiveCandidate({ ...cand, stage: nextStage });
      }
    }
  };

  const rejectCandidate = (cand) => {
    moveCandidateStage(cand.id, 'Rejected');
    if (activeCandidate?.id === cand.id) {
       setActiveCandidate(null);
    }
  };

  const getStageColor = (stageId) => {
    const stage = STAGES_CONFIG.find(s => s.id === stageId);
    return stage ? stage.color : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="hcm-page-title">Hiring Pipeline</h1>
          <p className="hcm-page-subtitle">Track and manage candidates in a list view</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPipeline}
            disabled={isExporting}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span className="hidden sm:inline">Export Pipeline</span>
          </button>
          <button onClick={() => navigate('/hr/candidates', { state: { openCreate: true } })} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20">
            <Plus size={16} />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col md:flex-row items-center gap-4 shrink-0">
        <div className="relative flex-1 w-full text-slate-400 dark:text-slate-550">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
          <input
            type="text"
            placeholder="Search candidate by name or role..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-10 h-11 w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            className="input-field h-11 w-full sm:w-44 font-bold dark:bg-slate-900"
          >
            <option value="">All Stages (Active)</option>
            {STAGES_CONFIG.map(stage => (
              <option key={stage.id} value={stage.id}>{stage.label}</option>
            ))}
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="input-field h-11 w-full sm:w-44 font-bold dark:bg-slate-900"
          >
            <option value="">All Roles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List View Data Table */}
      <div className="card p-0 overflow-hidden border-none shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Candidate</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Stage</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">AI Match</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden md:table-cell">Interviewers</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    No candidates found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => (
                  <motion.tr
                    key={cand.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={cand.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&background=random`}
                          alt={cand.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{cand.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{cand.email || 'No email provided'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{cand.role}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{cand.exp ? `${cand.exp} Exp` : 'Exp N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-transparent", getStageColor(cand.stage))}>
                        {cand.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 w-24">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", cand.match > 85 ? "bg-emerald-500" : cand.match > 70 ? "bg-amber-500" : "bg-rose-500")}
                            style={{ width: `${cand.match}%` }}
                          />
                        </div>
                        <span className={cn("text-xs font-bold", cand.match > 85 ? "text-emerald-600 dark:text-emerald-400" : cand.match > 70 ? "text-amber-600 dark:text-amber-400" : "text-rose-500")}>
                          {cand.match}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {(cand.interviewers || []).slice(0, 3).map((name, idx) => {
                          const member = users.find(u => u.name === name) || {};
                          const initials = name.split(' ').map(n => n[0]).join('');
                          return (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-700 dark:text-slate-300 uppercase overflow-hidden"
                              title={name}
                            >
                              {member.img ? (
                                <img src={member.img} alt={name} className="w-full h-full object-cover" />
                              ) : (
                                initials
                              )}
                            </div>
                          );
                        })}
                        {(!cand.interviewers || cand.interviewers.length === 0) && (
                          <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveCandidate(cand)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {cand.stage !== 'Rejected' && cand.stage !== 'Hired' && (
                          <button
                            onClick={(e) => {
                                e.stopPropagation();
                                moveNextStage(cand, true);
                            }}
                            disabled={isNextButtonDisabled(cand)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={getNextButtonText(cand)}
                          >
                            {getNextButtonText(cand).replace(' Stage', '').replace('Move to ', '')} <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Details Modal */}
      <AnimatePresence>
        {activeCandidate && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveCandidate(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
                <div className="flex items-center gap-4">
                  <img src={activeCandidate.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeCandidate.name)}&background=random`} alt={activeCandidate.name} className="w-12 h-12 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl" />
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{activeCandidate.name}</h2>
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">{activeCandidate.role}</p>
                  </div>
                </div>
                <button onClick={() => setActiveCandidate(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 focus:outline-none">
                {/* Stage Progress */}
                <div className="flex items-center justify-between px-2 overflow-x-auto pb-4 scrollbar-hide">
                  {STAGES_CONFIG.map((s, idx) => {
                    const isCurrent = s.id === activeCandidate.stage;
                    const stageIndex = STAGES_CONFIG.findIndex(stage => stage.id === activeCandidate.stage);
                    const isPast = idx < stageIndex;

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 min-w-[70px]">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] transition-all",
                          isCurrent ? "bg-primary-600 text-white shadow-lg ring-4 ring-primary-50 dark:ring-primary-950/40" :
                          isPast ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" :
                          "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                        )}>
                          {isPast ? <CheckCircle2 size={14} /> : (idx + 1)}
                        </div>
                        <span className={cn(
                          "text-[8px] font-bold uppercase tracking-widest",
                          isCurrent ? "text-primary-600 dark:text-primary-400" :
                          isPast ? "text-emerald-600 dark:text-emerald-400" :
                          "text-slate-400 dark:text-slate-500"
                        )}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Contact & Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                      <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">AI Match</p>
                      <p className={cn("text-2xl font-extrabold", activeCandidate.match > 85 ? "text-emerald-600" : activeCandidate.match > 70 ? "text-amber-600" : "text-rose-500")}>
                        {activeCandidate.match}%
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                      <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Experience</p>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeCandidate.exp || 'N/A'}</p>
                    </div>
                    <div className="col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
                      {activeCandidate.email && (
                        <div className="flex items-center gap-3">
                          <Mail size={16} className="text-slate-400" /> <span className="font-medium">{activeCandidate.email}</span>
                        </div>
                      )}
                      {activeCandidate.phone && (
                        <div className="flex items-center gap-3">
                          <Phone size={16} className="text-slate-400" /> <span className="font-medium">{activeCandidate.phone}</span>
                        </div>
                      )}
                      {activeCandidate.location && (
                        <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-slate-400" /> <span className="font-medium">{activeCandidate.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Assigned Team Members</h3>
                  <div className="flex flex-wrap gap-2">
                    {(activeCandidate.interviewers || []).length > 0 ? (
                      (activeCandidate.interviewers || []).map((name, idx) => {
                        const member = users.find(u => u.name === name) || {};
                        return (
                          <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                            <img src={member.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`} alt={name} className="w-5 h-5 rounded-full object-cover" />
                            <span>{name}</span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 italic">No team members assigned</span>
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Internal Communication</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary-50/30 dark:bg-primary-950/10 rounded-2xl border border-primary-100 dark:border-primary-900/30 italic text-sm text-slate-600 dark:text-slate-300 relative">
                      "Strong technical background. Recommended to move forward."
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary-100/30 dark:border-primary-900/15 not-italic">
                        <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-[10px] text-white font-bold">HR</div>
                        <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">HR Team • Recently</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex gap-4 shrink-0">
                {activeCandidate.stage === 'Hired' ? (
                  <div className="flex-1 py-3.5 text-center text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">Candidate Hired</div>
                ) : activeCandidate.stage === 'Rejected' ? (
                  <div className="flex-1 py-3.5 text-center text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 rounded-xl">Candidate Rejected</div>
                ) : (
                  <>
                    <button onClick={() => rejectCandidate(activeCandidate)} className="btn-secondary text-rose-500 dark:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-100 dark:hover:border-rose-900 flex-1 py-3.5 shadow-sm">
                      Reject
                    </button>
                    <button 
                      onClick={() => moveNextStage(activeCandidate)} 
                      disabled={isNextButtonDisabled(activeCandidate)}
                      className="btn-primary flex-1 py-3.5 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {getNextButtonText(activeCandidate)}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HiringPipeline;
