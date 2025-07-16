import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  method_crm_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (contactData: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Contact created successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: "Error",
        description: "Failed to create contact",
        variant: "destructive"
      });
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => prev.map(contact => contact.id === id ? data : contact));
      return data;
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive"
      });
    }
  };

  const deleteContact = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast({
        title: "Success",
        description: "Contact deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  return {
    contacts,
    loading,
    createContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts
  };
};