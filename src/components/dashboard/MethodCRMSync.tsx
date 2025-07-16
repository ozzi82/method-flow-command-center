import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useMethodCRM } from '@/hooks/useMethodCRM';
import { useContacts } from '@/hooks/useContacts';

export const MethodCRMSync = () => {
  const { loading, syncContacts, getSyncStatus } = useMethodCRM();
  const { contacts, refetch: refetchContacts } = useContacts();
  const [syncHistory, setSyncHistory] = useState([]);

  useEffect(() => {
    loadSyncHistory();
  }, []);

  const loadSyncHistory = async () => {
    const history = await getSyncStatus();
    setSyncHistory(history);
  };

  const handleSyncContacts = async () => {
    await syncContacts();
    await refetchContacts();
    await loadSyncHistory();
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contacts Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contacts Sync
            </CardTitle>
            <CardDescription>
              Import and sync contacts from Method CRM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Local contacts: {contacts.length}
              </span>
              <Button 
                onClick={handleSyncContacts}
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Contacts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Task Sync
            </CardTitle>
            <CardDescription>
              Automatically sync tasks to Method CRM as activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Tasks are automatically synced to Method CRM when created or updated.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
          <CardDescription>
            Recent synchronization activities with Method CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sync history yet. Try syncing some data above.
            </div>
          ) : (
            <div className="space-y-2">
              {syncHistory.slice(0, 10).map((sync: any) => (
                <div key={sync.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getSyncStatusIcon(sync.sync_status)}
                    <div>
                      <div className="font-medium capitalize">
                        {sync.entity_type} Sync
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(sync.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={sync.sync_status === 'synced' ? 'default' : 'destructive'}>
                    {sync.sync_status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};