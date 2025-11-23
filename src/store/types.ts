// src/store/types.ts

// Task status type
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

// Task interface
export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
}
