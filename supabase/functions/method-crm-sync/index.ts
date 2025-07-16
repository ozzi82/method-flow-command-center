import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MethodCRMRequest {
  action: 'sync_contacts' | 'sync_tasks' | 'create_contact' | 'create_activity';
  data?: any;
  user_id: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const methodApiKey = Deno.env.get('METHOD_CRM_API_KEY');
const methodCompanyDb = Deno.env.get('METHOD_CRM_COMPANY_DB');
const methodBaseUrl = 'https://api.method.me/v1';

async function callMethodAPI(endpoint: string, method: string = 'GET', data?: any) {
  const url = `${methodBaseUrl}/${methodCompanyDb}/${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${methodApiKey}`,
      'Content-Type': 'application/json',
    },
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  console.log(`Method CRM API call: ${method} ${url}`);
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Method CRM API error: ${response.status} ${errorText}`);
    throw new Error(`Method CRM API error: ${response.status} ${errorText}`);
  }

  return await response.json();
}

async function syncContacts(userId: string) {
  console.log('Syncing contacts from Method CRM...');
  
  try {
    // Fetch contacts from Method CRM
    const methodContacts = await callMethodAPI('tables/Customer');
    
    // Process and store contacts in Supabase
    const contactsToInsert = methodContacts.map((contact: any) => ({
      name: contact.Name || 'Unknown',
      email: contact.Email || null,
      phone: contact.Phone || null,
      company: contact.CompanyName || null,
      method_crm_id: contact.RecordID,
      user_id: userId,
    }));

    // Insert/update contacts in Supabase
    const { data, error } = await supabase
      .from('contacts')
      .upsert(contactsToInsert, { onConflict: 'method_crm_id,user_id' });

    if (error) {
      console.error('Error inserting contacts:', error);
      throw error;
    }

    console.log(`Synced ${contactsToInsert.length} contacts`);
    return { success: true, count: contactsToInsert.length };
    
  } catch (error) {
    console.error('Error syncing contacts:', error);
    throw error;
  }
}

async function createMethodActivity(taskData: any, userId: string) {
  console.log('Creating activity in Method CRM...');
  
  try {
    const activityData = {
      Subject: taskData.title,
      Description: taskData.description || '',
      ActivityType: 'Task',
      Status: taskData.status === 'done' ? 'Completed' : 'In Progress',
      Priority: taskData.priority === 'high' ? 'High' : taskData.priority === 'medium' ? 'Normal' : 'Low',
      DueDate: taskData.dueDate || null,
    };

    const methodResponse = await callMethodAPI('tables/Activity', 'POST', activityData);
    
    // Update sync table
    await supabase.from('method_sync').insert({
      entity_type: 'task',
      entity_id: taskData.id,
      method_crm_id: methodResponse.RecordID,
      sync_status: 'synced',
      user_id: userId,
    });

    console.log('Activity created in Method CRM:', methodResponse.RecordID);
    return { success: true, method_id: methodResponse.RecordID };
    
  } catch (error) {
    console.error('Error creating Method activity:', error);
    
    // Log sync error
    await supabase.from('method_sync').insert({
      entity_type: 'task',
      entity_id: taskData.id,
      sync_status: 'error',
      error_message: error.message,
      user_id: userId,
    });
    
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!methodApiKey || !methodCompanyDb) {
      throw new Error('Method CRM credentials not configured');
    }

    const { action, data, user_id }: MethodCRMRequest = await req.json();
    
    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log(`Processing Method CRM action: ${action} for user: ${user_id}`);

    let result;

    switch (action) {
      case 'sync_contacts':
        result = await syncContacts(user_id);
        break;
        
      case 'create_activity':
        if (!data) throw new Error('Task data is required for creating activity');
        result = await createMethodActivity(data, user_id);
        break;
        
      case 'sync_tasks':
        // TODO: Implement task sync from Method CRM to Supabase
        result = { success: true, message: 'Task sync not yet implemented' };
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in method-crm-sync function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});