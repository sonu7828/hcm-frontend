import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/apiService';
import { DollarSign, TrendingUp, Calendar, Download, FileText, CheckCircle, Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CenterModal from '../../shared/components/layout/CenterModal';
import { useCurrency } from '../../hooks/useCurrency';
import { useDateFormat } from '../../hooks/useDateFormat';
import { useEmployee } from '../../context/EmployeeContext';
import DatePicker from '../../shared/components/common/DatePicker';

const EmployeePayroll = () => {
  const [compensation, setCompensation] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const payslipPrintRef = useRef();
  
  const { formatCurrency, getSymbol, currencyCode } = useCurrency();
  const { formatDate } = useDateFormat();
  const { showToast } = useEmployee();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, snapRes] = await Promise.all([
        api.get('/employee/compensation').catch(e => ({ data: null })), // might be 404 if not assigned
        api.get('/employee/payroll/snapshots')
      ]);
      setCompensation(compRes.data);
      setSnapshots(snapRes.data);
    } catch (err) {
      console.error("Error fetching payroll data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleDownloadPayslip = (s) => {
    const emp = compensation?.employee || {};
    const recordForPrint = {
      ...s,
      name: emp.fullName || 'Employee',
      employeeId: emp.employeeId || '-',
      designation: emp.designation || emp.jobTitle || 'Employee',
      department: emp.department?.name || emp.department || 'General',
      currency: currencyCode,
      net: s.netSalary
    };
    setSelectedRecord(recordForPrint);
    setShowPayslipModal(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (loading) {
    return <div className="p-6 flex justify-center"><div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Compensation & Payroll</h1>
          <p className="text-gray-500 mt-1">View your salary structure and payslips.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Salary Structure</p>
              <h3 className="text-xl font-bold dark:text-white truncate max-w-[200px]" title={compensation?.salaryStructure?.name || 'Not assigned'}>
                {compensation?.salaryStructure?.name || 'Not assigned'}
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            {compensation?.salaryBand ? `Salary Band: ${compensation.salaryBand.name}` : 'Active Compensation Plan'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Monthly CTC</p>
              <h3 className="text-2xl font-bold dark:text-white">
                {compensation ? formatCurrency(compensation.monthlyCTC) : '-'}
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Cost to Company per month
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Annual CTC</p>
              <h3 className="text-2xl font-bold dark:text-white">
                {compensation ? formatCurrency(compensation.annualCTC) : '-'}
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Cost to Company per annum
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payslips (Payroll Snapshots)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Month</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Gross Salary</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Deductions</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Net Pay</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {snapshots.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">{s.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(s.grossSalary)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">-{formatCurrency(s.totalDeductions)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{formatCurrency(s.netSalary)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleDownloadPayslip(s)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1 text-sm font-medium ml-auto"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </td>
                </tr>
              ))}
              {snapshots.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No payslips found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Payslip Modal ── */}
      <AnimatePresence>
        {showPayslipModal && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-3xl shadow-2xl relative my-8"
            >
              <button
                onClick={() => setShowPayslipModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              {/* Printable Area Wrapper */}
              <div id="payslip-print-container" ref={payslipPrintRef} className="space-y-6">
                {/* Payslip Header Info */}
                <div className="flex justify-between items-start border-b border-primary-100 dark:border-slate-800 pb-4 mt-2">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">GlobalTech Solutions</h2>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Enterprise Employee Paystub</p>
                  </div>
                  <div className="text-right mr-6">
                    <span className="text-xs font-bold font-mono text-slate-400">PAYSLIP ID: {selectedRecord.id?.slice(0, 8).toUpperCase()}</span>
                    <p className="text-[10px] text-slate-500 mt-1">Month: <strong>{selectedRecord.month}</strong></p>
                  </div>
                </div>

                {/* Employee / Issue details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Employee Details</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.name}</p>
                    <p className="text-slate-400 font-mono mt-0.5">{selectedRecord.employeeId}</p>
                    <p className="text-slate-500 mt-0.5">{selectedRecord.designation} • {selectedRecord.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance Summary</p>
                    <p className="text-slate-600 dark:text-slate-400">Working Days: <strong>{selectedRecord.totalWorkingDays ?? 0}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">Days Present: <strong>{selectedRecord.presentDays ?? selectedRecord.attendancePresent ?? 0}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">Paid Leaves: <strong>{selectedRecord.paidLeaveDays ?? 0}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">LOP Days: <strong>{selectedRecord.unpaidLeaveDays ?? selectedRecord.attendanceAbsent ?? 0}</strong></p>
                  </div>
                </div>

                {/* Breakdown Tables (Earnings vs Deductions) */}
                <div className="grid grid-cols-2 gap-6 pt-2">
                  {/* Earnings */}
                  <div className="space-y-1 text-xs">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase border-b pb-1 border-slate-100 dark:border-slate-800">Earnings</h4>
                    {selectedRecord.items && selectedRecord.items.length > 0 ? (
                      selectedRecord.items
                        .filter(item => ['Earning', 'Allowance', 'Variable Pay'].includes(item.type))
                        .map((item, idx) => (
                          <div key={idx} className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                            <span>{item.name}</span>
                            <span>{formatCurrency(item.amount, selectedRecord.currency)}</span>
                          </div>
                        ))
                    ) : (
                      <>
                        <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                          <span>Basic Salary</span>
                          <span>{formatCurrency(selectedRecord.basic || 0, selectedRecord.currency)}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                          <span>Bonus & Allowances</span>
                          <span>{formatCurrency((selectedRecord.allowance || 0) + (selectedRecord.bonus || 0), selectedRecord.currency)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between py-1.5 font-bold border-t border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-100">
                      <span>Gross Earnings</span>
                      <span>{formatCurrency(selectedRecord.grossSalary, selectedRecord.currency)}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-1 text-xs">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase border-b pb-1 border-slate-100 dark:border-slate-800">Withholding / Deductions</h4>
                    {selectedRecord.items && selectedRecord.items.length > 0 ? (
                      selectedRecord.items
                        .filter(item => item.type === 'Deduction')
                        .map((item, idx) => (
                          <div key={idx} className={`flex justify-between py-1 ${item.code === 'LOP_DEDUCT' ? 'text-rose-600 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                            <span>{item.name}</span>
                            <span>{formatCurrency(item.amount, selectedRecord.currency)}</span>
                          </div>
                        ))
                    ) : (
                      <>
                        <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                          <span>Income Tax</span>
                          <span>{formatCurrency(selectedRecord.tax || 0, selectedRecord.currency)}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                          <span>Provident Fund</span>
                          <span>{formatCurrency(selectedRecord.pf || 0, selectedRecord.currency)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between py-1.5 font-bold border-t border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-100">
                      <span>Total Withheld</span>
                      <span>{formatCurrency(selectedRecord.totalDeductions, selectedRecord.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Total Summary */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Net Salary Payable</span>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{formatCurrency(selectedRecord.net, selectedRecord.currency)}</h3>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedRecord.status === 'Paid' || selectedRecord.status === 'Processed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>{selectedRecord.status}</span>
                  </div>
                </div>

                {/* Footer terms */}
                <div className="text-center text-[9px] text-slate-400 mt-6 border-t pt-4 border-slate-100 dark:border-slate-800">
                  <p>This is a computer-generated document and does not require a physical signature.</p>
                  <p className="mt-0.5">GlobalTech Solutions Payroll Processing Service Platform. Confidential. © {new Date().getFullYear()}</p>
                </div>
              </div>

              {/* Action Buttons in Modal footer */}
              <div className="flex gap-2 pt-4 border-t dark:border-slate-850 mt-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download size={13} /> Download PDF
                </button>
                <button
                  onClick={() => setShowPayslipModal(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs py-2 font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeePayroll;
