// src/store/types.ts
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Comment {
  id: string;
  taskId: string;
  author: string;
  content: string;
  timestamp: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  assignedTo: string[];        // parsed JSON
  configuration: Record<string, any>;
  dependencies: string[];      // task IDs this task depends on
  comments?: Comment[];
  deletedAt?: number;          // soft delete timestamp
}