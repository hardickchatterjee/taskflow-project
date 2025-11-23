// import useTaskStore from '@/store/useTaskStore';

// const demoTasks = [
//   { id: '1', title: 'Design landing page', status: 'TODO' },
//   { id: '2', title: 'Setup authentication', status: 'TODO' },
//   { id: '3', title: 'Build real-time sync', status: 'IN_PROGRESS' },
//   { id: '4', title: 'Add drag & drop Kanban', status: 'IN_PROGRESS' },
//   { id: '5', title: 'Implement undo/redo', status: 'IN_PROGRESS' },
//   { id: '6', title: 'Add AI subtask generator', status: 'DONE' },
//   { id: '7', title: 'Write unit tests', status: 'DONE' },
//   { id: '8', title: 'Deploy to Vercel', status: 'DONE' },
//   { id: '9', title: 'Record demo video', status: 'IN_PROGRESS' },
//   { id: '10', title: 'Ship to production', status: 'TODO' },
// ];

// export function loadDemoTasks(projectId: string) {
//   const { tasks, addTask } = useTaskStore.getState();

//   const hasTasks = Object.values(tasks).some((t: any) => t.projectId === projectId);

//   if (!hasTasks) {
//     demoTasks.forEach(task => {
//       addTask(projectId, task.id);
//     });
//   }
// }
