// src/components/KanbanBoard.tsx
'use client';

import { useState, useMemo } from 'react';
import { useTaskStore, Task, TaskStatus } from '@/store/useTaskStore';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { GripVertical } from 'lucide-react';  // Add drag handle icon (from lucide-react, already in your deps)

const columns: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

function DraggableCard({ task, projectId }: { task: Task; projectId: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,  // ← THIS IS THE KEY FIX: Separate drag activation
    transform,
    transition,
  } = useSortable({ id: task.id });

  const updateTask = useTaskStore(s => s.updateTask);
  const addComment = useTaskStore(s => s.addComment);

  const [commentText, setCommentText] = useState('');
  const [depInput, setDepInput] = useState('');

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const comment = {
      id: Date.now().toString(),
      taskId: task.id,
      author: 'You',
      content: commentText.trim(),
      timestamp: Date.now(),
    };
    addComment(task.id, comment);
    // Your broadcast code here (SSE or socket — doesn't matter)
    setCommentText('');
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      // Your broadcast code here
      updateTask(task.id, { deletedAt: Date.now() });
    }
  };

  const handleAddDep = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && depInput.trim()) {
      const newDep = depInput.trim();
      if (!task.dependencies?.includes(newDep)) {
        const newDeps = [...(task.dependencies || []), newDep];
        updateTask(task.id, { dependencies: newDeps });
        // Your broadcast code here
      }
      setDepInput('');
    }
  };

  if (task.deletedAt) return null;

  return (
    <div
      ref={setNodeRef}  // Ref for positioning, but NO listeners here
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="select-none"  // Prevent text selection during drag
    >
      <Card className="p-5 bg-white border rounded-xl shadow-sm hover:shadow transition-shadow flex gap-2">
        {/* DRAG HANDLE — listeners ONLY here */}
        <div
          ref={setActivatorNodeRef}  // ← FIX: Activate drag ONLY on grip icon
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing flex-shrink-0 p-1 opacity-50 hover:opacity-100"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* CARD CONTENT — No listeners, so clicks work normally */}
        <div className="flex-1">
          <CardTitle className="text-base font-semibold">{task.title}</CardTitle>

          {task.dependencies?.length ? (
            <div className="text-xs text-gray-500 mt-2">
              Depends on: {task.dependencies.join(', ')}
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            {(task.comments || []).map(c => (
              <div key={c.id} className="bg-gray-100 text-xs p-2 rounded">
                <span className="font-medium">{c.author}:</span> {c.content}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              className="h-9 text-sm"
            />
            <Button size="sm" onClick={handleAddComment}>Add</Button>
          </div>

          <Input
            placeholder="Depends on task ID..."
            value={depInput}
            onChange={e => setDepInput(e.target.value)}
            onKeyDown={handleAddDep}
            className="h-9 text-sm mt-3"
          />

          <Button variant="destructive" className="w-full mt-4" size="sm" onClick={handleDelete}>
            Delete Task
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Column({ status, tasks, projectId }: { status: TaskStatus; tasks: Task[]; projectId: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-2xl p-6 min-h-screen border-2 transition-all ${isOver ? 'border-blue-500 bg-blue-50' : 'border-transparent'
        }`}
    >
      <h2 className="font-bold text-xl mb-6 text-gray-800">{status.replace('_', ' ')}</h2>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {tasks.map(task => (
            <DraggableCard key={task.id} task={task} projectId={projectId} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { tasks, updateTask } = useTaskStore();

  const activeTasks = useMemo(() =>
    Object.values(tasks).filter(t => t.projectId === projectId && !t.deletedAt),
    [tasks, projectId]
  );

  const sensors = useSensors(useSensor(PointerSensor));

  // In handleDragEnd — replace the updateTask call
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = activeTasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = over.id as TaskStatus;
    if (newStatus && newStatus !== task.status) {
      // This will now save to history
      updateTask(task.id, { status: newStatus });
      // Your broadcast here
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-8">
        {columns.map(col => (
          <Column
            key={col}
            status={col}
            tasks={activeTasks.filter(t => t.status === col)}
            projectId={projectId}
          />
        ))}
      </div>
    </DndContext>
  );
}