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
// Correct Method CRM API base URL
const methodBaseUrl = 'https://rest.method.me/api/v1';

async function callMethodAPI(endpoint: string, method: string = 'GET', data?: any) {
  // Correct URL structure: no company DB in path for REST API
  const url = `${methodBaseUrl}/${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      // Correct Method CRM API Key authentication format
      'Authorization': `APIKey ${methodApiKey}`,
      'Content-Type': 'application/json',
      'Host': 'rest.method.me',
    },
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  console.log(`Method CRM API call: ${method} ${url}`);
  console.log('Headers:', options.headers);
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Method CRM API error: ${response.status} ${errorText}`);
    console.error('Response body:', errorText);
    throw new Error(`Method CRM API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Method CRM API response:', result);
  return result;
}

async function syncContacts(userId: string) {
  console.log('Syncing contacts from Method CRM...');
  
  try {
    // Fetch contacts from Method CRM - correct table name is 'Customer'
    const response = await callMethodAPI('tables/Customer');
    
    // Method CRM returns data in a 'value' array
    const methodContacts = response.value || response || [];
    
    if (!Array.isArray(methodContacts)) {
      console.error('Unexpected response format from Method CRM:', response);
      throw new Error('Invalid response format from Method CRM');
    }

    console.log(`Found ${methodContacts.length} contacts in Method CRM`);
    
    // Process and store contacts in Supabase with correct field mapping
    const contactsToInsert = methodContacts.map((contact: any) => ({
      name: contact.Name || contact.FirstName || contact.LastName || 'Unknown',
      email: contact.Email || null,
      phone: contact.Phone || null,
      company: contact.CompanyName || contact.Company || null,
      method_crm_id: contact.RecordID || contact.Id,
      user_id: userId,
    }));

    if (contactsToInsert.length === 0) {
      return { success: true, count: 0, message: 'No contacts to sync' };
    }

    // Insert/update contacts in Supabase
    const { data, error } = await supabase
      .from('contacts')
      .upsert(contactsToInsert, { 
        onConflict: 'method_crm_id,user_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error inserting contacts:', error);
      throw error;
    }

    console.log(`Successfully synced ${contactsToInsert.length} contacts`);
    return { success: true, count: contactsToInsert.length };
    
  } catch (error) {
    console.error('Error syncing contacts:', error);
    throw error;
  }
}

async function createMethodActivity(taskData: any, userId: string) {
  console.log('Creating activity in Method CRM for task:', taskData.id);
  
  try {
    // Correct Method CRM Activity field mapping
    const activityData = {
      Subject: taskData.title,
      Description: taskData.description || '',
      ActivityType: 'Task',
      Status: taskData.status === 'done' ? 'Completed' : 'In Progress',
      Priority: taskData.priority === 'high' ? 'High' : taskData.priority === 'medium' ? 'Normal' : 'Low',
      DueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
      // Add any other required fields based on Method CRM schema
    };

    console.log('Sending activity data to Method CRM:', activityData);
    
    const methodResponse = await callMethodAPI('tables/Activity', 'POST', activityData);
    
    const recordId = methodResponse.RecordID || methodResponse.Id || methodResponse.id;
    
    if (!recordId) {
      console.error('No record ID returned from Method CRM:', methodResponse);
      throw new Error('Failed to get record ID from Method CRM response');
    }
    
    // Update sync table with success
    await supabase.from('method_sync').insert({
      entity_type: 'task',
      entity_id: taskData.id,
      method_crm_id: recordId,
      sync_status: 'synced',
      last_synced: new Date().toISOString(),
      user_id: userId,
    });

    console.log('Activity created in Method CRM with ID:', recordId);
    return { success: true, method_id: recordId };
    
  } catch (error) {
    console.error('Error creating Method activity:', error);
    
    // Log sync error with detailed information
    await supabase.from('method_sync').insert({
      entity_type: 'task',
      entity_id: taskData.id,
      sync_status: 'error',
      error_message: error.message || 'Unknown error occurred',
      user_id: userId,
    });
    
    // Don't throw the error, just return failure status
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check API key - company DB is not required for REST API
    if (!methodApiKey) {
      console.error('METHOD_CRM_API_KEY not configured');
      throw new Error('Method CRM API key not configured');
    }

    const requestBody = await req.text();
    console.log('Received request body:', requestBody);
    
    const { action, data, user_id }: MethodCRMRequest = JSON.parse(requestBody);
    
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
        result = { success: true, message: 'Task sync from Method CRM not yet implemented' };
        break;
        
      case 'create_contact':
        if (!data) throw new Error('Contact data is required for creating contact');
        // TODO: Implement contact creation in Method CRM
        result = { success: true, message: 'Contact creation not yet implemented' };
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log('Method CRM operation result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in method-crm-sync function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});