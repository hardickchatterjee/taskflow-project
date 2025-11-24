// app/api/events/broadcast/route.ts
import { NextRequest, NextResponse } from 'next/server';


const eventQueue: Array<{ projectId: string; event: any }> = (global as any).eventQueue || [];
(global as any).eventQueue = eventQueue; // persist across requests

export async function POST(request: NextRequest) {
  const { projectId, event } = await request.json();

  if (!projectId || !event) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  // Push event to global queue — all SSE clients will receive it
  eventQueue.push({ projectId, event });

  return NextResponse.json({ success: true });
}