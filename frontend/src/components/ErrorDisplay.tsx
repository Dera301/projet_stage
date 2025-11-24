import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { getErrorMessage, getErrorClasses, isMobileDevice } from '../utils/errorHandler';

interface ErrorDisplayProps {
  error: any;
  onClose?: () => void;
  defaultMessage?: string;
  variant?: 'error' | 'warning' | 'info' | 'success';
  autoClose?: boolean;
  duration?: number;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onClose,
  defaultMessage,
  variant = 'error',
  autoClose = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const errorInfo = getErrorMessage(error, defaultMessage);
  const isMobile = isMobileDevice();

  React.useEffect(() => {
    if (autoClose && variant !== 'error') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose, variant]);

  if (!isVisible) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600',
          iconBg: 'bg-green-100',
          iconComponent: CheckCircleIcon
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          iconComponent: ExclamationTriangleIcon
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          iconComponent: InformationCircleIcon
        };
      default:
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          iconComponent: ExclamationTriangleIcon
        };
    }
  };

  const styles = getVariantStyles();
  const IconComponent = styles.iconComponent;
  const classes = getErrorClasses();

  return (
    <div
      className={`${classes} ${styles.bg} border-2 ${styles.text} animate-slide-in`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.iconBg} rounded-full p-2`}>
          <IconComponent className={`h-5 w-5 ${styles.icon}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          {errorInfo.title && (
            <h3 className={`text-sm font-semibold ${styles.text} mb-1`}>
              {errorInfo.icon} {errorInfo.title}
            </h3>
          )}
          <p className={`text-sm ${styles.text} ${isMobile ? 'text-xs' : ''}`}>
            {errorInfo.message}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            className={`ml-4 inline-flex rounded-md ${styles.text} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${variant === 'error' ? 'red' : variant === 'warning' ? 'yellow' : variant === 'info' ? 'blue' : 'green'}-500`}
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            aria-label="Fermer"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;

