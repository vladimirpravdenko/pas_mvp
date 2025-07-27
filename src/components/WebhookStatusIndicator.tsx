import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Webhook } from 'lucide-react';

interface WebhookStatusIndicatorProps {
  status: 'waiting' | 'processing' | 'completed' | 'failed' | 'unknown';
  message?: string;
  compact?: boolean;
}

export const WebhookStatusIndicator: React.FC<WebhookStatusIndicatorProps> = ({ 
  status, 
  message, 
  compact = false 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'waiting':
        return {
          icon: <Clock className="h-3 w-3 animate-pulse" />,
          variant: 'secondary' as const,
          color: 'text-yellow-600',
          label: 'Waiting'
        };
      case 'processing':
        return {
          icon: <Webhook className="h-3 w-3 animate-spin" />,
          variant: 'default' as const,
          color: 'text-blue-600',
          label: 'Processing'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          variant: 'default' as const,
          color: 'text-green-600',
          label: 'Completed'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          variant: 'destructive' as const,
          color: 'text-red-600',
          label: 'Failed'
        };
      default:
        return {
          icon: <Webhook className="h-3 w-3" />,
          variant: 'outline' as const,
          color: 'text-gray-500',
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <span className={config.color}>{config.icon}</span>
        <span className="text-xs text-gray-600">{config.label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </div>
  );
};