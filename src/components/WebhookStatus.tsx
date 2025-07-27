import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { webhookService, WebhookStatus as WebhookStatusType } from '@/services/webhookService';
import { Webhook, Download, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface WebhookStatusProps {
  taskId?: string;
}

export const WebhookStatus: React.FC<WebhookStatusProps> = ({ taskId }) => {
  const [status, setStatus] = useState<WebhookStatusType | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const handleStatusUpdate = (newStatus: WebhookStatusType) => {
      setStatus(newStatus);
    };

    webhookService.registerTaskListener(taskId, handleStatusUpdate);

    // Get initial status
    const initialStatus = webhookService.getTaskStatus(taskId);
    if (initialStatus) {
      setStatus(initialStatus);
    }

    return () => {
      webhookService.unregisterTaskListener(taskId);
    };
  }, [taskId]);

  const getStatusIcon = () => {
    if (!status) return <Webhook className="h-4 w-4" />;
    
    switch (status.status) {
      case 'waiting':
        return <Clock className="h-4 w-4 animate-pulse text-yellow-600" />;
      case 'processing':
        return <Download className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Webhook className="h-4 w-4" />;
    }
  };

  const getStatusVariant = () => {
    if (!status) return 'secondary';
    
    switch (status.status) {
      case 'waiting':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!taskId) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Webhook className="h-4 w-4" />
          Task Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Task ID:</span>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {taskId.substring(0, 8)}...
          </code>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge variant={getStatusVariant()}>
            {status?.status || 'Unknown'}
          </Badge>
        </div>

        {status && (
          <>
            <div className="text-sm text-gray-700">
              {status.message}
            </div>
            
            <div className="text-xs text-gray-500">
              Last update: {formatTime(status.lastUpdated)}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};