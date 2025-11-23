import { useEffect } from 'react';
import { useTaskStore, Task } from '@/store/useTaskStore';

export function useSyncTaskStoreAcrossTabs() {
  const setTasks = useTaskStore((state) => state.setTasks);
  const tasks = useTaskStore.getState().tasks; // current tasks

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'task-store' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          const incomingTasks: Record<string, Task> = data.state?.tasks;
          if (incomingTasks) {
            const merged: Record<string, Task> = { ...tasks, ...incomingTasks };
            setTasks(merged); // pass object directly
          }
        } catch (err) {
          console.error('Failed to parse task-store from other tab', err);
        }
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [setTasks, tasks]);
}
