import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { Task, TaskStatus, Column } from '@/types/task';
import { Board } from '@/types/board';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { CreateTaskDialog } from './CreateTaskDialog';
import { BoardSelector } from './BoardSelector';
import { CreateBoardDialog } from './CreateBoardDialog';

const initialBoards: Board[] = [
  { id: '1', name: 'Personal Tasks', description: 'My personal task board', color: 'blue', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Work Projects', description: 'Work-related tasks and projects', color: 'green', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'Method CRM Setup', description: 'Tasks for CRM integration', color: 'purple', createdAt: new Date(), updatedAt: new Date() }
];

const initialTasks: Task[] = [
  {
    id: '1', title: 'Setup Method CRM Integration', description: 'Configure API endpoints and authentication for Method CRM',
    status: 'todo', priority: 'high', dueDate: new Date('2024-12-30'), createdAt: new Date(), updatedAt: new Date(),
    reminderSet: true, boardId: '3'
  },
  {
    id: '2', title: 'Design Dashboard UI', description: 'Create wireframes and mockups for the main dashboard',
    status: 'progress', priority: 'medium', createdAt: new Date(), updatedAt: new Date(), boardId: '1'
  },
  {
    id: '3', title: 'Test Email Integration', description: 'Verify Outlook integration is working properly',
    status: 'done', priority: 'low', createdAt: new Date(), updatedAt: new Date(), boardId: '2'
  }
];

export function KanbanBoard() {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [currentBoardId, setCurrentBoardId] = useState<string>(initialBoards[0].id);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateBoardDialog, setShowCreateBoardDialog] = useState(false);

  const currentBoard = boards.find(b => b.id === currentBoardId);
  const currentBoardTasks = tasks.filter(t => t.boardId === currentBoardId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const columns: Column[] = [
    { id: 'todo', title: 'To Do', tasks: currentBoardTasks.filter(task => task.status === 'todo') },
    { id: 'progress', title: 'In Progress', tasks: currentBoardTasks.filter(task => task.status === 'progress') },
    { id: 'done', title: 'Done', tasks: currentBoardTasks.filter(task => task.status === 'done') }
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeTaskId);
    const overTask = tasks.find(t => t.id === overTaskId);

    if (!activeTask) return;

    // Handle dropping on a column
    if (['todo', 'progress', 'done'].includes(overTaskId)) {
      const newStatus = overTaskId as TaskStatus;
      if (activeTask.status !== newStatus) {
        setTasks(prev => prev.map(task =>
          task.id === activeTaskId
            ? { ...task, status: newStatus, updatedAt: new Date() }
            : task
        ));
      }
      return;
    }

    // Handle reordering within the same column or moving between columns
    if (overTask && activeTask.status !== overTask.status) {
      setTasks(prev => prev.map(task =>
        task.id === activeTaskId
          ? { ...task, status: overTask.status, updatedAt: new Date() }
          : task
      ));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeTaskId);
    const overTask = tasks.find(t => t.id === overTaskId);

    if (!activeTask) return;

    // If dropping on the same task, do nothing
    if (activeTaskId === overTaskId) return;

    // If we have both tasks, reorder them
    if (overTask && activeTask.status === overTask.status) {
      const sameStatusTasks = tasks.filter(t => t.status === activeTask.status);
      const activeIndex = sameStatusTasks.findIndex(t => t.id === activeTaskId);
      const overIndex = sameStatusTasks.findIndex(t => t.id === overTaskId);

      const reorderedTasks = arrayMove(sameStatusTasks, activeIndex, overIndex);
      
      setTasks(prev => [
        ...prev.filter(t => t.status !== activeTask.status),
        ...reorderedTasks
      ]);
    }
  };

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      boardId: currentBoardId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleCreateBoard = (name: string, description: string, color: string) => {
    const newBoard: Board = {
      id: Date.now().toString(),
      name, description, color,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setBoards(prev => [...prev, newBoard]);
    setCurrentBoardId(newBoard.id);
  };

  const handleDeleteBoard = (boardId: string) => {
    if (boards.length <= 1) return; // Keep at least one board
    setBoards(prev => prev.filter(b => b.id !== boardId));
    setTasks(prev => prev.filter(t => t.boardId !== boardId));
    if (currentBoardId === boardId) {
      setCurrentBoardId(boards.find(b => b.id !== boardId)?.id || boards[0].id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BoardSelector
            boards={boards}
            currentBoardId={currentBoardId}
            onBoardChange={setCurrentBoardId}
            onDeleteBoard={handleDeleteBoard}
          />
          <Button variant="outline" size="sm" onClick={() => setShowCreateBoardDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Board
          </Button>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {currentBoard && (
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">{currentBoard.name}</h3>
          {currentBoard.description && (
            <p className="text-sm text-muted-foreground">{currentBoard.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-kanban-todo border border-kanban-todo-border"></div>
              {columns[0].tasks.length} To Do
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-kanban-progress border border-kanban-progress-border"></div>
              {columns[1].tasks.length} In Progress
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-kanban-done border border-kanban-done-border"></div>
              {columns[2].tasks.length} Done
            </span>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <SortableContext key={column.id} items={column.tasks.map(t => t.id)}>
              <KanbanColumn
                column={column}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              isDragging
            />
          )}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateTask={handleCreateTask}
      />

      <CreateBoardDialog
        open={showCreateBoardDialog}
        onOpenChange={setShowCreateBoardDialog}
        onCreateBoard={handleCreateBoard}
      />
    </div>
  );
}