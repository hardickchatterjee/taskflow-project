// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) return new Response('Missing projectId', { status: 400 });

  // Use same global queue
  const eventQueue: Array<{ projectId: string; event: any }> = (global as any).eventQueue || [];
  (global as any).eventQueue = eventQueue;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      const interval = setInterval(() => {
        const eventsForProject = eventQueue
          .filter(e => e.projectId === projectId)
          .map(e => e.event);

        if (eventsForProject.length > 0) {
          // Remove processed events
          (global as any).eventQueue = eventQueue.filter(e => e.projectId !== projectId);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'batch', events: eventsForProject })}\n\n`));
        }
      }, 100);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export const dynamic = 'force-dynamic';