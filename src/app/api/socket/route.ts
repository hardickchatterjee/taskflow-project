import { Server } from 'socket.io';
import type { NextRequest } from 'next/server';

let io: Server;

export async function GET(req: NextRequest) {
  if (!io) {
    io = new Server((req as any).socket.server);
    (req as any).socket.server.io = io;

    io.on('connection', (socket) => {
      socket.on('join-project', (projectId) => {
        socket.join(projectId);
      });

      socket.on('task-updated', (data) => {
        socket.to(data.projectId).emit('task-updated', data);
      });
    });
  }
  return new Response('OK');
}
