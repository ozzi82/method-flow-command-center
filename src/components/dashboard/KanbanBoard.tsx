import React, { useState, useEffect } from 'react';
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
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { BoardSelector } from './BoardSelector';
import { CreateBoardDialog } from './CreateBoardDialog';
import { Task, TaskStatus, Column } from '@/types/task';
import { Board } from '@/types/board';
import { useBoards } from '@/hooks/useBoards';
import { useTasks } from '@/hooks/useTasks';

export const KanbanBoard = () => {
  const { boards, createBoard, deleteBoard } = useBoards();
  const [currentBoardId, setCurrentBoardId] = useState<string>('');
  const { tasks, createTask, updateTask, deleteTask } = useTasks(currentBoardId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Set current board to first board when boards load
  useEffect(() => {
    if (boards.length > 0 && !currentBoardId) {
      setCurrentBoardId(boards[0].id);
    }
  }, [boards, currentBoardId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const currentBoard = boards.find(b => b.id === currentBoardId);
  const filteredTasks = tasks;

  const columns: Column[] = [
    { id: 'todo', title: 'To Do', tasks: filteredTasks.filter(task => task.status === 'todo') },
    { id: 'progress', title: 'In Progress', tasks: filteredTasks.filter(task => task.status === 'progress') },
    { id: 'done', title: 'Done', tasks: filteredTasks.filter(task => task.status === 'done') }
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = filteredTasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeTask = filteredTasks.find(t => t.id === active.id);
    if (!activeTask) return;
    
    const overId = over.id as string;
    
    // Check if we're dropping over a column
    if (['todo', 'progress', 'done'].includes(overId)) {
      const newStatus = overId as TaskStatus;
      if (activeTask.status !== newStatus) {
        updateTask(activeTask.id, { status: newStatus });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find the active task
    const activeTask = filteredTasks.find(t => t.id === activeId);
    if (!activeTask) return;
    
    // If dropping on a column, we've already handled it in dragOver
    if (['todo', 'progress', 'done'].includes(overId)) {
      return;
    }
    
    // For now, just handle status changes. Task reordering can be added later if needed.
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createTask(taskData);
    setIsCreateTaskDialogOpen(false);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
    setIsEditTaskDialogOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setIsEditTaskDialogOpen(false);
    setEditingTask(null);
  };

  const handleCreateBoard = async (name: string, description: string, color: string) => {
    const newBoard = await createBoard(name, description, color);
    if (newBoard) {
      setCurrentBoardId(newBoard.id);
    }
    setIsCreateBoardDialogOpen(false);
  };

  const handleDeleteBoard = async (boardId: string) => {
    await deleteBoard(boardId);
    
    // If we deleted the current board, switch to the first remaining board
    if (boardId === currentBoardId) {
      const remainingBoards = boards.filter(board => board.id !== boardId);
      setCurrentBoardId(remainingBoards[0]?.id || '');
    }
  };

  const taskIds = filteredTasks.map(task => task.id);
  
  // Show loading state if no boards exist yet
  if (boards.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No boards yet</h2>
        <p className="text-muted-foreground mb-6">Create your first board to get started</p>
        <Button onClick={() => setIsCreateBoardDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Board
        </Button>
        <CreateBoardDialog
          open={isCreateBoardDialogOpen}
          onOpenChange={setIsCreateBoardDialogOpen}
          onCreateBoard={handleCreateBoard}
        />
      </div>
    );
  }

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
          <Button variant="outline" size="sm" onClick={() => setIsCreateBoardDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Board
          </Button>
        </div>
        <Button onClick={() => setIsCreateTaskDialogOpen(true)}>
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
          <SortableContext items={taskIds}>
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onUpdateTask={(taskId, updates) => { handleUpdateTask(taskId, updates); }}
                onDeleteTask={(taskId) => {
                  setEditingTask(filteredTasks.find(t => t.id === taskId) || null);
                  setIsEditTaskDialogOpen(true);
                }}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              onUpdate={(taskId, updates) => { handleUpdateTask(taskId, updates); }}
              onDelete={(taskId) => { handleDeleteTask(taskId); }}
              isDragging
            />
          )}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        open={isCreateTaskDialogOpen}
        onOpenChange={setIsCreateTaskDialogOpen}
        onCreateTask={handleCreateTask}
      />

      {editingTask && (
        <EditTaskDialog
          open={isEditTaskDialogOpen}
          onOpenChange={setIsEditTaskDialogOpen}
          task={editingTask}
          onUpdateTask={(updates) => handleUpdateTask(editingTask.id, updates)}
        />
      )}

      <CreateBoardDialog
        open={isCreateBoardDialogOpen}
        onOpenChange={setIsCreateBoardDialogOpen}
        onCreateBoard={handleCreateBoard}
      />
    </div>
  );
};