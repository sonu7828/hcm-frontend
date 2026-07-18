import React, { useState, useEffect } from 'react';
import api from '../../utils/apiService';
import { DollarSign, TrendingUp, Calendar, Download, FileText, CheckCircle } from 'lucide-react';
import CenterModal from '../../shared/components/layout/CenterModal';
import { useCurrency } from '../../hooks/useCurrency';
import { useDateFormat } from '../../hooks/useDateFormat';
import { useEmployee } from '../../context/EmployeeContext';
import DatePicker from '../../shared/components/common/DatePicker';

const EmployeePayroll = () => {
  const [compensation, setCompensation] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { formatCurrency, getSymbol } = useCurrency();
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
    const content = `====================================================
               HCM PAYSLIP - ${s.month.toUpperCase()} 2026
====================================================
Employee Name:  ${compensation?.employee?.fullName || 'Employee'}
Employee ID:    ${compensation?.employee?.employeeId || '-'}
----------------------------------------------------
Gross Salary:   ${formatCurrency(s.grossSalary)}
Total Deductions: -${formatCurrency(s.totalDeductions)}
Net Pay:        ${formatCurrency(s.netSalary)}
----------------------------------------------------
Status:         ${s.status}
Generated On:   ${formatDate(s.createdAt)}
====================================================
Thank you for your hard work!
====================================================`;

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Payslip_${s.month}_2026.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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


    </div>
  );
};

export default EmployeePayroll;
