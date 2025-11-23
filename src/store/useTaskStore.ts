import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ✅ Export TaskStatus and Task
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
}

// ✅ Export Project type
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
}

interface HistoryState {
  past: Record<string, Task>[];
  present: Record<string, Task>;
  future: Record<string, Task>[];
}

// ✅ Named export
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
          const newTasks = { ...get().tasks, [id]: { ...task, ...changes } };
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
      };
    },
    {
      name: 'task-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
