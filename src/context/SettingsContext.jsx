import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../utils/apiService';
import toast, { Toaster } from 'react-hot-toast';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    defaultCurrency: 'USD',
    defaultPhoneCountry: '+91',
    dateFormat: 'DD/MM/YYYY'
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const { data } = await settingsAPI.getSettings();
      if (data?.data) {
        setSettings(data.data);
        localStorage.setItem('hcm_settings', JSON.stringify(data.data));
      }
    } catch (error) {
      console.error('Failed to fetch global settings:', error);
      // Fallback to local storage if API fails
      const stored = localStorage.getItem('hcm_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } finally {
      setLoadingSettings(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const { data } = await settingsAPI.updateSettings(newSettings);
      if (data?.data) {
        setSettings(data.data);
        localStorage.setItem('hcm_settings', JSON.stringify(data.data));
        toast.success(data.message || 'Settings updated globally!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loadingSettings }}>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000, style: { background: `#1e293b`, color: `#fff`, borderRadius: `1rem` } }} />
      {children}
    </SettingsContext.Provider>
  );
};
