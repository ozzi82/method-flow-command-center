export type TaskStatus = 'todo' | 'progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  reminderSet?: boolean;
  boardId?: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}