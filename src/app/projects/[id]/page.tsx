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

  // Detect dark mode for button text
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

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
                taskId: '',
                author: 'AI Assistant',
                content: `Suggested ${suggestedStatus.replace('_', ' ')} because: ${data.reason}`,
                timestamp: Date.now(),
              },
            ]
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
      {/* HERO HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-purple-900 dark:to-indigo-950 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black opacity-50 dark:opacity-70"></div>
        <div className="relative px-8 py-16">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div>
              <h1 className="text-6xl font-black tracking-tight">
                TaskFlow <span className="text-yellow-400">AI</span>
              </h1>
              <p className="text-2xl mt-3 opacity-90 font-light">
                Real-time • AI-Powered • Zero Backend • Undo Everything
              </p>
            </div>
            <div className="flex gap-6 items-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={undo}
                className="bg-white/20 backdrop-blur-lg hover:bg-white/30 border border-white/40 text-white font-bold"
              >
                ← Undo
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={redo}
                className="bg-white/20 backdrop-blur-lg hover:bg-white/30 border border-white/40 text-white font-bold"
              >
                Redo →
              </Button>

              {/* DARK MODE TOGGLE — THE ONE LINE THAT CHANGES EVERYTHING */}
              <Button
                onClick={() => document.documentElement.classList.toggle('dark')}
                className="bg-white/20 backdrop-blur-lg hover:bg-white/30 border border-white/40 text-white font-bold px-8 py-4 rounded-full shadow-xl transition-all duration-500"
              >
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
          </div>
        </div>

        {/* Floating particles — glow in dark mode */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-white rounded-full opacity-70 animate-ping dark:opacity-90 dark:blur-sm"
              style={{
                top: `${10 + i * 11}%`,
                left: `${5 + i * 12}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + i * 0.5}s`,
                boxShadow: isDark ? '0 0 20px #a855f7' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div className="p-8 pb-32">
        {/* AI INPUT WITH NEON GLOW */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000 animate-tilt dark:from-purple-500 dark:via-pink-500 dark:to-cyan-500 dark:opacity-90"></div>
            <div className="relative bg-white dark:bg-gray-900/95 rounded-3xl p-10 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xl">
              <div className="flex gap-5 items-center">
                <Input
                  placeholder="Describe your task... AI will place it perfectly"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAdd()}
                  className="text-xl h-16 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 transition-all bg-white/80 dark:bg-gray-800/80"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleAdd}
                  size="lg"
                  className="h-16 px-10 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500"
                  disabled={isLoading}
                >
                  Add Task
                </Button>
                <Button
                  size="lg"
                  onClick={handleAISuggest}
                  disabled={isLoading || !newTitle.trim()}
                  className="relative h-16 px-12 text-lg font-bold overflow-hidden bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 dark:from-purple-600 dark:via-pink-600 dark:to-cyan-600"
                >
                  <span className="relative z-10">
                    {isLoading ? 'Thinking...' : 'AI Magic'}
                  </span>
                  {!isLoading && (
                    <span className="absolute inset-0 bg-white opacity-30 animate-ping dark:opacity-50"></span>
                  )}
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