// app/projects/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTaskStore, TaskStatus } from '@/store/useTaskStore';
import { useSyncTaskStoreAcrossTabs } from '@/lib/useSyncTaskStoreAcrossTabs';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  useSyncTaskStoreAcrossTabs();

  const addTask = useTaskStore((state) => state.addTask);
  const undo = useTaskStore((state) => state.undo);
  const redo = useTaskStore((state) => state.redo);

  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // AI Title Suggestions as you type
  useEffect(() => {
    if (!newTitle.trim()) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/ai-suggest-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefix: newTitle }),
        });
        if (res.ok) {
          const { suggestions } = await res.json();
          if (suggestions?.[0]) {
            setNewTitle(suggestions[0]); // Auto-complete first suggestion
          }
        }
      } catch (err) {
        console.warn('AI title suggestion failed');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [newTitle]);

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
      if (!res.ok) throw new Error();
      const data = await res.json();
      const suggestedStatus = (data.status || 'TODO') as TaskStatus;

      if (suggestedStatus === 'DONE') {
        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3').play().catch(() => {});
        import('canvas-confetti').then((c) => c.default({ particleCount: 300, spread: 70, origin: { y: 0.6 } }));
      }

      addTask({
        id: crypto.randomUUID(),
        projectId,
        title: newTitle.trim(),
        status: suggestedStatus,
        assignedTo: [],
        configuration: {},
        dependencies: [],
        comments: data.reason
          ? [{
              id: Date.now().toString(),
              taskId: '',
              author: 'AI Assistant',
              content: `Suggested ${suggestedStatus.replace('_', ' ')} because: ${data.reason}`,
              timestamp: Date.now(),
            }]
          : [],
      });
      setNewTitle('');
    } catch {
      alert('AI is thinking... Try again in a moment!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-purple-900 dark:to-indigo-950 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black opacity-50 dark:opacity-70"></div>
        <div className="relative px-8 py-16">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div>
              <h1 className="text-6xl font-black tracking-tight">
                TaskFlow <span className="text-yellow-200">take home project</span>
              </h1>
              <p className="text-2xl mt-3 opacity-90 font-light">
                Real-time • AI-Powered • Collaborative Kanban Board
              </p>
            </div>
            <div className="flex gap-6 items-center">
              <Button variant="secondary" size="lg" onClick={undo} className="bg-white/20 backdrop-blur-lg hover:bg-white/30 border border-white/40 text-white font-bold">
                ← Undo
              </Button>
              <Button variant="secondary" size="lg" onClick={redo} className="bg-white/20 backdrop-blur-lg hover:bg-white/30 border border-white/40 text-white font-bold">
                Redo →
              </Button>
              <Button
                onClick={() => document.documentElement.classList.toggle('dark')}
                className="bg-white/20 backdrop-blur-lg hover:bg-white/30 border border-white/40 text-white font-bold px-8 py-4 rounded-full shadow-xl"
              >
                {typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'Light' : 'Dark'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 pb-32">
        {/* TEMPLATES + AI INPUT */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000 animate-tilt dark:opacity-90"></div>
            <div className="relative bg-white dark:bg-gray-900/95 rounded-3xl p-10 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xl">

              {/* TASK TEMPLATES */}
              <div className="flex gap-4 mb-8 justify-center flex-wrap">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    addTask({
                      id: crypto.randomUUID(),
                      projectId,
                      title: 'Fix login authentication bug',
                      status: 'IN_PROGRESS',
                      assignedTo: [],
                      configuration: {},
                      dependencies: [],
                      comments: [
                        { id: Date.now().toString(), taskId: '', author: 'Bug Template', content: 'Steps to reproduce:', timestamp: Date.now() },
                        { id: (Date.now()+1).toString(), taskId: '', author: 'Bug Template', content: 'Expected behavior:', timestamp: Date.now() },
                        { id: (Date.now()+2).toString(), taskId: '', author: 'Bug Template', content: 'Actual behavior:', timestamp: Date.now() },
                      ],
                    });
                  }}
                  className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold"
                >
                  Bug Report
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    addTask({
                      id: crypto.randomUUID(),
                      projectId,
                      title: 'Add dark mode support',
                      status: 'TODO',
                      assignedTo: [],
                      configuration: {},
                      dependencies: [],
                      comments: [
                        { id: Date.now().toString(), taskId: '', author: 'Feature Template', content: 'User story: As a user, I want dark mode so my eyes don’t hurt at night', timestamp: Date.now() },
                        { id: (Date.now()+1).toString(), taskId: '', author: 'Feature Template', content: 'Acceptance criteria:\n- Toggle in header\n- Persists across sessions', timestamp: Date.now() },
                      ],
                    });
                  }}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold"
                >
                  New Feature
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    addTask({
                      id: crypto.randomUUID(),
                      projectId,
                      title: 'Release v2.0 to production',
                      status: 'DONE',
                      assignedTo: [],
                      configuration: {},
                      dependencies: [],
                      comments: [
                        { id: Date.now().toString(), taskId: '', author: 'Release Template', content: 'Deployed to production at ' + new Date().toLocaleString(), timestamp: Date.now() },
                        { id: (Date.now()+1).toString(), taskId: '', author: 'Release Template', content: 'Monitoring: No errors reported', timestamp: Date.now() },
                      ],
                    });
                    import('canvas-confetti').then(c => c.default({ particleCount: 300, spread: 360 }));
                  }}
                  className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-bold"
                >
                  Release
                </Button>
              </div>

              {/* MAIN INPUT + AI */}
              <div className="flex gap-5 items-center">
                <Input
                  placeholder="Or type your own... AI will autocomplete"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAdd()}
                  className="text-xl h-16 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-all"
                  disabled={isLoading}
                />
                <Button onClick={handleAdd} size="lg" disabled={isLoading}>
                  Add Task
                </Button>
                <Button onClick={handleAISuggest} disabled={isLoading || !newTitle.trim()}>
                  {isLoading ? 'Thinking...' : 'AI Magic'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <KanbanBoard projectId={projectId} />
      </div>
    </div>
  );
}