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
  assignedTo?: string[];
  configuration?: Record<string, any>;
  dependencies?: string[];
  comments?: Comment[];
  deletedAt?: number;
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
  addComment: (taskId: string, comment: Comment) => void;
  deleteComment: (taskId: string, commentId: string) => void;
  addProject: (name: string) => void;
  undo: () => void;
  redo: () => void;
  initDemoData: () => void;
  setTasks: (tasks: Record<string, Task>) => void;
  setProjects: (projects: Record<string, Project>) => void;
}

// Generate demo tasks
function generateTasks(count: number) {
  const tasks: Record<string, Task> = {};
  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    tasks[id] = {
      id,
      title: `Task ${i + 1}`,
      // description: `Auto-generated task ${i + 1}`,
      status: 'TODO',
      projectId: 'demo',
      comments: [],
    };
  }
  return tasks;
}

// History outside Zustand (persists across re-renders)
const history = {
  past: [] as Record<string, Task>[],
  future: [] as Record<string, Task>[],
};

const pushToHistory = (current: Record<string, Task>) => {
  history.past.push(current);
  history.future = [];
};

export const useTaskStore = create<State>()(
  persist(
    (set, get) => ({
      tasks: {},
      projects: {},

      setTasks: (tasks) => set({ tasks }),
      setProjects: (projects) => set({ projects }),

      initDemoData: () => {
        const tasks: Record<string, Task> = {};
        const demoProjectId = "demo-project";
      
        for (let i = 0; i < 1000; i++) {
          const id = crypto.randomUUID();
          tasks[id] = {
            id,
            projectId: demoProjectId,
            title: `Demo Task #${i + 1}`,
            status: i % 3 === 0 ? "TODO" : i % 3 === 1 ? "IN_PROGRESS" : "DONE",
            comments: []
          };
        }
      
        set({
          tasks,
          projects: {
            [demoProjectId]: {
              id: demoProjectId,
              name: "Demo Project"
            }
          }
        });
      },
      
      addTask: (task: Task) => {
        const current = get().tasks;
        pushToHistory(current);
        set({ tasks: { ...current, [task.id]: task } });
      },

      updateTask: (id: string, changes: Partial<Task>) => {
        const task = get().tasks[id];
        if (!task) return;

        const current = get().tasks;
        pushToHistory(current);
        set({
          tasks: {
            ...current,
            [id]: { ...task, ...changes },
          },
        });
      },

      addComment: (taskId: string, comment: Comment) => {
        const task = get().tasks[taskId];
        if (!task) return;

        const current = get().tasks;
        pushToHistory(current);
        set({
          tasks: {
            ...current,
            [taskId]: {
              ...task,
              comments: [...(task.comments || []), comment],
            },
          },
        });
      },

      deleteComment: (taskId: string, commentId: string) => {
        const task = get().tasks[taskId];
        if (!task?.comments) return;

        const current = get().tasks;
        pushToHistory(current);
        set({
          tasks: {
            ...current,
            [taskId]: {
              ...task,
              comments: task.comments.filter((c) => c.id !== commentId),
            },
          },
        });
      },

      undo: () => {
        if (history.past.length === 0) return;
        const previous = history.past.pop()!;
        history.future.unshift(get().tasks);
        set({ tasks: previous });
      },

      redo: () => {
        if (history.future.length === 0) return;
        const next = history.future.shift()!;
        history.past.push(get().tasks);
        set({ tasks: next });
      },

      addProject: (name: string) => {
        const id = crypto.randomUUID();
        set((state) => ({
          projects: {
            ...state.projects,
            [id]: { id, name },
          },
        }));
      },
    }),
    {
      name: 'taskflow-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ tasks: state.tasks }), 
    }
  )
);