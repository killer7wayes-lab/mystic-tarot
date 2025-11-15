// app/api/interpret/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, cards, spread, deckStyle } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY on server" },
        { status: 500 }
      );
    }

    const prompt = `
You are a direct, no-BS tarot reader.
No sugarcoating, no fake spirituality.

Question: ${question || "General guidance"}
Spread: ${spread}
Deck: ${deckStyle}
Cards: ${cards.join(", ")}

Answer structure:
1) Short meaning (1–2 lines) for each card.
2) Combined story (max 8 lines).
3) Final advice (3–5 bullet points).
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",  // ✅ NEW MODEL
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 800,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Groq API error",
          status: response.status,
          body: data,
        },
        { status: 500 }
      );
    }

    const answer =
      data.choices?.[0]?.message?.content || "No response from Groq.";

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
