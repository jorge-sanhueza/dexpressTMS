import React from 'react';
import { AlertCircle, WifiOff, Server, ShieldAlert } from 'lucide-react';
import type { ErrorDisplayProps } from '@/lib/error-handling';
import { cn } from '@/lib/utils';

const getErrorVariantConfig = (variant: ErrorDisplayProps['variant']) => {
  switch (variant) {
    case 'destructive':
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-400',
        titleColor: 'text-red-800',
        textColor: 'text-red-700',
        IconComponent: AlertCircle,
      };
    case 'success':
      return {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-400',
        titleColor: 'text-green-800',
        textColor: 'text-green-700',
        IconComponent: ShieldAlert,
      };
    default:
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-400',
        titleColor: 'text-yellow-800',
        textColor: 'text-yellow-700',
        IconComponent: Server,
      };
  }
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  title = 'Error',
  variant = 'destructive',
  className,
}) => {
  const config = getErrorVariantConfig(variant);

  // Special handling for network errors
  const isNetworkError = message.toLowerCase().includes('conexión') || message.toLowerCase().includes('internet');
  const DisplayIcon = isNetworkError ? WifiOff : config.IconComponent;
  const displayTitle = isNetworkError ? 'Error de Conexión' : title;

  return (
    <div className={cn(
      'rounded-lg border p-4',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <DisplayIcon className={cn('h-5 w-5', config.iconColor)} />
        </div>
        <div className="ml-3">
          <h3 className={cn('text-sm font-medium', config.titleColor)}>
            {displayTitle}
          </h3>
          <div className={cn('mt-1 text-sm', config.textColor)}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};