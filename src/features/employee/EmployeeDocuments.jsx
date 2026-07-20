import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Search, Plus, Download, Eye, CheckCircle2, AlertCircle, Clock, 
  Upload, X, File, Image as ImageIcon, FileJson, Filter, Trash2, Share2, Calendar, CloudUpload
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEmployee } from '../../context/EmployeeContext';
import CenterModal from '../../shared/components/layout/CenterModal';

const EmployeeDocuments = () => {
  const { documents, uploadDoc, deleteDoc, showToast } = useEmployee();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [fileSize, setFileSize] = useState('0 KB');

  const stats = [
    { label: 'Total Files', value: documents.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Cloud Space', value: '1.2 GB', icon: CloudUpload, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Verified', value: documents.filter(doc => doc.verified !== false).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Access Ready', value: 'Instant', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const categories = ['All', 'ID Proof', 'Contracts', 'Education', 'Benefits', 'Medical', 'Other'];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'All' || doc.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setDocName(file.name);
      // Format file size
      const kb = file.size / 1024;
      const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
      setFileSize(sizeStr);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!docName) {
      showToast('Please select a file or set a name', 'error');
      return;
    }
    const formData = new FormData(e.target);
    const newDoc = {
      name: docName,
      category: formData.get('category'),
      size: fileSize,
      fileBase64: fileBase64 || null
    };
    await uploadDoc(newDoc);
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setDocName('');
    setFileBase64('');
    setFileSize('0 KB');
  };

  const handleDownloadZip = () => {
    if (documents.length === 0) {
      showToast('No documents in vault to export', 'error');
      return;
    }
    let content = "HCM Secure Vault Index\n======================\n\n";
    documents.forEach(doc => {
      content += `[${doc.category}] ${doc.name} (${doc.size}) - Created: ${doc.date}\nURL: ${doc.url}\n\n`;
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Vault_Zip_Index.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Vault index downloaded successfully');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Records & Vault</h1>
          <p className="text-slate-500 font-bold tracking-tight">Enterprise-grade secure storage for your career documents</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button onClick={handleDownloadZip} className="btn-secondary px-6 py-2.5 font-black uppercase tracking-widest flex justify-center items-center gap-2">
            <Download size={18} />
            <span>Vault Zip</span>
          </button>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary px-8 py-2.5 font-black uppercase tracking-widest flex justify-center items-center gap-2 shadow-xl shadow-primary-200"
          >
             <CloudUpload size={18} />
             <span>Upload File</span>
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

      {/* Filtering & Listing */}
      <div className="space-y-8">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 w-full">
            <div className="flex flex-wrap items-center gap-2 w-full max-w-full min-w-0">
               {categories.map((cat, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                       "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap",
                       activeCategory === cat ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-y-[-2px]" : "bg-white text-slate-400 border border-slate-100 hover:border-primary-200"
                    )}
                  >
                     {cat}
                  </button>
               ))}
            </div>
            <div className="relative w-full lg:w-96">
               <Search className="absolute left-4 top-3 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search by file name..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-white border border-slate-100 rounded-xl pl-12 pr-4 h-12 text-xs font-bold w-full focus:ring-2 focus:ring-primary-50 outline-none transition-all shadow-sm" 
               />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
               <motion.div
                 layout
                 key={doc.id}
                 className="card p-6 bg-white border border-slate-50 shadow-soft group hover:shadow-xl transition-all relative overflow-hidden"
               >
                  <div className="flex items-start justify-between relative z-10 text-left">
                     <div className={cn(
                        "w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform",
                        doc.name.endsWith('.pdf') ? "bg-rose-500" : "bg-primary-600"
                     )}>
                        <FileText size={24} />
                     </div>
                      <div className="flex items-center gap-1 transition-opacity">
                        <button onClick={() => window.open(doc.url, '_blank')} className="p-2.5 bg-slate-50 text-slate-400 hover:text-primary-600 rounded-xl transition-all"><Eye size={16} /></button>
                        <button onClick={() => deleteDoc(doc.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                  </div>
                  <div className="text-left relative z-10">
                     <h4 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-2 dark:text-white">{doc.name}</h4>
                     <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.category} • {doc.size}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                           <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-emerald-100">Verified</span>
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic sm:ml-auto">Added: {doc.date}</span>
                        </div>
                     </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                     <FileText size={120} />
                  </div>
               </motion.div>
            )) : (
              <div className="col-span-full py-32 text-center card bg-slate-50/30 border-dashed border-2 border-slate-100">
                 <div className="flex flex-col items-center gap-4 text-slate-300">
                    <CloudUpload size={64} className="animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No documents found in vault</p>
                 </div>
              </div>
            )}
         </div>
      </div>

      {/* Upload Modal */}
      <CenterModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Vault Entry">
          <form onSubmit={handleUploadSubmit} className="p-8 space-y-8 text-left">
            <input type="file" id="vault-file-input" onChange={handleFileChange} style={{ display: 'none' }} />
            <div 
               onClick={() => document.getElementById('vault-file-input').click()} 
               className="div-drop p-6 sm:p-12 border-4 border-dashed border-slate-50 rounded-[2.5rem] bg-slate-50/50 text-center space-y-4 group hover:border-primary-100 hover:bg-primary-50/5 transition-all cursor-pointer"
            >
               <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-200 group-hover:text-primary-500 transform group-hover:rotate-12 transition-all duration-700">
                  <CloudUpload size={40} />
               </div>
               <div>
                  <p className="text-sm font-black text-slate-900">{selectedFile ? `Selected: ${selectedFile.name}` : 'Drag files or click to upload'}</p>
                  <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest leading-none">{selectedFile ? `Size: ${fileSize}` : 'Max file size: 50MB'}</p>
               </div>
               <button type="button" className="px-8 py-3 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-premium border border-slate-50 hover:scale-105 active:scale-95 transition-all">Browse Securely</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Document Name</label>
                  <input name="name" type="text" value={docName} onChange={(e) => setDocName(e.target.value)} required placeholder="Tax_Report_2024.pdf" className="input-field h-14 bg-slate-50 border-transparent font-black" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Classification</label>
                  <select name="category" className="input-field h-14 bg-slate-50 border-transparent font-black">
                     {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
               </div>
            </div>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
               <button type="button" onClick={() => setIsUploadModalOpen(false)} className="w-full sm:flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest">Cancel</button>
               <button type="submit" className="w-full sm:flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200">Commit to Vault</button>
            </div>
         </form>
      </CenterModal>
    </div>
  );
};

export default EmployeeDocuments;
