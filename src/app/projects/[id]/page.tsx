'use client';
import { useSyncTaskStoreAcrossTabs } from '@/lib/useSyncTaskStoreAcrossTabs';
import { useTaskStore } from '@/store/useTaskStore';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ProjectPage() {
  useSyncTaskStoreAcrossTabs();

  const params = useParams();
  const projectId = params.id as string;

  const addTask = useTaskStore((state) => state.addTask);
  const undo = useTaskStore((state) => state.undo);
  const redo = useTaskStore((state) => state.redo);

  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    if (newTitle.trim()) {
      addTask({ id: crypto.randomUUID(), projectId, title: newTitle.trim(), status: 'TODO' });
      setNewTitle('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-6 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Project Board</h1>
          <p className="text-gray-600">Add tasks • Drag & drop • Undo/Redo</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={undo}>Undo</Button>
          <Button variant="outline" onClick={redo}>Redo</Button>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-6xl mx-auto mb-8 bg-white rounded-xl shadow p-6 flex gap-4">
          <Input
            placeholder="New task title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd}>Add Task</Button>
        </div>

        <KanbanBoard projectId={projectId} />
      </div>
    </div>
  );
}
