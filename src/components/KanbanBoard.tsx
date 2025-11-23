// src/components/KanbanBoard.tsx
'use client';

import { useMemo, useState } from 'react';
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
import { GripVertical } from 'lucide-react';

const columns: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

function DraggableCard({ task, projectId }: { task: Task; projectId: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const updateTask = useTaskStore((s) => s.updateTask);
  const addComment = useTaskStore((s) => s.addComment);

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
    setCommentText('');
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      updateTask(task.id, { deletedAt: Date.now() });
    }
  };

  const handleAddDep = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && depInput.trim()) {
      const newDepId = depInput.trim();
      if (task.dependencies?.includes(newDepId)) {
        setDepInput('');
        return;
      }
      const newDeps = [...(task.dependencies || []), newDepId];
      updateTask(task.id, { dependencies: newDeps });
      setDepInput('');
    }
  };

  if (task.deletedAt) return null;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="select-none"
    >
      <Card className="p-5 bg-white border rounded-xl shadow-sm hover:shadow transition-shadow flex gap-3">
        {/* Drag Handle */}
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing flex-shrink-0 pt-1 opacity-50 hover:opacity-100"
        >
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          <CardTitle className="text-base font-semibold">{task.title}</CardTitle>

          {/* Dependencies — beautiful badges */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Dependencies</p>
            <div className="flex flex-wrap gap-2">
              {task.dependencies?.length ? (
                task.dependencies.map((depId) => (
                  <span
                    key={depId}
                    className="bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium"
                  >
                    ← {depId}
                  </span>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No dependencies</p>
              )}
            </div>
            <Input
              placeholder="Add dependency (task ID) + Enter"
              value={depInput}
              onChange={(e) => setDepInput(e.target.value)}
              onKeyDown={handleAddDep}
              className="h-8 text-xs mt-3"
            />
          </div>

          {/* Comments */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Comments</p>
            <div className="space-y-2">
              {(task.comments || []).map((c) => (
                <div key={c.id} className="bg-gray-100 text-xs p-2.5 rounded-lg">
                  <span className="font-medium">{c.author}:</span> {c.content}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="h-8 text-xs"
              />
              <Button size="sm" onClick={handleAddComment}>
                Add
              </Button>
            </div>
          </div>

          {/* Delete */}
          <Button
            variant="destructive"
            className="w-full mt-4"
            size="sm"
            onClick={handleDelete}
          >
            Delete Task
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Column({ status, tasks, projectId }: { status: TaskStatus; tasks: Task[]; projectId: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-2xl p-6 min-h-screen border-2 transition-all ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-transparent'
      }`}
    >
      <h2 className="font-bold text-xl mb-6 text-gray-800">
        {status.replace('_', ' ')}
      </h2>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {tasks.map((task) => (
            <DraggableCard key={task.id} task={task} projectId={projectId} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { tasks, updateTask } = useTaskStore();

  const activeTasks = useMemo(
    () =>
      Object.values(tasks).filter(
        (t) => t.projectId === projectId && !t.deletedAt
      ),
    [tasks, projectId]
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = activeTasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = over.id as TaskStatus;
    if (newStatus && newStatus !== task.status) {
      updateTask(task.id, { status: newStatus });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-8">
        {columns.map((col) => (
          <Column
            key={col}
            status={col}
            tasks={activeTasks.filter((t) => t.status === col)}
            projectId={projectId}
          />
        ))}
      </div>
    </DndContext>
  );
}