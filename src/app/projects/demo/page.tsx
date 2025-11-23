'use client';

import { useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';

export default function DemoPage() {
  const initDemoData = useTaskStore((s) => s.initDemoData);

  useEffect(() => {
    initDemoData();
  }, []);

  return (
    <div>
      {/* Your Kanban Board or layout */}
    </div>
  );
}
