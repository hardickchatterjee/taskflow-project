// src/lib/useSyncTaskStoreAcrossTabs.ts
import { useEffect } from 'react';
import { useTaskStore, Task } from '@/store/useTaskStore';

export function useSyncTaskStoreAcrossTabs() {
  const setTasks = useTaskStore((state) => state.setTasks);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'taskflow-store' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const incomingTasks: Record<string, Task> = parsed.state?.tasks || {};

          if (Object.keys(incomingTasks).length > 0) {
            // Deep merge: preserve local changes, accept remote ones
            const currentTasks = useTaskStore.getState().tasks;
            const merged: Record<string, Task> = { ...currentTasks };

            Object.entries(incomingTasks).forEach(([id, task]) => {
              if (!merged[id]) {
                merged[id] = task;
              } else {
                merged[id] = {
                  ...merged[id],
                  ...task,
                  // Merge arrays properly
                  comments: task.comments || merged[id].comments || [],
                  dependencies: task.dependencies || merged[id].dependencies || [],
                };
              }
            });

            setTasks(merged);
          }
        } catch (err) {
          console.error('Failed to sync from other tab:', err);
        }
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [setTasks]);
}