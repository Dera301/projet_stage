import { useState, useCallback } from 'react';
import { getErrorMessage, formatErrorForDisplay } from '../utils/errorHandler';
import toast from 'react-hot-toast';

interface UseErrorHandlerReturn {
  handleError: (error: any, defaultMessage?: string) => void;
  showError: (error: any, defaultMessage?: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

/**
 * Hook pour gérer les erreurs de manière cohérente dans l'application
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const handleError = useCallback((error: any, defaultMessage?: string) => {
    const errorInfo = getErrorMessage(error, defaultMessage);
    const message = formatErrorForDisplay(error, defaultMessage);
    
    // Utiliser react-hot-toast avec un style adapté
    toast.error(message, {
      duration: errorInfo.title === 'Erreur serveur' ? 6000 : 4000,
      icon: errorInfo.icon,
      style: {
        borderRadius: '8px',
        background: '#fee2e2',
        color: '#991b1b',
        padding: '16px',
        fontSize: '14px',
        maxWidth: window.innerWidth < 768 ? '90%' : '400px',
      },
      position: window.innerWidth < 768 ? 'bottom-center' : 'top-right',
    });
  }, []);

  const showError = useCallback((error: any, defaultMessage?: string) => {
    handleError(error, defaultMessage);
  }, [handleError]);

  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        borderRadius: '8px',
        background: '#dcfce7',
        color: '#166534',
        padding: '16px',
        fontSize: '14px',
        maxWidth: window.innerWidth < 768 ? '90%' : '400px',
      },
      position: window.innerWidth < 768 ? 'bottom-center' : 'top-right',
    });
  }, []);

  const showWarning = useCallback((message: string) => {
    toast(message, {
      icon: '⚠️',
      duration: 4000,
      style: {
        borderRadius: '8px',
        background: '#fef3c7',
        color: '#92400e',
        padding: '16px',
        fontSize: '14px',
        maxWidth: window.innerWidth < 768 ? '90%' : '400px',
      },
      position: window.innerWidth < 768 ? 'bottom-center' : 'top-right',
    });
  }, []);

  const showInfo = useCallback((message: string) => {
    toast(message, {
      icon: 'ℹ️',
      duration: 3000,
      style: {
        borderRadius: '8px',
        background: '#dbeafe',
        color: '#1e40af',
        padding: '16px',
        fontSize: '14px',
        maxWidth: window.innerWidth < 768 ? '90%' : '400px',
      },
      position: window.innerWidth < 768 ? 'bottom-center' : 'top-right',
    });
  }, []);

  return {
    handleError,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
};

