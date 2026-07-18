import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  LogIn, 
  LogOut, 
  MapPin, 
  Monitor, 
  CalendarDays,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Timer,
  Download,
  Search,
  Filter,
  Users
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEmployee } from '../../context/EmployeeContext';
import { useDateFormat } from '../../hooks/useDateFormat';

const EmployeeAttendance = () => {
  const { attendance, clockIn, clockOut, showToast, refetch, profile } = useEmployee();
  const { formatDate } = useDateFormat();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState('Office');
  const [workedSeconds, setWorkedSeconds] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);

  useEffect(() => {
    refetch.fetchAttendance();
  }, [refetch]);

  useEffect(() => {
    let interval;
    if (attendance.isClockedIn && attendance.clockInTime) {
      const startTime = new Date(attendance.clockInTime).getTime();
      interval = setInterval(() => {
        if (!isOnBreak) {
          setWorkedSeconds(Math.floor((new Date().getTime() - startTime) / 1000));
        }
      }, 1000);
    } else {
      setWorkedSeconds(0);
      setIsOnBreak(false);
    }
    return () => clearInterval(interval);
  }, [attendance.isClockedIn, attendance.clockInTime, isOnBreak]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const currentMonthYearStr = currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' });

  const filteredHistory = (attendance.history || []).filter(item => {
    const matchesSearch = item.date.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.mode.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const itemDate = new Date(item.rawDate || item.date);
    const matchesMonth = itemDate.getMonth() === currentDate.getMonth() && 
                         itemDate.getFullYear() === currentDate.getFullYear();
                         
    return matchesSearch && matchesMonth;
  });

  const totalPresentDays = filteredHistory.reduce((total, h) => {
    if (h.status === 'Present' || h.status === 'Late') {
      return total + (h.isHalfDay ? 0.5 : 1);
    }
    return total;
  }, 0);
  const lateIncidents = filteredHistory.filter(h => h.status === 'Late').length;

  const stats = [
    { label: 'Present Days', value: totalPresentDays, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Late Marking', value: lateIncidents, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Total Mode', value: mode, icon: Monitor, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
    { label: 'Working Mode', value: mode, icon: MapPin, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/20' },
  ];

  const handleExport = () => {
    if (filteredHistory.length === 0) {
      showToast('No attendance records to export', 'error');
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,Date,Mode,Punch In,Punch Out,Status,Activity\n";
    filteredHistory.forEach(item => {
      csvContent += `"${item.date}","${item.mode}","${item.clockIn}","${item.clockOut}","${item.status}","${item.totalHours}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Report_${currentMonthYearStr.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report exported successfully');
  };

  const handleClockIn = async () => {
    try {
      await clockIn(mode);
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to clock in', 'error');
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to clock out', 'error');
    }
  };

  const toggleBreak = () => {
    if (!attendance.isClockedIn) {
      showToast('Start a work session first to take a break', 'error');
      return;
    }
    setIsOnBreak(!isOnBreak);
    showToast(isOnBreak ? 'Resuming work session' : 'Coffee break started');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative max-w-7xl mx-auto text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Time & Attendance</h1>
          <p className="hcm-page-subtitle">Real-time work session tracking and historical records</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="btn-secondary px-6 py-2.5 flex items-center gap-2">
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          {attendance.isClockedIn ? (
            <button onClick={handleClockOut} className="btn-primary bg-rose-600 hover:bg-rose-700 px-8 py-2.5 flex items-center gap-2 shadow-xl shadow-rose-100 dark:shadow-none ring-4 ring-white dark:ring-slate-900">
              <LogOut size={18} />
              <span>Clock Out</span>
            </button>
          ) : (
            <button onClick={handleClockIn} className="btn-primary px-8 py-2.5 flex items-center gap-2 shadow-xl shadow-primary-200 dark:shadow-none">
              <LogIn size={18} />
              <span>Clock In</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="card transition-all"
          >
            <div className="flex items-center gap-4">
               <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={26} />
               </div>
               <div>
                  <p className="card-title mb-1.5">{stat.label}</p>
                  <h3 className="card-value">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Live Controls & Summary */}
        <div className="lg:col-span-4 space-y-6">
           <div className="card p-8 bg-slate-900 dark:bg-slate-950 text-white border-none shadow-premium relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                 <Clock size={150} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mb-8">Active Work Session</p>
              
              <div className="text-center mb-10 py-12 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl relative z-10">
                 <h4 className={cn("text-5xl font-black tracking-tighter mb-3 tabular-nums transition-colors duration-300", isOnBreak ? "text-orange-400" : "text-white")}>{formatTime(workedSeconds)}</h4>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{attendance.isClockedIn ? (isOnBreak ? 'On Coffee Break' : 'Timer Active') : 'Start Session to Track Time'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                 <button onClick={toggleBreak} className={cn("flex flex-col items-center gap-4 p-5 rounded-2xl border transition-all group/btn", isOnBreak ? "bg-orange-500/25 border-orange-500/50 text-orange-400" : "bg-white/10 border-white/5 hover:bg-white/15 text-white")}>
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center mb-1 group-hover/btn:scale-110 transition-transform">
                       <Coffee size={24} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">{isOnBreak ? "Resume" : "Coffee Break"}</span>
                 </button>
                 <div className="relative group/mode">
                    <button className="w-full flex flex-col items-center gap-4 p-5 rounded-2xl bg-white/10 border border-white/5 hover:bg-white/15 transition-all">
                       <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center mb-1 group-hover/mode:rotate-12 transition-transform">
                          <Monitor size={24} />
                       </div>
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">{mode} Mode</span>
                    </button>
                    <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 opacity-0 group-hover/mode:opacity-100 pointer-events-none group-hover/mode:pointer-events-auto transition-all p-1 transform translate-y-2 group-hover/mode:translate-y-0">
                       {['Office', 'Remote', 'Hybrid'].map(m => (
                          <button key={m} onClick={() => { setMode(m); showToast(`Work mode changed to ${m}`); }} className="w-full p-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left transition-colors">{m}</button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="card">
              <h3 className="card-title mb-2">{profile?.shift ? profile.shift.name : 'Shift Logic & Schedule'}</h3>
              {profile?.shift && (
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
                  {profile.shift.workingHoursMin ? `${Math.floor(profile.shift.workingHoursMin / 60)}h ${profile.shift.workingHoursMin % 60}m shift` : ''} • {profile.shift.breakDurationMin}m break • {profile.shift.graceInMin}m grace
                </p>
              )}
              <div className="space-y-8 relative ml-4 px-8 border-l-2 border-slate-100 dark:border-slate-800">
                 {(() => {
                   const shift = profile?.shift;
                   const startTime = shift?.startTime || '09:00';
                   const endTime = shift?.endTime || '18:00';
                   const breakDuration = shift?.breakDurationMin || 60;

                   // Calculate break start (midpoint of shift)
                   const [startH, startM] = startTime.split(':').map(Number);
                   const [endH, endM] = endTime.split(':').map(Number);
                   const startTotalMin = startH * 60 + startM;
                   const endTotalMin = endH * 60 + endM;
                   const breakStartMin = Math.floor((startTotalMin + endTotalMin) / 2) - Math.floor(breakDuration / 2);
                   const breakH = Math.floor(breakStartMin / 60);
                   const breakM = breakStartMin % 60;

                   const fmt = (h, m) => {
                     const ampm = h >= 12 ? 'PM' : 'AM';
                     const h12 = h % 12 || 12;
                     return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
                   };

                   const items = [
                     { time: fmt(startH, startM), label: 'Shift Start', icon: Play, color: 'bg-primary-600' },
                     { time: fmt(breakH, breakM), label: `Break (${breakDuration}m)`, icon: Coffee, color: 'bg-amber-600' },
                     { time: fmt(endH, endM), label: 'Shift End', icon: LogOut, color: 'bg-rose-600' },
                   ];

                   return items.map((log, i) => (
                     <div key={i} className="relative">
                        <div className={cn(
                           "absolute -left-[50px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center text-white",
                           log.color
                        )}>
                           <log.icon size={18} />
                        </div>
                        <div className="text-left">
                           <p className="text-base font-black text-slate-900 dark:text-white leading-none">{log.time}</p>
                           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">{log.label}</p>
                        </div>
                     </div>
                   ));
                 })()}
              </div>
           </div>
        </div>

        {/* History Area */}
        <div className="lg:col-span-8 space-y-8">
           
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">Attendance History</h3>
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search history..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10 pr-4 py-2 text-xs font-bold w-48" 
                    />
                 </div>
                 <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <button onClick={handlePrevMonth} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"><ChevronLeft size={18} /></button>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em] px-4">{currentMonthYearStr}</span>
                    <button onClick={handleNextMonth} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"><ChevronRight size={18} /></button>
                 </div>
              </div>
           </div>

           <div className="hcm-table-container">
              <table className="hcm-table">
                 <thead className="hcm-thead">
                    <tr>
                       <th className="hcm-th px-8">Date</th>
                       <th className="hcm-th px-8">Mode</th>
                       <th className="hcm-th px-8 text-center">Registry (In/Out)</th>
                       <th className="hcm-th px-8 text-center">Status</th>
                       <th className="hcm-th px-8 text-right">Activity</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredHistory.length > 0 ? filteredHistory.map((item, i) => (
                       <tr key={i} className="hcm-tr">
                          <td className="hcm-td px-8 py-6">
                             <p className="text-sm font-black text-slate-900 dark:text-white">{formatDate(item.date)}</p>
                          </td>
                          <td className="hcm-td px-8 py-6">
                             <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500">
                                   {item.mode === 'Office' ? <MapPin size={12} /> : <Monitor size={12} />}
                                </div>
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.mode}</span>
                             </div>
                          </td>
                          <td className="hcm-td px-8 py-6 text-center">
                             <div className="flex items-center justify-center gap-5">
                                <div>
                                   <p className="text-[8px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-1.5">Punch In</p>
                                   <p className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums">{item.clockIn}</p>
                                </div>
                                <ArrowRight size={14} className="text-slate-200 dark:text-slate-700" />
                                <div>
                                   <p className="text-[8px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-1.5">Punch Out</p>
                                   <p className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums">{item.clockOut}</p>
                                </div>
                             </div>
                          </td>
                          <td className="hcm-td px-8 py-6 text-center">
                             <span className={cn(
                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                item.status === 'Present' 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" 
                                  : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                             )}>
                                {item.status}
                             </span>
                          </td>
                          <td className="hcm-td px-8 py-6 text-right">
                             <p className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{item.totalHours}</p>
                          </td>
                       </tr>
                    )) : (
                       <tr>
                          <td colSpan="5" className="px-8 py-20 text-center">
                             <div className="flex flex-col items-center gap-4 text-slate-300 dark:text-slate-600">
                                <Clock size={48} className="animate-pulse" />
                                <p className="text-xs font-black uppercase tracking-[0.2em]">No records found for {currentMonthYearStr}</p>
                             </div>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>

           {/* Mobile Calendar Hint */}
           <div className="card p-10 bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none shadow-premium flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute -left-10 -bottom-10 opacity-10 rotate-12">
                 <CalendarDays size={200} />
              </div>
              <div className="space-y-2 relative z-10 text-center md:text-left">
                 <h4 className="text-2xl font-black italic tracking-tight">Full Calendar Intelligence</h4>
                 <p className="text-primary-100/80 text-xs font-black uppercase tracking-widest">Visual heatmaps and behavior tracking of your work cycle</p>
              </div>
              <button onClick={() => showToast('Calendar view loading...')} className="px-8 py-4 bg-white text-primary-600 rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 relative z-10">
                 <CalendarDays size={20} />
                 <span>Expand Calendar</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
