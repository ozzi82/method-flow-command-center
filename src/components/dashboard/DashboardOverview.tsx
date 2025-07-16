import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckSquare, 
  Clock, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Users,
  Calendar,
  Bell
} from 'lucide-react';

export function DashboardOverview() {
  const stats = [
    {
      title: 'Active Tasks',
      value: '12',
      description: '3 due today',
      icon: CheckSquare,
      trend: '+2.5%',
      color: 'text-blue-600'
    },
    {
      title: 'Open Estimates',
      value: '$24,500',
      description: '8 pending approval',
      icon: FileText,
      trend: '+12.3%',
      color: 'text-green-600'
    },
    {
      title: 'Unpaid Invoices',
      value: '$8,750',
      description: '5 overdue',
      icon: DollarSign,
      trend: '-4.2%',
      color: 'text-red-600'
    },
    {
      title: 'Total Contacts',
      value: '156',
      description: '12 new this month',
      icon: Users,
      trend: '+8.1%',
      color: 'text-purple-600'
    }
  ];

  const upcomingTasks = [
    { id: 1, title: 'Follow up with Johnson & Co', due: 'Today 2:00 PM', priority: 'high' },
    { id: 2, title: 'Review Q4 estimates', due: 'Tomorrow 10:00 AM', priority: 'medium' },
    { id: 3, title: 'Update CRM contact database', due: 'Dec 28, 2024', priority: 'low' },
    { id: 4, title: 'Send invoice reminders', due: 'Dec 30, 2024', priority: 'high' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-card shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <span className={`text-xs font-medium ${
                  stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Upcoming Tasks
              </CardTitle>
              <CardDescription>Tasks due soon and requiring attention</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{task.due}</span>
                  </div>
                </div>
                <Badge className={getPriorityColor(task.priority)} variant="outline">
                  {task.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity Progress */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Progress
            </CardTitle>
            <CardDescription>Your productivity this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tasks Completed</span>
                <span className="font-medium">18/25</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Estimates Sent</span>
                <span className="font-medium">6/8</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Invoices Processed</span>
                <span className="font-medium">12/15</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  76% Complete
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <CheckSquare className="h-5 w-5" />
              <span className="text-sm">Add Task</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <FileText className="h-5 w-5" />
              <span className="text-sm">New Estimate</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm">Create Invoice</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Bell className="h-5 w-5" />
              <span className="text-sm">Set Reminder</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}