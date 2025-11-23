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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8">TaskFlow</h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Create Project</h2>
          <div className="flex gap-4">
            <Input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Your Projects</h2>
          {projectList.length === 0 ? (
            <p className="text-gray-500">No projects yet</p>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {projectList.map((p: Project) => (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-8 rounded-xl hover:scale-105 transition">
                    <h3 className="text-xl font-bold">{p.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-8">
            <Link href="/projects/demo">
              <Button variant="outline" size="lg">
                Open Demo Project
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
