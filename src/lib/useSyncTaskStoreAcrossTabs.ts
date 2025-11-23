import { useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';

export function useSyncTaskStoreAcrossTabs() {
  const setTasks = useTaskStore((state) => state.setTasks);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'task-store' && e.newValue) {
        const data = JSON.parse(e.newValue);
        if (data.state?.tasks) {
          setTasks(data.state.tasks);
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [setTasks]);
}
