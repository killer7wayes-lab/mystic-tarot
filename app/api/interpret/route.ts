import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, cards } = await req.json();

    const prompt = `
You are an expert tarot reader.
Speak directly, honestly, and without sugarcoating.
Give clear, structured insights.

User question: ${question || "General guidance"}
Cards drawn: ${Array.isArray(cards) ? cards.join(", ") : "None"}

Instructions:
1. Interpret each card individually (short & direct).
2. Give a combined meaning (how the cards interact).
3. Give final advice: what should the user do next?
4. Tone: grounded, confident, no fluffy clichés.
`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    // If Deepseek fails, we still return a valid JSON to the frontend
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Deepseek error:", response.status, errText);
      return NextResponse.json(
        {
          success: false,
          answer:
            "The AI service failed to respond. Please check your API key or try again later.",
        },
        { status: 200 }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        answer: data.choices?.[0]?.message?.content || "No response from AI.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Route /api/interpret crashed:", err);
    return NextResponse.json(
      {
        success: false,
        answer: "Server error while interpreting the cards.",
      },
      { status: 200 }
    );
  }
}
