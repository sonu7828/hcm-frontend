import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Monitor, 
  Search, 
  Download, 
  Plus, 
  Filter, 
  ChevronRight, 
  X, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  Timer,
  PieChart,
  BarChart3,
  CalendarDays,
  RotateCcw,
  User,
  Save,
  MessageSquare,
  FileText,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useManager } from '../../context/ManagerContext';
import CenterModal from '../../shared/components/common/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';
import PermissionGate from '../../shared/components/common/PermissionGate';
import ImportModal from '../../shared/components/import/ImportModal';
import { Upload } from 'lucide-react';
import DatePicker from '../../shared/components/common/DatePicker';

const AttendanceReview = () => {
  const { attendance, teamMembers, addAttendanceEntry, showToast } = useManager();
  
  // UI States
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form State
  const [newEntry, setNewEntry] = useState({ employeeId: '', date: '', checkIn: '', checkOut: '', status: 'Present', mode: 'Office' });

  // Stats calculation
  const stats = useMemo(() => {
    const present = attendance.filter(r => r.status === 'Present').length;
    const late = attendance.filter(r => r.status === 'Late').length;
    const leave = attendance.filter(r => r.status === 'On Leave').length;
    return [
      { label: 'Present Today', value: `${present}/${teamMembers.length}`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Late Arrivals', value: late.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'On Leave', value: leave.toString(), icon: CalendarDays, color: 'text-rose-600', bg: 'bg-rose-50' },
      { label: 'Avg Hours', value: '8.2h', icon: Timer, color: 'text-primary-600', bg: 'bg-primary-50' },
    ];
  }, [attendance, teamMembers]);

  // Filtering Logic
  const filteredRecords = useMemo(() => {
    return attendance.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter ? r.status === statusFilter : true;
      const matchesDate = dateFilter ? (r.rawDate === dateFilter || r.date === dateFilter) : true;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [attendance, searchQuery, statusFilter, dateFilter]);

  const handleManualEntry = async (e) => {
    e.preventDefault();
    const emp = teamMembers.find(m => m.id === newEntry.employeeId);
    if (!emp || !newEntry.date || !newEntry.checkIn) {
      showToast('Please select employee and provide time details.', 'error');
      return;
    }
    await addAttendanceEntry(newEntry);
    setShowManualModal(false);
    setNewEntry({ employeeId: '', date: '', checkIn: '', checkOut: '', status: 'Present', mode: 'Office' });
  };

  const handleExport = () => {
    setIsExporting(true);
    showToast('Exporting attendance history...', 'info');
    setTimeout(() => {
      try {
        const headers = ['Employee Name', 'Date', 'Clock In', 'Clock Out', 'Hours Worked', 'Work Mode', 'Status'];
        const rows = filteredRecords.map(r => [
          `"${r.name}"`,
          `"${r.date}"`,
          `"${r.checkIn}"`,
          `"${r.checkOut || '-'}"`,
          `"${r.hours || '8.5h'}"`,
          `"${r.mode || 'Office'}"`,
          `"${r.status}"`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Attendance history exported successfully!', 'success');
      } catch (err) {
        showToast('Error exporting attendance data', 'error');
      } finally {
        setIsExporting(false);
      }
    }, 1500);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDateFilter(new Date().toISOString().split('T')[0]);
    setStatusFilter('');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Attendance Review</h1>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Monitor team punctuality, working hours and overall presence</p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGate module="attendance_review" action="view">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload size={18} />
              <span className="hidden sm:inline">Import Attendance</span>
            </button>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
            >
              {isExporting ? (
                 <Loader2 size={18} className="animate-spin text-primary-500" />
              ) : (
                 <Download size={18} />
              )}
              <span className="hidden sm:inline">Export History</span>
            </button>
          </div>
          </PermissionGate>
          <PermissionGate module="attendance_review" action="create">
          <button 
            onClick={() => setShowManualModal(true)}
            className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
          >
             <Plus size={18} />
             <span>Manual Entry</span>
          </button>
          </PermissionGate>
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
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter dark:text-white">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card p-6 border-none bg-white shadow-soft flex flex-row flex-wrap items-center gap-3">
         <div className="relative w-full sm:w-72 text-slate-400">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by employee name..." 
              className="input-field pl-10 h-11" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
         <DatePicker  
           className="input-field h-11 px-4 font-bold text-slate-600 w-full sm:w-48" 
           value={dateFilter}
           onChange={(e) => setDateFilter(e.target.value)}
         />
         <select 
           className="input-field h-11 pr-10 min-w-[140px] font-bold text-slate-600 appearance-none bg-no-repeat bg-[right_1rem_center] w-full sm:w-auto"
           value={statusFilter}
           onChange={(e) => setStatusFilter(e.target.value)}
         >
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="On Leave">On Leave</option>
         </select>
      </div>

      {/* Main Table */}
      <div className="card p-0 border-none bg-white shadow-soft overflow-hidden">
         <div className="overflow-x-auto text-left">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50">
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Employee</th>
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">In / Out</th>
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Total Hours</th>
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Work Mode</th>
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Status</th>
                     <th className="px-8 py-5 text-right text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 text-sm">
                  {filteredRecords.map((user) => (
                     <tr key={user.id} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <Avatar src={user.img} alt={user.name} className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-white" />
                              <div className="text-left">
                                 <p className="font-extrabold text-slate-900 leading-none">{user.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{user.date}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-black text-slate-900">{user.checkIn} — {user.checkOut || '--:--'}</span>
                              {user.status === 'Late' && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1"><AlertCircle size={10} /> Late Arrival</span>}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <p className="font-black text-slate-900">{user.overtime ? `8h + ${user.overtime}` : '8.5h'}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <div className="flex items-center justify-center gap-2">
                              {user.mode === 'Office' || !user.mode ? <MapPin size={14} className="text-slate-300" /> : <Monitor size={14} className="text-slate-300" />}
                              <span className="text-xs font-bold text-slate-600">{user.mode || 'Office'}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <span className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                              user.status === 'Present' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              user.status === 'Late' ? "bg-amber-50 text-amber-600 border-amber-100" :
                              user.status === 'On Leave' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                              "bg-rose-50 text-rose-500 border-rose-100"
                           )}>
                              {user.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button onClick={() => setSelectedEntry(user)} className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                              <ChevronRight size={20} />
                           </button>
                        </td>
                     </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                       <td colSpan="6" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-40">
                             <CalendarDays size={48} className="text-slate-300" />
                             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No attendance records found</p>
                          </div>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Entry Details Modal */}
      <CenterModal 
        isOpen={!!selectedEntry} 
        onClose={() => setSelectedEntry(null)} 
        title="Attendance Record Details"
      >
         {selectedEntry && (            <div className="p-6 sm:p-8 space-y-6 text-left">
               <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-50">
                  <Avatar src={selectedEntry.img} alt={selectedEntry.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-50 shadow-lg" />
                  <div className="text-left">
                     <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-none dark:text-white">{selectedEntry.name}</h2>
                     <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-2">{selectedEntry.date}</p>
                     <div className="mt-4 flex items-center gap-3">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                          selectedEntry.status === 'Present' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>{selectedEntry.status}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode: {selectedEntry.mode || 'Office'}</span>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Hours</p>
                     <h4 className="text-2xl font-black text-slate-900 dark:text-white">8.5h</h4>
                  </div>
                  <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Break Time</p>
                     <h4 className="text-2xl font-black text-slate-900 dark:text-white">{selectedEntry.breakTime || '1h'}</h4>
                  </div>
               </div>

               <section className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-2.5 text-left">Timeline Activity</h3>
                  <div className="space-y-5 relative ml-3 pl-8 border-l-2 border-slate-100 text-left">
                     {[
                        { time: selectedEntry.checkIn, label: 'Clocked In', icon: Clock, color: 'bg-emerald-500' },
                        { time: '01:00 PM', label: 'Break Started', icon: Timer, color: 'bg-amber-500' },
                        { time: '02:00 PM', label: 'Break Ended', icon: Timer, color: 'bg-indigo-500' },
                        { time: selectedEntry.checkOut || '--:--', label: 'Clocked Out', icon: Clock, color: 'bg-slate-900' },
                     ].map((log, i) => (
                        <div key={i} className="relative group">
                           <div className={cn("absolute -left-[45px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white", log.color)}>
                              <log.icon size={12} />
                           </div>
                            <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform">
                              <div className="text-left">
                                 <p className="text-sm sm:text-base font-black text-slate-900 leading-none">{log.time}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{log.label}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               <div className="pt-6 border-t border-slate-50 flex gap-3">
                  <button className="flex-1 py-2.5 sm:py-3 bg-slate-50 text-slate-600 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 text-xs sm:text-sm">Flag Record</button>
                  <button onClick={() => setSelectedEntry(null)} className="flex-1 py-2.5 sm:py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 text-xs sm:text-sm">Confirm View</button>
               </div>
            </div>
         )}
      </CenterModal>

      {/* Manual Entry Modal */}
      <CenterModal 
        isOpen={showManualModal} 
        onClose={() => setShowManualModal(false)} 
        title="Add Attendance Record"
      >
         <form onSubmit={handleManualEntry} className="p-6 sm:p-8 space-y-4 sm:space-y-6 text-left">
            <div className="space-y-2 text-left">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 text-left">Select Employee</label>
               <select 
                  className="input-field h-11 sm:h-12 font-semibold appearance-none bg-white text-sm"
                  value={newEntry.employeeId}
                  onChange={e => setNewEntry({...newEntry, employeeId: e.target.value})}
               >
                  <option value="">Choose from Team</option>
                  {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
               </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6 text-left">
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Date</label>
                  <DatePicker  
                    className="input-field h-11 sm:h-12 font-semibold text-sm" 
                    value={newEntry.date}
                    onChange={e => setNewEntry({...newEntry, date: e.target.value})}
                  />
               </div>
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Work Mode</label>
                  <select 
                    className="input-field h-11 sm:h-12 font-semibold appearance-none bg-white text-sm"
                    value={newEntry.mode}
                    onChange={e => setNewEntry({...newEntry, mode: e.target.value})}
                  >
                     <option>Office</option>
                     <option>Remote</option>
                     <option>hybrid</option>
                     <option>Client Visit</option>
                  </select>
               </div>
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">In Time</label>
                  <input 
                    type="time" 
                    className="input-field h-11 sm:h-12 font-semibold text-sm" 
                    value={newEntry.checkIn}
                    onChange={e => setNewEntry({...newEntry, checkIn: e.target.value})}
                  />
               </div>
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Out Time</label>
                  <input 
                    type="time" 
                    className="input-field h-11 sm:h-12 font-semibold text-sm" 
                    value={newEntry.checkOut}
                    onChange={e => setNewEntry({...newEntry, checkOut: e.target.value})}
                  />
               </div>
            </div>

            <div className="space-y-2 text-left">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Attendance Status</label>
               <div className="grid grid-cols-3 gap-3">
                  {['Present', 'Late', 'On Leave'].map(s => (
                    <button
                       key={s}
                       type="button"
                       onClick={() => setNewEntry({...newEntry, status: s})}
                       className={cn(
                        "py-2.5 sm:py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border",
                        newEntry.status === s ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                       )}
                    >
                      {s}
                    </button>
                  ))}
               </div>
            </div>

            <div className="pt-4 flex flex-col gap-3 text-left">
               <button type="submit" className="btn-primary w-full py-2.5 sm:py-3 font-bold uppercase tracking-[0.2em] shadow-md shadow-primary-100 text-sm">Record Entry</button>
               <button type="button" onClick={() => setShowManualModal(false)} className="w-full py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors">Dismiss</button>
            </div>
         </form>
      </CenterModal>

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        entity="attendance"
      />
    </div>
  );
};

export default AttendanceReview;
