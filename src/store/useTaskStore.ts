// src/store/useTaskStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  assignedTo: string[];                    // ← NEW
  configuration: Record<string, any>;      // ← NEW
  dependencies: string[];                  // ← NEW
  comments?: Comment[];
  deletedAt?: number;                      // ← soft delete
}

export interface Project {
  id: string;
  name: string;
}

export interface State {
  tasks: Record<string, Task>;
  projects: Record<string, Project>;

  addTask: (task: Task) => void;
  updateTask: (id: string, changes: Partial<Task>) => void;
  addProject: (name: string) => void;
  undo: () => void;
  redo: () => void;
  setTasks: (tasks: Record<string, Task>) => void;
  setProjects: (projects: Record<string, Project>) => void;
  addComment: (taskId: string, comment: Comment) => void;
  deleteComment: (taskId: string, commentId: string) => void;
}

interface HistoryState {
  past: Record<string, Task>[];
  present: Record<string, Task>;
  future: Record<string, Task>[];
}

export const useTaskStore = create<State>()(
  persist(
    (set, get) => {
      let history: HistoryState = { past: [], present: {}, future: [] };

      const saveHistory = (newPresent: Record<string, Task>) => {
        history.past.push(history.present);
        history.present = newPresent;
        history.future = [];
      };

      return {
        tasks: {},
        projects: {},

        setTasks: (tasks) => set({ tasks }),
        setProjects: (projects) => set({ projects }),

        addTask: (task: Task) => {
          const newTasks = { ...get().tasks, [task.id]: task };
          saveHistory(newTasks);
          set({ tasks: newTasks });
        },

        updateTask: (id, changes) => {
          const task = get().tasks[id];
          if (!task) return;
          const updatedTask = { ...task, ...changes };
          const newTasks = { ...get().tasks, [id]: updatedTask };
          saveHistory(newTasks);
          set({ tasks: newTasks });
        },

        addProject: (name) => {
          const id = crypto.randomUUID();
          const newProject = { id, name };
          set({ projects: { ...get().projects, [id]: newProject } });
        },

        undo: () => {
          if (history.past.length === 0) return;
          const previous = history.past.pop()!;
          history.future.unshift(history.present);
          history.present = previous;
          set({ tasks: previous });
        },

        redo: () => {
          if (history.future.length === 0) return;
          const next = history.future.shift()!;
          history.past.push(history.present);
          history.present = next;
          set({ tasks: next });
        },

        addComment: (taskId: string, comment: Comment) => {
          set((state) => {
            const task = state.tasks[taskId];
            if (!task) return state;
        
            const updatedTask = {
              ...task,
              comments: [...(task.comments || []), comment],
            };
        
            return {
              tasks: {
                ...state.tasks,
                [taskId]: updatedTask,
              },
            };
          });
        },
        
        deleteComment: (taskId: string, commentId: string) => {
          set((state) => {
            const task = state.tasks[taskId];
            if (!task?.comments) return state;
        
            const updatedTask = {
              ...task,
              comments: task.comments.filter((c) => c.id !== commentId),
            };
        
            return {
              tasks: {
                ...state.tasks,
                [taskId]: updatedTask,
              },
            };
          });
        },
      };
    },
    {
      name: 'task-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);