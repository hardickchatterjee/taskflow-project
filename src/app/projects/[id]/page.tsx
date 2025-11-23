// app/projects/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTaskStore, TaskStatus } from '@/store/useTaskStore';
import { useSyncTaskStoreAcrossTabs } from '@/lib/useSyncTaskStoreAcrossTabs';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  // Sync across tabs (localStorage)
  useSyncTaskStoreAcrossTabs();

  const addTask = useTaskStore((state) => state.addTask);
  const undo = useTaskStore((state) => state.undo);
  const redo = useTaskStore((state) => state.redo);

  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTask({
      id: crypto.randomUUID(),
      projectId,
      title: newTitle.trim(),
      status: 'TODO' as const,
      assignedTo: [],
      configuration: {},
      dependencies: [],
    });
    setNewTitle('');
  };

  const handleAISuggest = async () => {
    if (!newTitle.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!res.ok) throw new Error('AI unavailable');

      const data = await res.json();
      const suggestedStatus = (data.status || 'TODO') as TaskStatus;

      addTask({
        id: crypto.randomUUID(),
        projectId,
        title: newTitle.trim(),
        status: suggestedStatus,
        assignedTo: [],
        configuration: {},
        dependencies: [],
        comments: data.reason
          ? [
              {
                id: Date.now().toString(),
                taskId: '', // will be auto-filled by store
                author: 'AI Assistant',
                content: `Suggested ${suggestedStatus.replace('_', ' ')} because: ${data.reason}`,
                timestamp: Date.now(),
              },
            ]
          : [],
      });
      setNewTitle('');
    } catch (err) {
      alert('AI is thinking... Try again in a moment!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-6 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">TaskFlow</h1>
          <p className="text-gray-600">
            Add tasks • AI suggestions • Drag & drop • Undo/Redo • Real-time sync
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={undo}>
            Undo
          </Button>
          <Button variant="outline" onClick={redo}>
            Redo
          </Button>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-6xl mx-auto mb-8 bg-white rounded-xl shadow p-6">
          <div className="flex gap-3 items-center">
            <Input
              placeholder="New task title... (or let AI suggest)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAdd()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleAdd} disabled={isLoading}>
              Add Task
            </Button>
            <Button
              variant="secondary"
              onClick={handleAISuggest}
              disabled={isLoading || !newTitle.trim()}
            >
              {isLoading ? 'Thinking...' : 'AI Suggest'}
            </Button>
          </div>
        </div>

        <KanbanBoard projectId={projectId} />
      </div>
    </div>
  );
}