import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
   ShieldCheck,
   Lock,
   Eye,
   Plus,
   Search,
   Filter,
   Save,
   Check,
   X,
   ChevronDown,
   ChevronRight,
   Users,
   Settings,
   FileText,
   DollarSign,
   Zap,
   Activity,
   Layout,
   Database,
   LockKeyhole,
   Copy,
   Info,
   Layers,
   Trash2,
   LayoutDashboard,
   Building2,
   CreditCard,
   Calendar,
   CalendarDays,
   Bot,
   Scale,
   Plug,
   Receipt,
   FileSearch,
   BarChart2,
   Briefcase,
   GitMerge,
   UserCheck,
   MessageSquare,
   Clock,
   CheckSquare,
   Target,
   ClipboardList,
   Star,
   User,
   Gift,
   BookOpen,
   Bell,
   Edit3
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { usePermissionContext } from '../../context/PermissionContext';
import { cn } from '../../utils/cn';
import RoleModal from '../../shared/components/admin/RoleModal';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';

import { ROLE_MODULES, MODULE_ACTIONS, resolveDependencies } from '../../utils/permissionsConfig';

const getModulesForRole = (roleName) => {
   const normalized = (roleName || '').toUpperCase();
   return ROLE_MODULES[normalized] || ROLE_MODULES.EMPLOYEE;
};

const RolesPermissions = () => {
   const { roles, users, deleteRole, updateRole, showToast } = useAdmin();
   const { refreshPermissions } = usePermissionContext();
   const { pathname } = useLocation();

   const isAdminPanel = pathname.startsWith('/admin');
   const displayRoles = roles.filter(r => {
      const isSuperAdminRole = r.name === 'Super Admin' || r.name === 'SUPERADMIN';
      const isAdminRole = r.name === 'Admin' || r.name === 'ADMIN';
      
      if (isAdminPanel) {
         return !isSuperAdminRole && !isAdminRole;
      } else {
         return !isSuperAdminRole;
      }
   });

   // State
   const [searchTerm, setSearchTerm] = useState('');
   const [showRoleList, setShowRoleList] = useState(false);
   const [selectedRoleName, setSelectedRoleName] = useState('Admin');
   const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
   const [roleToEdit, setRoleToEdit] = useState(null);
   const [roleToDelete, setRoleToDelete] = useState(null);
   const [isSavingMatrix, setIsSavingMatrix] = useState(false);
   const [matrixPermissions, setMatrixPermissions] = useState({});

   // Derived
   const filteredRoles = displayRoles.filter(r =>
      (r.name || '').toLowerCase().includes(searchTerm.toLowerCase())
   );

   const currentRole = displayRoles.find(r => r.name === selectedRoleName) || displayRoles[0];
   const modules = getModulesForRole(currentRole?.inheritsFrom || currentRole?.name);

   useEffect(() => {
      if (currentRole) {
         setMatrixPermissions(currentRole.permissions || {});
      }
   }, [currentRole]);

   const handleUpdatePermissions = async () => {
      if (!currentRole) return;
      setIsSavingMatrix(true);
      try {
         await updateRole(currentRole.id, {
            ...currentRole,
            permissions: matrixPermissions
         });
         await refreshPermissions(); // Immediately apply if changing own role
         showToast(`${currentRole.name} permissions matrix updated and synced company-wide!`, 'success');
      } catch (err) {
         console.error(err);
         showToast('Failed to update permissions.', 'error');
      } finally {
         setIsSavingMatrix(false);
      }
   };

   const activeCount = (role) =>
      users.filter(u =>
         (u.role || '').toLowerCase() === (role.name || '').toLowerCase() &&
         u.status === 'Active'
      ).length;

   return (
      <div className="space-y-8 pb-12 animate-fade-in relative focus:outline-none text-left">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Roles &amp; Permissions</h1>
               <p className="text-slate-500 font-medium tracking-tight">Granular access control and permission management for all platform roles</p>
            </div>
            {isAdminPanel && (
               <div className="flex items-center gap-3">
                  <button
                     onClick={() => { setRoleToEdit(null); setIsRoleModalOpen(true); }}
                     className="btn-primary px-8 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200 cursor-pointer"
                  >
                     <Plus size={18} />
                     <span>Create Custom Role</span>
                  </button>
               </div>
            )}
         </div>

         {/* Search + Mobile toggle */}
         <div className="flex items-center gap-3">
            <div className="relative flex-1 text-slate-400">
               <Search className="absolute left-3 top-3" size={18} />
               <input
                  type="text"
                  placeholder="Search roles..."
                  className="input-field pl-10 h-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            {/* Show roles list toggle (mobile only) */}
            <button
               onClick={() => setShowRoleList(prev => !prev)}
               className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all h-11 w-11 flex items-center justify-center shrink-0 lg:hidden"
               title="Toggle Roles List"
            >
               <Filter size={18} />
            </button>
         </div>

         {/* Main Grid */}
         <div className="flex flex-col gap-8 items-start">

            {/* Roles Row — always visible on lg, toggled on mobile */}
            <div className={cn('w-full space-y-4', showRoleList ? 'block' : 'hidden lg:block')}>
               <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 px-2">Platform Roles</h3>
               <div className="flex flex-wrap items-center gap-4 pb-4">
                  {filteredRoles.map((role) => (
                     <div key={role.id} className="relative group/role w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[280px]">
                        <button
                           onClick={() => { setSelectedRoleName(role.name); setShowRoleList(false); }}
                           className={cn(
                              'w-full p-5 rounded-3xl text-left transition-all border group flex items-center justify-between cursor-pointer',
                              currentRole?.name === role.name
                                 ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-700 text-white shadow-xl shadow-slate-200 dark:shadow-none'
                                 : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm',
                              role.isCustom && 'pr-20'
                           )}
                        >
                           <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-3 mb-1">
                                 <ShieldCheck
                                    size={18}
                                    className={cn(currentRole?.name === role.name ? 'text-primary-450' : 'text-slate-300 dark:text-slate-700')}
                                 />
                                 <span className="text-base font-bold tracking-tight truncate">{role.name}</span>
                                 {role.isCustom && (
                                    <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded ml-2">Custom</span>
                                 )}
                              </div>
                              <p className={cn('text-[10px] font-bold uppercase tracking-widest mt-1', currentRole?.name === role.name ? 'text-white/40' : 'text-slate-400')}>
                                 {role.isCustom && role.inheritsFrom ? `Inherits: ${role.inheritsFrom} | ` : ''}{role.assignedUsersCount || activeCount(role)} Active Users
                              </p>
                           </div>
                        </button>

                        {/* Custom role edit/delete */}
                        {role.isCustom && (
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                              <button
                                 onClick={(e) => { e.stopPropagation(); setRoleToEdit(role); setIsRoleModalOpen(true); }}
                                 className={cn(
                                    'p-1.5 rounded-lg border transition-all shadow-sm cursor-pointer',
                                    currentRole?.name === role.name
                                       ? 'bg-slate-800 dark:bg-slate-700 border-slate-700 dark:border-slate-600 text-white/80 hover:text-white hover:bg-slate-700'
                                       : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-primary-600 hover:bg-white'
                                 )}
                              >
                                 <Edit3 size={14} />
                              </button>
                              <button
                                 onClick={(e) => { e.stopPropagation(); setRoleToDelete(role); }}
                                 className={cn(
                                    'p-1.5 rounded-lg border transition-all shadow-sm cursor-pointer',
                                    currentRole?.name === role.name
                                       ? 'bg-slate-800 dark:bg-slate-700 border-slate-700 dark:border-slate-600 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 hover:border-rose-950/50'
                                       : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-white'
                                 )}
                              >
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>

            {/* Permissions Matrix */}
            <div className="w-full space-y-6">
               <div className="card p-0 bg-white dark:bg-slate-900 border-none shadow-soft overflow-hidden">
                  <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/10 dark:bg-slate-800/10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-lg transform -rotate-3">
                           <LockKeyhole size={22} />
                        </div>
                        <div>
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{currentRole?.name} Permissions Matrix</h3>
                           <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">Configure module access &amp; capabilities</p>
                        </div>
                     </div>
                     <button
                        onClick={handleUpdatePermissions}
                        disabled={isSavingMatrix}
                        className={cn(
                           'flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 cursor-pointer',
                           isSavingMatrix && 'opacity-80 cursor-not-allowed scale-95'
                        )}
                     >
                        {isSavingMatrix
                           ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                           : <Save size={18} />
                        }
                        <span>{isSavingMatrix ? 'Updating...' : 'Update'}</span>
                     </button>
                  </div>

                  <div className="p-0 overflow-x-auto no-scrollbar">
                     <table className="w-full text-left min-w-[800px]">
                        <thead>
                           <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                              <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] w-[30%]">Module</th>
                              <th className="px-4 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center w-[10%]">View</th>
                              <th className="px-4 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center w-[10%]">Create</th>
                              <th className="px-4 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center w-[10%]">Edit</th>
                              <th className="px-4 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center w-[10%]">Delete</th>
                              <th className="px-4 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center w-[15%]">Approve</th>
                              <th className="px-4 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center w-[15%]">Manage</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                           {modules.map((mod) => {
                              const availActions = MODULE_ACTIONS[mod.id] || ['view'];
                              const activePerms = matrixPermissions[mod.id] || [];
                              return (
                                 <tr key={mod.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                    <td className="px-8 py-6">
                                       <div className="flex items-center gap-3">
                                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight">{mod.label}</span>
                                       </div>
                                    </td>
                                    {['view', 'create', 'edit', 'delete', 'approve', 'manage'].map((action) => {
                                       const isAvail = availActions.includes(action);
                                       const isChecked = activePerms.includes(action);
                                       return (
                                          <td key={action} className="px-4 py-6 text-center">
                                             <div className="flex items-center justify-center">
                                                {isAvail ? (
                                                   <button
                                                      onClick={() => {
                                                         if (!currentRole) return;
                                                         let updatedPerms = [...activePerms];
                                                         if (updatedPerms.includes(action)) {
                                                            updatedPerms = updatedPerms.filter(a => a !== action);
                                                            if (action === 'view') updatedPerms = [];
                                                         } else {
                                                            updatedPerms.push(action);
                                                            updatedPerms = resolveDependencies(updatedPerms);
                                                         }
                                                         setMatrixPermissions(prev => ({
                                                            ...prev,
                                                            [mod.id]: updatedPerms
                                                         }));
                                                      }}
                                                      className={cn(
                                                         'w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all active:scale-95 cursor-pointer',
                                                         isChecked
                                                            ? 'bg-primary-600 border-primary-600 shadow-lg shadow-primary-200 text-white'
                                                            : 'border-slate-400 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 hover:border-primary-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500'
                                                      )}
                                                   >
                                                      {isChecked && <Check size={14} strokeWidth={3} />}
                                                   </button>
                                                ) : <span className="text-slate-200">-</span>}
                                             </div>
                                          </td>
                                       );
                                    })}
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

         </div>

         <RoleModal
            isOpen={isRoleModalOpen}
            onClose={() => { setIsRoleModalOpen(false); setRoleToEdit(null); }}
            roleToEdit={roleToEdit}
         />

         <ConfirmDialog
            isOpen={!!roleToDelete}
            onClose={() => setRoleToDelete(null)}
            onConfirm={() => deleteRole(roleToDelete.id)}
            title="Delete Custom Role"
            message={`Are you sure you want to delete the ${roleToDelete?.name} role? This will affect all assigned users and may result in loss of access.`}
         />
      </div>
   );
};

export default RolesPermissions;
