'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTaskStore, Project } from '@/store/useTaskStore';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const { projects, addProject } = useTaskStore();
  const [name, setName] = useState('');

  const projectList = Object.values(projects) as Project[];

  const handleCreate = () => {
    if (name.trim()) {
      addProject(name.trim());
      setName('');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-purple-900 p-8">

      {/* ⭐ Animated Star Field Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)] opacity-20"></div>
      <div className="stars"></div>
      <div className="twinkling"></div>

      {/* PAGE CONTENT */}
      <div className="relative max-w-5xl mx-auto text-white">
        <h1 className="text-6xl font-extrabold mb-10 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
          TaskFlow ⚡
        </h1>

        {/* CREATE PROJECT */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-8 shadow-2xl mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-6">Create Project</h2>
          <div className="flex gap-4">
            <Input
              className="bg-white/10 border-white/20 text-white placeholder-gray-300"
              placeholder="Project name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)] hover:shadow-[0_0_25px_rgba(168,85,247,1)] transition-all"
              onClick={handleCreate}
            >
              Create
            </Button>
          </div>
        </div>

        {/* YOUR PROJECTS */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-8 shadow-2xl animate-fade-in">
          <h2 className="text-3xl font-bold mb-6">Your Projects</h2>

          {projectList.length === 0 ? (
            <p className="text-gray-300">No projects yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectList.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <div className="p-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg
                  hover:scale-105 hover:shadow-[0_0_25px_rgba(236,72,153,0.7)] transition-all cursor-pointer
                  backdrop-blur-xl">
                    <h3 className="text-xl font-bold">{p.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* DEMO BUTTON */}
          {/* <div className="mt-10">
            <Link href="/projects/demo">
              <Button
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:bg-white/10 hover:text-white backdrop-blur-xl"
              >
                Open Demo Project
              </Button>
            </Link>
          </div> */}
        </div>
      </div>

      {/* ⭐ Custom Animations */}
      <style>{`
        .stars, .twinkling {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: block;
        }

        .stars {
          background: url('https://grainy-gradients.vercel.app/noise.svg');
          opacity: .15;
        }

        .twinkling {
          background: transparent url('https://www.transparenttextures.com/patterns/stardust.png') repeat top center;
          animation: move-stars 200s linear infinite;
          opacity: .18;
        }

        @keyframes move-stars {
          from { background-position: 0 0; }
          to { background-position: -10000px 5000px; }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
