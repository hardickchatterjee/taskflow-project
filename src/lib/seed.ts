import { useTaskStore, TaskStatus } from '@/store/useTaskStore';

const demoTasks = [
  'Design landing page',
  'Set up authentication',
  'Implement real-time sync',
  'Add drag & drop Kanban',
  'Build undo/redo system',
  'Create project management',
  'Add task dependencies',
  'Deploy to Vercel',
  'Record demo video',
  'Ship to production',
];

const statuses: TaskStatus[] = [
  'TODO', 'TODO', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS',
  'DONE', 'DONE', 'DONE', 'IN_PROGRESS', 'TODO'
];

export function seedDemoProject() {
  const projectId = 'demo';
  const { tasks, addTask } = useTaskStore.getState();
  const hasDemo = Object.values(tasks).some(t => t.projectId === projectId);

  if (!hasDemo) {
    demoTasks.forEach((title, i) => {
      const task = {
        id: `demo-task-${i}`,
        projectId,
        title,
        status: statuses[i],
      };
      addTask(task);
    });
  }
}
