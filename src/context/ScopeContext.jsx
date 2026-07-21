import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissionContext } from './PermissionContext';

const ScopeContext = createContext();

export const ScopeProvider = ({ children }) => {
  const { isAuthenticated, effectiveRole } = useAuth();
  const { roleKey, isSuperAdmin, loading: permLoading } = usePermissionContext();
  
  const [currentScope, setCurrentScope] = useState(null);
  
  // Resolve base functional scope from permission or auth
  const resolvedRoleKey = isSuperAdmin ? 'superadmin' : (roleKey || effectiveRole?.toLowerCase() || 'employee');
  
  useEffect(() => {
    if (!isAuthenticated || permLoading) return;
    
    // Check if session has saved scope
    const savedScope = sessionStorage.getItem('hcm_current_scope');
    
    // If we have a saved scope, use it, otherwise default to functional scope
    if (savedScope) {
      setCurrentScope(savedScope);
    } else {
      setCurrentScope(resolvedRoleKey);
      sessionStorage.setItem('hcm_current_scope', resolvedRoleKey);
    }
  }, [isAuthenticated, permLoading, resolvedRoleKey]);
  
  // Ensure that on logout, the session storage is cleared - this is handled in AuthContext logout,
  // but we provide a clean method to switch scope here.
  const switchScope = (newScope) => {
    setCurrentScope(newScope);
    sessionStorage.setItem('hcm_current_scope', newScope);
  };
  
  // User can switch scope if they are NOT in these fundamental roles
  const canSwitchScope = !['employee', 'candidate', 'admin', 'superadmin'].includes(resolvedRoleKey);

  // If they cannot switch scope, force currentScope to always be their resolvedRoleKey
  const activeScope = canSwitchScope ? (currentScope || resolvedRoleKey) : resolvedRoleKey;

  return (
    <ScopeContext.Provider value={{ 
      currentScope: activeScope, 
      switchScope,
      baseFunctionalScope: resolvedRoleKey,
      canSwitchScope
    }}>
      {children}
    </ScopeContext.Provider>
  );
};

export const useScope = () => useContext(ScopeContext);
