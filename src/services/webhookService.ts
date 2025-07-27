// Simplified webhook service that focuses on status tracking

interface WebhookStatus {
  taskId: string;
  status: 'waiting' | 'processing' | 'completed' | 'failed';
  message: string;
  lastUpdated: number;
}

class WebhookService {
  private taskStatuses: Map<string, WebhookStatus> = new Map();
  private listeners: Map<string, (status: WebhookStatus) => void> = new Map();

  registerTask(taskId: string) {
    const status: WebhookStatus = {
      taskId,
      status: 'waiting',
      message: 'Task registered, waiting for completion',
      lastUpdated: Date.now()
    };
    
    this.taskStatuses.set(taskId, status);
    this.notifyListeners(taskId, status);
    
    // Auto-cleanup after 15 minutes
    setTimeout(() => {
      this.taskStatuses.delete(taskId);
      this.listeners.delete(taskId);
    }, 15 * 60 * 1000);
  }

  updateTaskStatus(taskId: string, status: 'processing' | 'completed' | 'failed', message: string) {
    const existingStatus = this.taskStatuses.get(taskId);
    if (existingStatus) {
      const updatedStatus: WebhookStatus = {
        ...existingStatus,
        status,
        message,
        lastUpdated: Date.now()
      };
      
      this.taskStatuses.set(taskId, updatedStatus);
      this.notifyListeners(taskId, updatedStatus);
    }
  }

  getTaskStatus(taskId: string): WebhookStatus | null {
    return this.taskStatuses.get(taskId) || null;
  }

  registerTaskListener(taskId: string, callback: (status: WebhookStatus) => void) {
    this.listeners.set(taskId, callback);
    
    // Send current status if available
    const currentStatus = this.taskStatuses.get(taskId);
    if (currentStatus) {
      callback(currentStatus);
    }
  }

  unregisterTaskListener(taskId: string) {
    this.listeners.delete(taskId);
  }

  private notifyListeners(taskId: string, status: WebhookStatus) {
    const listener = this.listeners.get(taskId);
    if (listener) {
      listener(status);
    }
  }

  // Method to mark task as processing when polling starts
  markTaskAsProcessing(taskId: string) {
    this.updateTaskStatus(taskId, 'processing', 'Polling for song completion');
  }

  // Method to mark task as completed when songs are ready
  markTaskAsCompleted(taskId: string, songCount: number) {
    this.updateTaskStatus(taskId, 'completed', `${songCount} song(s) generated and downloaded successfully`);
  }

  // Method to mark task as failed
  markTaskAsFailed(taskId: string, error: string) {
    this.updateTaskStatus(taskId, 'failed', `Task failed: ${error}`);
  }
}

export const webhookService = new WebhookService();
export type { WebhookStatus };