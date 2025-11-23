'use client';

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

const columns: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

interface KanbanBoardProps {
  projectId: string;
}

// Draggable card
function DraggableCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className="p-4 mb-3 bg-white shadow hover:shadow-md border rounded-lg">
        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
      </Card>
    </div>
  );
}

// Droppable column
function DroppableColumn({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-xl p-6 min-h-96 border-2 ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <h2 className="font-bold text-lg mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ✅ Named export KanbanBoard
export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks, updateTask } = useTaskStore();
  const projectTasks = Object.values(tasks).filter((t) => t.projectId === projectId);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const task = projectTasks.find((t) => t.id === active.id);
    if (!task) return;

    const newStatus = over.id as TaskStatus;

    if (columns.includes(newStatus) && task.status !== newStatus) {
      updateTask(task.id, { status: newStatus }); // ✅ This now works
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-8">
        {columns.map((col) => {
          const tasksInCol = projectTasks.filter((t) => t.status === col);
          return (
            <DroppableColumn key={col} id={col} title={col.replace('_', ' ')}>
              <SortableContext items={tasksInCol.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {tasksInCol.map((task) => (
                  <DraggableCard key={task.id} task={task} />
                ))}
              </SortableContext>
            </DroppableColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
