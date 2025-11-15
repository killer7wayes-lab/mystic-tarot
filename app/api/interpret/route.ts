// app/api/interpret/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, cards, spread, deckStyle } = await req.json();

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing DEEPSEEK_API_KEY on server" },
        { status: 500 }
      );
    }

    const prompt = `
You are a direct, no-bullshit tarot reader.
You speak clearly, no sugarcoating, no vague spiritual fluff.

User question: ${question || "General guidance"}
Spread type: ${spread}
Deck style: ${deckStyle}
Cards drawn: ${cards.join(", ")}

1) Brief meaning of each card in this context (1–2 lines each).
2) Combined story of the spread (max 8–10 lines).
3) Final advice: 3–5 bullet points of what the user should do or focus on next.
`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        {
          error: "DeepSeek API error",
          status: response.status,
          body: text,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const answer =
      data.choices?.[0]?.message?.content || "No response from AI.";

    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Server exception",
        details: String(err),
      },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
