import { useState, useCallback } from 'react';
import type { AlertType } from '../components/AlertModal';

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
}

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = useCallback((type: AlertType, title: string, message: string) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message,
    });
  }, []);

  const showSuccess = useCallback((message: string, title: string = 'Succes!') => {
    showAlert('success', title, message);
  }, [showAlert]);

  const showError = useCallback((message: string, title: string = 'Eroare!') => {
    showAlert('error', title, message);
  }, [showAlert]);

  const showWarning = useCallback((message: string, title: string = 'Atenție!') => {
    showAlert('warning', title, message);
  }, [showAlert]);

  const showInfo = useCallback((message: string, title: string = 'Informație') => {
    showAlert('info', title, message);
  }, [showAlert]);

  const closeAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    alert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeAlert,
  };
};

