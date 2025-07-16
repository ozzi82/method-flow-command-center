import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStatus } from '@/types/task';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export const useTasks = (boardId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user || !boardId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('board_id', boardId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedTasks = data?.map(task => ({
        ...task,
        status: task.status as TaskStatus,
        priority: task.priority as 'low' | 'medium' | 'high',
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        reminderSet: task.reminder_set
      })) || [];
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !boardId) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          due_date: taskData.dueDate?.toISOString(),
          priority: taskData.priority,
          board_id: boardId,
          user_id: user.id,
          reminder_set: taskData.reminderSet || false
        })
        .select()
        .single();

      if (error) throw error;
      
      const formattedTask = {
        ...data,
        status: data.status as TaskStatus,
        priority: data.priority as 'low' | 'medium' | 'high',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        reminderSet: data.reminder_set
      };
      
      setTasks(prev => [formattedTask, ...prev]);
      toast({
        title: "Success",
        description: "Task created successfully"
      });
      
      return formattedTask;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
          due_date: updates.dueDate?.toISOString(),
          priority: updates.priority,
          reminder_set: updates.reminderSet
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      const formattedTask = {
        ...data,
        status: data.status as TaskStatus,
        priority: data.priority as 'low' | 'medium' | 'high',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        reminderSet: data.reminder_set
      };
      
      setTasks(prev => prev.map(task => task.id === id ? formattedTask : task));
      return formattedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, boardId]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  };
};