import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Task } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
  column: Column;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function KanbanColumn({ column, onUpdateTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const getColumnStyles = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-kanban-todo border-kanban-todo-border';
      case 'progress':
        return 'bg-kanban-progress border-kanban-progress-border';
      case 'done':
        return 'bg-kanban-done border-kanban-done-border';
      default:
        return 'bg-muted';
    }
  };

  const getHeaderColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'text-blue-700';
      case 'progress':
        return 'text-orange-700';
      case 'done':
        return 'text-green-700';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card className={`${getColumnStyles(column.id)} transition-colors ${isOver ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center justify-between text-base ${getHeaderColor(column.id)}`}>
          <span>{column.title}</span>
          <Badge variant="secondary" className="bg-background/50">
            {column.tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className="space-y-3 min-h-[200px]"
        >
          <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))}
          </SortableContext>
          {column.tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Drop tasks here
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}