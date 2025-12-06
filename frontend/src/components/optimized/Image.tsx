import React, { useState, useMemo } from 'react';
import { getImageUrl } from '../../config';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lazy?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

const OptimizedImage: React.FC<ImageProps> = ({
  src,
  alt,
  fallbackSrc = '/placeholder-image.jpg',
  lazy = true,
  width,
  height,
  className = '',
  objectFit = 'cover',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Utiliser useMemo pour mémoriser l'URL de l'image
  const imageUrl = useMemo(() => {
    if (!src || hasError) return fallbackSrc;
    return getImageUrl(src);
  }, [src, hasError, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const imageStyle = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
    objectFit,
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        width: imageStyle.width,
        height: imageStyle.height,
        backgroundColor: isLoading ? '#f3f4f6' : 'transparent',
      }}
    >
      <img
        src={imageUrl}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          ...imageStyle,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
        className={`w-full h-full ${className}`}
        {...props}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MemoizedImage = React.memo(OptimizedImage, (prevProps, nextProps) => {
  // Ne pas re-rendre si les props importantes n'ont pas changé
  return prevProps.src === nextProps.src && 
         prevProps.alt === nextProps.alt &&
         prevProps.className === nextProps.className;
});

export default OptimizedImage;
