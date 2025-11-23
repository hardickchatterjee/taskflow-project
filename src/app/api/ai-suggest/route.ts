// app/api/ai-suggest/route.ts
import { NextRequest } from 'next/server';

export const POST = async (req: NextRequest) => {
  let title: string;

  try {
    const body = await req.json();           // ← read body once
    title = (body.title || '').trim();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // ——— Try Gemini (optional) ———
  if (process.env.GEMINI_API_KEY && title) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Task title: "${title}"

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "status": "TODO" | "IN_PROGRESS" | "DONE",
  "reason": "one short sentence why"
}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          const json = JSON.parse(text);
          return Response.json(json);
        }
      }
    } catch (e) {
      console.warn('Gemini failed, falling back to rule-based AI', e);
      // → continue to fallback
    }
  }

  // ——— Bulletproof rule-based fallback (always works) ———
  const lower = title.toLowerCase();

  let status: 'TODO' | 'IN_PROGRESS' | 'DONE' = 'TODO';
  let reason = 'New task';

  if (lower.includes('deploy') || lower.includes('release') || lower.includes('ship') || lower.includes('done') || lower.includes('finished')) {
    status = 'DONE';
    reason = 'sounds like a completed action';
  } else if (
    lower.includes('fix') ||
    lower.includes('bug') ||
    lower.includes('debug') ||
    lower.includes('investigate') ||
    lower.includes('refactor') ||
    lower.includes('working on') ||
    lower.includes('in progress')
  ) {
    status = 'IN_PROGRESS';
    reason = 'active development or debugging';
  }

  return Response.json({ status, reason });
};

export const runtime = 'edge'; // optional – super fast