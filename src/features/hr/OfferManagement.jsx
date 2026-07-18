import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Plus, Search, DollarSign, FileText, Calendar, 
  Send, CheckCircle2, X, Eye, Download, 
  RotateCcw, FileSearch, MoreVertical, Trash2, Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useHR } from '../../context/HRContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useDateFormat } from '../../hooks/useDateFormat';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import DatePicker from '../../shared/components/common/DatePicker';

const OfferManagement = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();
  const { formatDate } = useDateFormat();

  const { offers, addOffer, updateOffer, deleteOffer, candidates, showToast, refetch } = useHR();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [offerToDelete, setOfferToDelete] = useState(null);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    candidate: '', role: '', salary: '', joiningDate: '', status: 'Sent'
  });

  useEffect(() => {
    if (location.state?.openCreate) {
      handleOpenCreate();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const stats = [
    { label: 'Draft Offers', value: offers.filter(o=>o.status==='Draft').length, icon: FileText, bg: 'bg-blue-50 dark:bg-blue-950/20', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Sent Offers', value: offers.filter(o=>o.status==='Sent').length, icon: Send, bg: 'bg-amber-50 dark:bg-amber-950/20', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Accepted', value: offers.filter(o=>o.status==='Accepted').length, icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-950/20', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Declined', value: offers.filter(o=>o.status==='Declined').length, icon: X, bg: 'bg-rose-50 dark:bg-rose-950/20', color: 'text-rose-500 dark:text-rose-400' },
  ];

  const [previewingOffer, setPreviewingOffer] = useState(null);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30';
      case 'Sent': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30';
      case 'Viewed': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-450 dark:border-blue-900/30';
      case 'Declined': return 'bg-rose-50 text-rose-550 border-rose-100 dark:bg-rose-950/20 dark:text-rose-455 dark:border-rose-900/30';
      case 'Draft': return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const handleOpenCreate = () => {
    setEditingOffer(null);
    setSelectedFile(null);
    setFormData({ candidate: '', role: '', salary: '', joiningDate: '', status: 'Sent' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setEditingOffer(offer.id);
    setSelectedFile(offer.fileName ? { name: offer.fileName } : null);
    setFormData({ ...offer });
    setIsModalOpen(true);
  };

  const handleOpenPreview = (offer) => {
    setPreviewingOffer(offer);
  };

  const handleSubmit = async (e, forceDraft = false) => {
    if (e) e.preventDefault();
    if(!formData.candidate) return showToast('Please select a candidate', 'error');

    const status = forceDraft ? 'Draft' : 'Sent';
    const activeCand = candidates.find(c => c.name === formData.candidate) || {};
    
    const payload = {
      ...formData,
      status,
      applicationId: activeCand.id,
      role: formData.role || activeCand.role || 'Role',
      fileName: selectedFile ? selectedFile.name : null,
      sentDate: formatDate(new Date())
    };

    if (editingOffer) {
      await updateOffer(editingOffer, payload);
    } else {
      await addOffer(payload);
    }
    
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleDeleteOffer = (offer) => {
    setOfferToDelete(offer);
  };

  const handleConfirmDelete = async () => {
    if (offerToDelete) {
      await deleteOffer(offerToDelete.id);
      setOfferToDelete(null);
    }
  };

  const handleRefresh = async () => {
    showToast('Refreshing offer and candidate tracking...', 'info');
    if (refetch && refetch.fetchOffers) {
      await refetch.fetchOffers();
    }
    if (refetch && refetch.fetchApplications) {
      await refetch.fetchApplications();
    }
    showToast('Recruitment tracking updated successfully', 'success');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      showToast(`Offer letter selected: ${file.name}`);
    }
  };

  const handleFileDivClick = () => {
    fileInputRef.current?.click();
  };

  const displaySalary = (val) => {
    if (!val) return 'N/A';
    const cleaned = String(val).replace(/[$,₹,€,£,\s]/g, '');
    if (!isNaN(cleaned) && cleaned.trim() !== '') {
      return formatCurrency(Number(cleaned));
    }
    return val;
  };

  const filteredOffers = offers.filter(o => {
    const matchSearch = (o.candidate || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (o.role || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus ? o.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const CurrencyIconComponent = getIcon();
  const currentCurrencySymbol = getSymbol();

  return (
    <div className="space-y-6 pb-12 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Offer Management</h1>
          <p className="hcm-page-subtitle">Send and track offers for your top-selected candidates</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2">
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={handleOpenCreate} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20">
             <Plus size={16} />
             <span>Create New Offer</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -2 }} className="card p-5">
            <div className="flex items-center gap-4">
               <div className={cn("p-3 rounded-2xl transition-colors shrink-0", stat.bg, stat.color)}>
                  <stat.icon size={22} />
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest leading-none mb-1.5 truncate">{stat.label}</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-white leading-none">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Card */}
      <div className="card p-0 border-none bg-white dark:bg-slate-900 shadow-soft overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
           <div className="relative flex-1 max-w-sm text-slate-400 dark:text-slate-550">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
              <input type="text" placeholder="Search by name or job role..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field pl-10 h-11" />
           </div>
           <div className="flex items-center gap-2">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field h-11 pr-10 w-40 font-bold dark:bg-slate-900">
                <option value="">All Statuses</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
                <option value="Draft">Draft</option>
              </select>
           </div>
        </div>
        
        {filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <FileText size={48} className="mb-4 opacity-30" />
            <h3 className="text-lg font-bold">No offers found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Candidate</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Salary</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Joining Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="group hover:bg-slate-55/10 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-5 cursor-pointer" onClick={() => handleOpenEdit(offer)}>
                       <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{offer.candidate}</p>
                       <p className="text-[9px] font-bold text-slate-400 dark:text-slate-550 mt-1 uppercase tracking-widest italic">{offer.status === 'Draft' ? 'Drafted' : 'Sent'}: {offer.sentDate || offer.date}</p>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-700 dark:text-slate-300">
                       {offer.role}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
                         <span className="text-xs font-extrabold">{displaySalary(offer.salary)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                         <Calendar size={13} className="opacity-55" />
                         <span className="text-xs font-bold">{offer.joiningDate || 'TBD'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border cursor-pointer hover:opacity-85 transition-opacity", getStatusStyle(offer.status))} onClick={() => updateOffer(offer.id, {status: offer.status === 'Sent' ? 'Accepted' : offer.status === 'Accepted' ? 'Declined' : 'Sent'})}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => handleOpenPreview(offer)} className="p-1.5 text-slate-400 hover:text-primary-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="View Preview"><FileSearch size={16} /></button>
                        <button onClick={() => updateOffer(offer.id, { status: 'Sent' })} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="Resend Offer"><Send size={16} /></button>
                        <button onClick={() => handleDeleteOffer(offer)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

       <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
                   <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{editingOffer ? 'Edit Offer Details' : 'Create Candidate Offer'}</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                      <X size={20} />
                   </button>
                </div>
                <form onSubmit={(e) => handleSubmit(e, false)} className="flex-1 overflow-y-auto">
                  <div className="p-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Candidate Name <span className="text-rose-500">*</span></label>
                           <select required value={formData.candidate} onChange={e => {
                             const sel = e.target.value;
                             const cand = candidates.find(c => c.name === sel);
                             setFormData({...formData, candidate: sel, role: cand?.role || ''});
                           }} className="input-field h-12 appearance-none dark:bg-slate-900">
                              <option value="">Select Candidate in Pipeline</option>
                              {candidates.filter(c => c.stage === 'Offer' || c.stage === 'Interview' || c.stage === 'Hired').map(c => (
                                <option key={c.id} value={c.name}>{c.name} ({c.role})</option>
                              ))}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Proposed Salary (Annual)</label>
                           <div className="relative">
                              <CurrencyIconComponent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input type="text" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder={`e.g. ${currentCurrencySymbol}140,000`} className="input-field h-12 pl-10" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Joining Date</label>
                           <DatePicker  value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} className="input-field h-12" />
                        </div>
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Offer Letter Template</label>
                        <input 
                           type="file" 
                           ref={fileInputRef} 
                           onChange={handleFileChange} 
                           accept=".pdf,.doc,.docx" 
                           className="hidden" 
                        />
                        <div 
                           onClick={handleFileDivClick} 
                           className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-primary-350 hover:text-primary-500 transition-all cursor-pointer group"
                        >
                           <FileText size={32} className="text-slate-300 dark:text-slate-600 group-hover:text-primary-400 mx-auto mb-2" />
                           {selectedFile ? (
                             <div>
                               <p className="text-xs font-bold text-primary-600 dark:text-primary-400">{selectedFile.name}</p>
                               <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Click to change file</p>
                             </div>
                           ) : (
                             <p className="text-[10px] font-extrabold text-slate-500 group-hover:text-primary-500 uppercase tracking-widest">Select PDF Offer Letter</p>
                           )}
                        </div>
                     </div>
 
                     <div className="grid grid-cols-2 gap-4 pt-4">
                        {['Sign-on Bonus', 'Medical Insurance', 'Stock Options', 'Relocation'].map((ben, i) => (
                           <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 rounded-xl cursor-pointer hover:border-primary-300 transition-all">
                              <input type="checkbox" className="w-4 h-4 rounded accent-primary-600" />
                              <span className="text-[10px] font-bold text-slate-650 dark:text-slate-400 uppercase tracking-widest">{ben}</span>
                           </label>
                        ))}
                     </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-end gap-3 shrink-0">
                     <button type="button" onClick={(e) => handleSubmit(e, true)} className="px-5 py-2.5 font-bold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700">Save as Draft</button>
                     <button type="submit" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/10 active:scale-95 flex items-center gap-2">
                        <Send size={16} />
                        <span>{editingOffer ? 'Update Offer' : 'Send Offer'}</span>
                     </button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
 
        {previewingOffer && (
           <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewingOffer(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-600">
                          <FileText size={22} />
                       </div>
                       <div>
                          <h2 className="text-sm font-extrabold text-slate-900 dark:white">Offer_Letter_{previewingOffer.candidate.replace(' ', '_')}.pdf</h2>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Document Preview • {previewingOffer.sentDate || 'Preview'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button onClick={() => showToast('Starting download...')} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Download">
                          <Download size={18} />
                       </button>
                       <button onClick={() => setPreviewingOffer(null)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                          <X size={20} />
                       </button>
                    </div>
                 </div>
                 <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-y-auto p-4 sm:p-10 flex justify-center">
                    <div className="w-full max-w-[800px] bg-white dark:bg-slate-900 shadow-2xl rounded-sm p-12 sm:p-20 relative overflow-hidden ring-1 ring-slate-900/5 min-h-[1056px]">
                       <div className="flex justify-between items-start mb-16">
                          <div>
                             <h4 className="text-2xl font-black text-indigo-650 tracking-tighter">GlobalTech.ai</h4>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Enterprise HCM Solutions</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Offer Reference</p>
                             <p className="text-xs font-medium text-slate-500">REF-{Math.floor(Math.random()*10000)}-2026</p>
                          </div>
                       </div>
 
                       <div className="space-y-8">
                          <div>
                             <p className="text-sm font-bold text-slate-900 dark:text-white">{previewingOffer.sentDate || formatDate(new Date())}</p>
                             <div className="mt-6 space-y-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{previewingOffer.candidate}</p>
                                <p className="text-sm font-medium text-slate-500">Applicant ID: CAND-{Math.floor(Math.random()*100)}</p>
                             </div>
                          </div>
 
                          <div className="py-10 border-y border-slate-100 dark:border-slate-800">
                             <h3 className="text-lg font-bold text-slate-900 mb-6 dark:text-white">Subject: Offer of Employment - {previewingOffer.role}</h3>
                             <div className="space-y-4 text-sm leading-relaxed text-slate-650 dark:text-slate-350">
                                <p>Dear {previewingOffer.candidate.split(' ')[0]},</p>
                                <p>On behalf of GlobalTech.ai, I am thrilled to formally offer you the position of <span className="font-bold text-slate-900 dark:text-white">{previewingOffer.role}</span>. Following our recent interviews, we are confident that your expertise and vision will be a tremendous asset to our team.</p>
                                <p>We are excited about the possibility of you joining us as we continue to revolutionize the HCM landscape with artificial intelligence.</p>
                             </div>
                          </div>
 
                          <div className="grid grid-cols-2 gap-12 py-10">
                             <div className="space-y-6">
                                <div>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Compensation</p>
                                   <p className="text-lg font-bold text-indigo-650 dark:text-indigo-400">{displaySalary(previewingOffer.salary)}</p>
                                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Base Annual Salary (Gross)</p>
                                </div>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3">
                                   <CheckCircle2 size={14} className="text-emerald-500" />
                                   <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Benefits & Relocation Bonus Active</span>
                                </div>
                             </div>
                             <div className="space-y-6">
                                <div>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Commencement</p>
                                   <p className="text-lg font-bold text-slate-900 dark:text-white">{previewingOffer.joiningDate || 'To be confirmed'}</p>
                                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Anticipated Start Date</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Reporting Manager</span>
                                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sarah Johnson (VP Engineering)</span>
                                </div>
                             </div>
                          </div>
 
                          <div className="pt-20">
                             <div className="flex justify-between items-end">
                                <div className="w-48 border-b border-slate-900 dark:border-slate-700 pb-2">
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-10">Authorized Signature</p>
                                   <span className="font-serif italic text-xl text-slate-400 dark:text-slate-500">Digital Seal Applied</span>
                                </div>
                                <div className="text-right">
                                   <p className="text-[9px] font-bold text-slate-400 italic">Page 1 of 1</p>
                                </div>
                              </div>
                           </div>
                        </div>
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] dark:opacity-[0.01] pointer-events-none rotate-45 select-none">
                           <span className="text-8xl font-black tracking-tighter">GLOBALTECH</span>
                        </div>
                     </div>
                  </div>
                  <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                     <button onClick={() => setPreviewingOffer(null)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">Close</button>
                     <button onClick={() => showToast('Opening system print dialog...')} className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/10">Print / Sign</button>
                  </div>
               </motion.div>
            </div>
         )}
       </AnimatePresence>

       <ConfirmDialog
          isOpen={!!offerToDelete}
          onClose={() => setOfferToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Offer Letter"
          message={`Are you sure you want to delete this offer letter for ${offerToDelete?.candidate}? This action cannot be undone.`}
        />
     </div>
   );
 };
 
 export default OfferManagement;
