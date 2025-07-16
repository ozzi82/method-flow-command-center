import { Task } from './task';

export interface Board {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardWithTasks extends Board {
  tasks: Task[];
}