import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KanbanBoard } from './KanbanBoard';
import { DashboardOverview } from './DashboardOverview';
import { LayoutDashboard, CheckSquare, Users, FileText, Mail, DollarSign, Bell } from 'lucide-react';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>
            <div className="h-8 w-8 rounded-full bg-gradient-primary" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {children || (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-6 w-fit bg-muted">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Contacts
              </TabsTrigger>
              <TabsTrigger value="estimates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Estimates
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Invoices
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <DashboardOverview />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Task Management</h2>
                  <p className="text-muted-foreground">Organize your work with our Kanban board</p>
                </div>
              </div>
              <KanbanBoard />
            </TabsContent>

            <TabsContent value="contacts">
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <CardTitle>Contacts</CardTitle>
                  <CardDescription>Method CRM integration coming soon</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">This section will display contacts from Method CRM.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="estimates">
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <CardTitle>Estimates</CardTitle>
                  <CardDescription>Active estimates from Method CRM</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">This section will display estimates from Method CRM.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>Invoice management and tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">This section will display invoices from Method CRM.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <CardTitle>Email</CardTitle>
                  <CardDescription>Outlook integration (optional)</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">This section will display email integration when implemented.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}