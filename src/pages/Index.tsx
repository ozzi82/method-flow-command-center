import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Setting up your workspace</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Method CRM Kanban</h1>
          <p className="text-xl text-muted-foreground">Manage your projects with style</p>
          <Button onClick={() => navigate('/auth')} size="lg">
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-2xl font-bold">Method CRM Dashboard</h1>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>
      <DashboardLayout />
    </div>
  );
};

export default Index;
