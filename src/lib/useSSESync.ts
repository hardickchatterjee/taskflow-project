// src/lib/useSSESync.ts
import { useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';

export function useSSESync(projectId: string) {
  const { updateTask, addComment } = useTaskStore();

  useEffect(() => {
    const eventSource = new EventSource(`/api/events?projectId=${projectId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'batch') {
        data.events.forEach((e: any) => {
          if (e.type === 'comment-added') addComment(e.comment.taskId, e.comment);
          if (e.type === 'task-deleted') updateTask(e.taskId, { deletedAt: Date.now() });
          if (e.type === 'task-updated') updateTask(e.task.id, e.task);
        });
      }
    };

    eventSource.onerror = () => eventSource.close();

    return () => eventSource.close();
  }, [projectId, updateTask, addComment]);
}