import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeBuoy, Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, X, MessageSquare, 
  User, Paperclip, Send, ChevronRight, ShieldCheck, Monitor, CreditCard, Zap, Calendar, 
  MessageCircle, Hash, ArrowRight, Star, Trash
} from 'lucide-react';
import { getBackendURL } from '../../utils/apiService';
import { cn } from '../../utils/cn';
import { useDateFormat } from '../../hooks/useDateFormat';
import { useEmployee } from '../../context/EmployeeContext';
import CenterModal from '../../shared/components/layout/CenterModal';

const EmployeeHelpDesk = () => {
  const { profile, tickets, createTicket, replyTicket, deleteTicketMessage, showToast } = useEmployee();
  const { formatDate } = useDateFormat();
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [attachmentBase64, setAttachmentBase64] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [createAttachmentBase64, setCreateAttachmentBase64] = useState(null);
  const [createAttachmentName, setCreateAttachmentName] = useState('');
  const fileInputRef = useRef(null);
  const createFileInputRef = useRef(null);

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets]);

  const getFriendlyStatus = (status) => {
    if (!status) return '';
    const s = status.toUpperCase();
    if (s === 'OPEN') return 'Open';
    if (s === 'IN_PROGRESS') return 'In Progress';
    if (s === 'RESOLVED') return 'Resolved';
    return status;
  };

  const stats = [
    { label: 'Active Support', value: tickets.filter(t => getFriendlyStatus(t.status) !== 'Resolved').length, icon: MessageSquare, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Average Resolution', value: '2.4h', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Tickets', value: tickets.length, icon: Hash, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Satisfaction', value: '98%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || getFriendlyStatus(t.status) === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createTicket({
      subject: formData.get('subject'),
      category: formData.get('category'),
      priority: formData.get('priority'),
      description: formData.get('description'),
      attachmentBase64: createAttachmentBase64,
      status: 'Open'
    });
    setIsNewTicketModalOpen(false);
    setCreateAttachmentBase64(null);
    setCreateAttachmentName('');
    if (createFileInputRef.current) createFileInputRef.current.value = '';
    showToast('Support ticket created successfully');
  };

  const handleCreateFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File too large (max 5MB)', 'error');
        return;
      }
      setCreateAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setCreateAttachmentBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File too large (max 5MB)', 'error');
        return;
      }
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setAttachmentBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && !attachmentBase64) return;
    await replyTicket(selectedTicket.id, replyText, attachmentBase64);
    setReplyText('');
    setAttachmentBase64(null);
    setAttachmentName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Reply sent');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative max-w-7xl mx-auto text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Support Ecosystem</h1>
          <p className="text-slate-500 font-bold tracking-tight">Need assistance? Engage with our expert support team or IT specialist hubs</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsNewTicketModalOpen(true)}
            className="btn-primary w-full md:w-auto px-8 py-2.5 font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary-200 active:scale-95 transition-all"
          >
             <Plus size={18} />
             <span>Raise Ticket</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="card p-6"
          >
            <div className="flex items-center gap-4 text-left">
               <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={26} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ticket Management */}
      <div className="space-y-8">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
               {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                       "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap",
                       activeTab === tab ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-y-[-2px]" : "bg-white text-slate-400 border border-slate-100 hover:border-primary-200"
                    )}
                  >
                     {tab}
                  </button>
               ))}
            </div>
            <div className="relative w-full lg:w-96">
               <Search className="absolute left-4 top-3 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search registry..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-white border border-slate-100 rounded-xl pl-12 pr-4 h-12 text-xs font-bold w-full focus:ring-2 focus:ring-primary-50 outline-none transition-all shadow-sm" 
               />
            </div>
         </div>

         <div className="card p-0 border-none bg-white shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Ticket Identity</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Category</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Priority</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Status</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-right">Activity</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredTickets.length > 0 ? filteredTickets.map((t) => (
                        <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedTicket(t)}>
                           <td className="px-8 py-7">
                              <div className="flex items-center gap-5">
                                 <div className="w-12 h-12 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                                    <Hash size={16} className="opacity-40" />
                                    <span className="text-[10px] font-black leading-none mt-1">{t.id.split('-')[0]}</span>
                                 </div>
                                 <div className="min-w-0 max-w-sm">
                                    <p className="text-sm font-black text-slate-900 leading-none truncate italic tracking-tight">{t.subject}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                       {formatDate(t.createdAt)}
                                    </p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-7">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] px-3 py-1 bg-slate-50 rounded-lg">{t.category}</span>
                           </td>
                           <td className="px-8 py-7 text-center">
                              <span className={cn(
                                 "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border italic",
                                 t.priority === 'High' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                 t.priority === 'Medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                 "bg-primary-50 text-primary-600 border-primary-100"
                              )}>
                                 {t.priority}
                              </span>
                           </td>
                           <td className="px-8 py-7 text-center">
                              <span className={cn(
                                 "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                 getFriendlyStatus(t.status) === 'Resolved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                 getFriendlyStatus(t.status) === 'In Progress' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                 "bg-slate-100 text-slate-500 border-slate-200"
                              )}>
                                 {getFriendlyStatus(t.status)}
                              </span>
                           </td>
                           <td className="px-8 py-7 text-right">
                              <button className="p-3 bg-slate-50 text-slate-400 hover:text-primary-600 border border-slate-100 rounded-2xl shadow-sm transition-all group-hover:scale-110"><MessageCircle size={20} /></button>
                           </td>
                        </tr>
                     )) : (
                       <tr>
                         <td colSpan="5" className="py-20 text-center">
                            <div className="flex flex-col items-center gap-4 text-slate-300">
                               <MessageSquare size={48} className="animate-pulse" />
                               <p className="text-[10px] font-black uppercase tracking-[0.2em]">No support records found</p>
                            </div>
                         </td>
                       </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* New Ticket Modal */}
      <CenterModal isOpen={isNewTicketModalOpen} onClose={() => setIsNewTicketModalOpen(false)} title="Register Support Ticket">
         <form onSubmit={handleCreateSubmit} className="p-10 space-y-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Engagement Subject</label>
                  <input name="subject" type="text" required placeholder="e.g. Identity Access Issue" className="input-field h-14 bg-slate-50 border-transparent font-black" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Functional Category</label>
                  <select name="category" className="input-field h-14 bg-slate-50 border-transparent font-black">
                     <option>IT Support</option>
                     <option>Payroll Query</option>
                     <option>HR Policy</option>
                     <option>Hardware Request</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Priority Strategy</label>
                  <select name="priority" className="input-field h-14 bg-slate-50 border-transparent font-black">
                     <option>Low</option>
                     <option>Medium</option>
                     <option>High</option>
                  </select>
               </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Attachment (Optional)</label>
                   <input id="create-ticket-attachment" type="file" ref={createFileInputRef} className="hidden" onChange={handleCreateFileSelect} />
                   {createAttachmentName ? (
                     <div className="h-14 border border-indigo-100 rounded-xl bg-indigo-50/50 flex items-center justify-between px-4 text-xs font-bold text-indigo-700">
                       <span className="flex items-center gap-2"><Paperclip size={14} /> {createAttachmentName}</span>
                       <button type="button" onClick={() => { setCreateAttachmentBase64(null); setCreateAttachmentName(''); if (createFileInputRef.current) createFileInputRef.current.value = ''; }}><X size={14} /></button>
                     </div>
                   ) : (
                     <label 
                       htmlFor="create-ticket-attachment"
                       className="h-14 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50 flex items-center justify-center text-[9px] font-black uppercase text-slate-300 hover:text-primary-600 hover:border-primary-200 transition-colors tracking-widest cursor-pointer"
                     >
                        Upload Screenshot
                     </label>
                   )}
                </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Detailed Log of Issue</label>
               <textarea name="description" rows="4" required className="input-field py-4 bg-slate-50 border-transparent font-black resize-none" placeholder="Provide full context for support audit..."></textarea>
            </div>
            
            <div className="pt-4 flex gap-4">
               <button type="button" onClick={() => setIsNewTicketModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest">Discard</button>
               <button type="submit" className="flex-2 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all">Submit to Cube</button>
            </div>
         </form>
      </CenterModal>

      {/* Ticket Conversation Modal */}
      <CenterModal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={`Discussion: ${selectedTicket?.id?.substring(0, 8)}`}>
         {selectedTicket && (
            <div className="flex flex-col h-[650px] max-h-[80vh] w-full">
               <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-4">
                        <div className={cn(
                           "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                           selectedTicket.priority === 'High' ? "bg-rose-50 text-rose-600" : "bg-primary-50 text-primary-600"
                        )}>{selectedTicket.priority} Priority</div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedTicket.category}</span>
                     </div>
                     <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1 rounded-full">{getFriendlyStatus(selectedTicket.status)}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 italic tracking-tight dark:text-white truncate">{selectedTicket.subject}</h2>
               </div>

               <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-none">
                  {selectedTicket.messages.map((msg, i) => {
                     const isMyMessage = msg.sender?.email === profile.email;
                     const senderName = isMyMessage ? profile.fullName : (msg.sender?.employeeProfile?.fullName || msg.sender?.email || "Support Team");
                     return (
                        <div key={i} className={cn(
                           "flex flex-col max-w-[80%]",
                           isMyMessage ? "ml-auto items-end" : "mr-auto items-start"
                        )}>
                           <div className="flex items-center gap-2 mb-2 px-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{senderName}</p>
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                 • {new Date(msg.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                           <div className="flex gap-2 items-center group/msg relative">
                              {isMyMessage && (
                                 <button 
                                    onClick={() => deleteTicketMessage(selectedTicket.id, msg.id)}
                                    className="opacity-0 group-hover/msg:opacity-100 p-2 text-rose-400 hover:text-rose-600 transition-opacity bg-white border border-slate-100 rounded-full shadow-sm"
                                    title="Delete Message"
                                 >
                                    <Trash size={14} />
                                 </button>
                              )}
                              <div className={cn(
                                 "p-5 rounded-2xl shadow-sm text-sm font-bold leading-relaxed transition-all",
                                 isMyMessage 
                                 ? "bg-slate-900 text-white rounded-tr-none hover:shadow-xl" 
                                 : "hcm-badge hcm-badge-draft border border-slate-100 rounded-tl-none hover:bg-white hover:shadow-xl hover:border-transparent"
                              )}>
                                 {msg.text && <p>{msg.text}</p>}
                                 {msg.attachmentUrl && (
                                    <a href={msg.attachmentUrl.startsWith('/') ? `${getBackendURL()}${msg.attachmentUrl}` : msg.attachmentUrl} target="_blank" rel="noreferrer" className={cn(
                                       "flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-xs font-black",
                                       isMyMessage ? "bg-white/10 hover:bg-white/20" : "bg-slate-50 hover:bg-slate-100"
                                    )} onClick={(e) => e.stopPropagation()}>
                                       <Paperclip size={14} /> View Attachment
                                    </a>
                                 )}
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>

               <div className="p-8 bg-white border-t border-slate-50 flex flex-col gap-2">
                  {attachmentName && (
                     <div className="flex items-center justify-between bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-black">
                        <span className="flex items-center gap-2"><Paperclip size={14} /> {attachmentName}</span>
                        <button type="button" onClick={() => { setAttachmentBase64(null); setAttachmentName(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}><X size={14} /></button>
                     </div>
                  )}
                  <form onSubmit={handleReply} className="relative">
                     <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                     <input 
                       type="text" 
                       value={replyText}
                       onChange={(e) => setReplyText(e.target.value)}
                       placeholder="Draft a technical reply..." 
                       className="w-full bg-slate-50 border-none rounded-2xl pl-6 pr-32 py-5 text-sm font-black outline-none focus:ring-2 focus:ring-primary-50 transition-all shadow-inner" 
                     />
                     <div className="absolute right-3 top-2.5 flex items-center gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-300 hover:text-primary-600 transition-colors"><Paperclip size={20} /></button>
                        <button type="submit" className="p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Send size={20} /></button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </CenterModal>
    </div>
  );
};

export default EmployeeHelpDesk;
