import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/apiService';
import { isPermitted, getFirstAccessibleRoute } from '../utils/permissionUtils';
import { useAuth } from '../hooks/useAuth';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [permissions, setPermissions] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [roleKey, setRoleKey] = useState(null);
  const [roleName, setRoleName] = useState(null);
  const [isCustomOverride, setIsCustomOverride] = useState(false);
  const [landingPage, setLandingPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated) {
      setPermissions(null);
      setIsSuperAdmin(false);
      setRoleKey(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.getMyPermissions();
      const { 
        isSuperAdmin: isSa, 
        permissions: perms, 
        role, 
        roleName: rName, 
        isCustomOverride: isCust, 
        landingPage: lPage 
      } = response.data.data;
      
      setIsSuperAdmin(isSa);
      setPermissions(isSa ? 'FULL_ACCESS' : perms);
      setRoleKey(role ? role.toLowerCase() : null);
      setRoleName(rName || null);
      setIsCustomOverride(isCust || false);
      setLandingPage(lPage || null);
    } catch (err) {
      console.error("Failed to fetch permissions", err);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      fetchPermissions();
    }
  }, [authLoading, isAuthenticated, fetchPermissions]);

  // Expose the same helpers as permissionUtils but bound to current state
  const hasPermission = useCallback((module, action = 'view') => {
    return isPermitted(permissions, module, action);
  }, [permissions]);

  const hasModuleAccess = useCallback((module) => {
    return isPermitted(permissions, module, 'view');
  }, [permissions]);

  return (
    <PermissionContext.Provider value={{ 
      permissions, 
      loading: loading || authLoading, 
      isSuperAdmin, 
      roleKey,
      roleName,
      isCustomOverride,
      landingPage,
      hasPermission,
      hasModuleAccess,
      refreshPermissions: fetchPermissions
    }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => useContext(PermissionContext);
