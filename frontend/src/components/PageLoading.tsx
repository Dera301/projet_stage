import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoadingProps {
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({
  text = 'Chargement en cours...',
  fullScreen = true,
  className = '',
}) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center ${
        fullScreen ? 'min-h-screen' : 'py-16'
      } ${className}`}
    >
      <LoadingSpinner size="large" className="mb-4" />
      <p className="text-gray-600 text-lg font-medium">{text}</p>
      <div className="mt-4 text-sm text-gray-500">
        Veuillez patienter...
      </div>
    </div>
  );
};

export default React.memo(PageLoading);
