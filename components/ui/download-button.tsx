import React, { useState } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { cn } from './utils';
import { Button } from './button';

export interface DownloadButtonProps {
  variant?: 'primary' | 'dark' | 'light' | 'dark-rect';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onDownload?: () => void | Promise<void>;
  className?: string;
  children?: React.ReactNode;
}

export function DownloadButton({
  variant = 'primary',
  size = 'md',
  showText = true,
  disabled = false,
  loading = false,
  onDownload,
  className,
  children,
  ...props
}: DownloadButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleClick = async () => {
    if (disabled || downloading || !onDownload) return;

    setDownloading(true);
    try {
      await onDownload();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const isLoading = loading || downloading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#3B82F6] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white border-0';
      case 'dark':
        return 'bg-[#1F2937] hover:bg-[#111827] active:bg-[#0F172A] text-white border-0';
      case 'light':
        return 'bg-[#F8FAFC] hover:bg-[#F1F5F9] active:bg-[#E2E8F0] text-[#3B82F6] border border-[#E2E8F0]';
      case 'dark-rect':
        return 'bg-[#1F2937] hover:bg-[#111827] active:bg-[#0F172A] text-white border-0';
      default:
        return 'bg-[#3B82F6] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white border-0';
    }
  };

  const getSizeStyles = () => {
    const isSquare = !showText || (variant === 'dark' || variant === 'light');
    
    switch (size) {
      case 'sm':
        return isSquare ? 'h-8 w-8 p-0' : 'h-8 px-3 py-1.5';
      case 'lg':
        return isSquare ? 'h-12 w-12 p-0' : 'h-12 px-6 py-3';
      default: // md
        return isSquare ? 'h-10 w-10 p-0' : 'h-10 px-4 py-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  const shouldShowText = showText && variant !== 'dark' && variant !== 'light';

  return (
    <Button
      className={cn(
        'rounded-lg font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-sm',
        getVariantStyles(),
        getSizeStyles(),
        isLoading && 'cursor-wait',
        downloaded && 'cursor-default',
        className
      )}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      <div className={cn(
        'flex items-center justify-center',
        shouldShowText ? 'gap-2' : ''
      )}>
        {shouldShowText && !isLoading && !downloaded && (
          <span className="font-medium">
            {children || 'Download'}
          </span>
        )}
        
        {shouldShowText && isLoading && (
          <>
            <span className="font-medium">Downloading...</span>
            <Loader2 className={cn(getIconSize(), 'animate-spin')} />
          </>
        )}
        
        {shouldShowText && downloaded && (
          <>
            <span className="font-medium">Downloaded</span>
            <Check className={getIconSize()} />
          </>
        )}
        
        {!shouldShowText && (
          <>
            {isLoading && <Loader2 className={cn(getIconSize(), 'animate-spin')} />}
            {downloaded && <Check className={getIconSize()} />}
            {!isLoading && !downloaded && <ChevronDown className={getIconSize()} />}
          </>
        )}
        
        {shouldShowText && !isLoading && !downloaded && (
          <ChevronDown className={getIconSize()} />
        )}
      </div>
    </Button>
  );
}

// Convenience components for specific variants
export const PrimaryDownloadButton = (props: Omit<DownloadButtonProps, 'variant'>) => (
  <DownloadButton variant="primary" {...props} />
);

export const DarkDownloadButton = (props: Omit<DownloadButtonProps, 'variant'>) => (
  <DownloadButton variant="dark" showText={false} {...props} />
);

export const LightDownloadButton = (props: Omit<DownloadButtonProps, 'variant'>) => (
  <DownloadButton variant="light" showText={false} {...props} />
);

export const DarkRectDownloadButton = (props: Omit<DownloadButtonProps, 'variant'>) => (
  <DownloadButton variant="dark-rect" {...props} />
);
