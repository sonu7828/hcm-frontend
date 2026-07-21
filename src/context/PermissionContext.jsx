import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/apiService';
import { isPermitted, getFirstAccessibleRoute } from '../utils/permissionUtils';
import { useAuth } from '../hooks/useAuth';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [permissions, setPermissions] = useState(null);
  const [employeePermissions, setEmployeePermissions] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [roleKey, setRoleKey] = useState(null);
  const [roleName, setRoleName] = useState(null);
  const [isCustomOverride, setIsCustomOverride] = useState(false);
  const [landingPage, setLandingPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated) {
      setPermissions(null);
      setEmployeePermissions(null);
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
        employeePermissions: empPerms,
        role, 
        roleName: rName, 
        isCustomOverride: isCust, 
        landingPage: lPage 
      } = response.data.data;
      
      setIsSuperAdmin(isSa);
      setPermissions(isSa ? 'FULL_ACCESS' : perms);
      setEmployeePermissions(isSa ? 'FULL_ACCESS' : empPerms);
      setRoleKey(role ? role.toLowerCase() : null);
      setRoleName(rName || null);
      setIsCustomOverride(isCust || false);
      setLandingPage(lPage || null);
    } catch (err) {
      console.error("Failed to fetch permissions", err);
      setPermissions([]);
      setEmployeePermissions([]);
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
  const hasPermission = useCallback((module, action = 'view', scope = null) => {
    if (scope === 'employee' && employeePermissions) {
      return isPermitted(employeePermissions, module, action);
    }
    return isPermitted(permissions, module, action);
  }, [permissions, employeePermissions]);

  const hasModuleAccess = useCallback((module, scope = null) => {
    if (scope === 'employee' && employeePermissions) {
      return isPermitted(employeePermissions, module, 'view');
    }
    return isPermitted(permissions, module, 'view');
  }, [permissions, employeePermissions]);

  return (
    <PermissionContext.Provider value={{ 
      permissions, 
      employeePermissions,
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
