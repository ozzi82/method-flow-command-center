import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import { Task } from '@/types/task';

export const useMethodCRM = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const syncContacts = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to sync contacts",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('method-crm-sync', {
        body: {
          action: 'sync_contacts',
          user_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Synced ${data.count} contacts from Method CRM`
      });

      return data;
    } catch (error) {
      console.error('Error syncing contacts:', error);
      toast({
        title: "Error",
        description: "Failed to sync contacts from Method CRM",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTaskInMethodCRM = async (task: Task) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('method-crm-sync', {
        body: {
          action: 'create_activity',
          data: task,
          user_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task synced to Method CRM"
      });

      return data;
    } catch (error) {
      console.error('Error creating task in Method CRM:', error);
      toast({
        title: "Warning",
        description: "Task created locally but failed to sync to Method CRM",
        variant: "destructive"
      });
    }
  };

  const getSyncStatus = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('method_sync')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sync status:', error);
      return [];
    }
  };

  return {
    loading,
    syncContacts,
    createTaskInMethodCRM,
    getSyncStatus
  };
};