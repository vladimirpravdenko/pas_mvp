import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface TaskMapping {
  id: number;
  task_id: string;
  suno_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export const TaskMappingViewer: React.FC = () => {
  const [mappings, setMappings] = useState<TaskMapping[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_mapping')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMappings(data || []);
    } catch (error) {
      console.error('Error fetching task mappings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Task ID Mappings</CardTitle>
        <Button onClick={fetchMappings} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mappings.map((mapping) => (
            <div key={mapping.id} className="p-3 border rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Task ID:</strong> {mapping.task_id}</div>
                <div><strong>Suno ID:</strong> {mapping.suno_id || 'Pending'}</div>
                <div><strong>Title:</strong> {mapping.title}</div>
                <div><strong>Status:</strong> {mapping.suno_id ? 'Mapped' : 'Waiting'}</div>
              </div>
            </div>
          ))}
          {mappings.length === 0 && !loading && (
            <p className="text-muted-foreground text-center py-4">No task mappings found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};