'use client';

// import socket from '@/lib/socket';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';

interface Activity {
  type: string;
  payload: any;
  projectId: string;
  timestamp?: number;
}

export function ActivityFeed({ projectId }: { projectId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const handler = (data: Activity) => {
      if (data.projectId === projectId) {
        setActivities((prev) => [...prev, { ...data, timestamp: Date.now() }]);
      }
    };

    // socket.on('update', handler);

    return () => {
      // socket.off('update', handler);
    };
  }, [projectId]);

  return (
    <ScrollArea className="h-96 w-full rounded-md border">
      <div className="p-4">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500">No activity yet. Make a move!</p>
        ) : (
          activities.map((act, i) => (
            <div key={i} className="py-2 border-b border-gray-200 last:border-0 text-xs">
              <span className="font-medium text-gray-700">{act.type}</span>
              <pre className="mt-1 text-gray-600 overflow-x-auto">
                {JSON.stringify(act.payload, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
