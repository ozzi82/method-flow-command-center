import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Board } from '@/types/board';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export const useBoards = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBoards = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedBoards = data?.map(board => ({
        ...board,
        createdAt: new Date(board.created_at),
        updatedAt: new Date(board.updated_at)
      })) || [];
      
      setBoards(formattedBoards);
    } catch (error) {
      console.error('Error fetching boards:', error);
      toast({
        title: "Error",
        description: "Failed to fetch boards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (name: string, description: string, color: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('boards')
        .insert({
          name,
          description,
          color,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      const formattedBoard = {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      setBoards(prev => [formattedBoard, ...prev]);
      toast({
        title: "Success",
        description: "Board created successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating board:', error);
      toast({
        title: "Error",
        description: "Failed to create board",
        variant: "destructive"
      });
    }
  };

  const updateBoard = async (id: string, updates: Partial<Board>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('boards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      const formattedBoard = {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      setBoards(prev => prev.map(board => board.id === id ? formattedBoard : board));
      return data;
    } catch (error) {
      console.error('Error updating board:', error);
      toast({
        title: "Error",
        description: "Failed to update board",
        variant: "destructive"
      });
    }
  };

  const deleteBoard = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setBoards(prev => prev.filter(board => board.id !== id));
      toast({
        title: "Success",
        description: "Board deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting board:', error);
      toast({
        title: "Error",
        description: "Failed to delete board",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [user]);

  return {
    boards,
    loading,
    createBoard,
    updateBoard,
    deleteBoard,
    refetch: fetchBoards
  };
};