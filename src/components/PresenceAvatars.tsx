'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function PresenceAvatars({ projectId }: { projectId: string }) {
  const presence: string[] = ['alice', 'bob', 'carol', 'dave'];

  return (
    <div className="flex -space-x-2">
      {presence.slice(0, 3).map((userId) => (
        <Avatar key={userId} className="h-8 w-8 border-2 border-white">
          <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            {userId.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {presence.length > 3 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-white ring-2 ring-white">
          +{presence.length - 3}
        </div>
      )}
    </div>
  );
}
