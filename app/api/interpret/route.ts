import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, cards } = await req.json();

    const prompt = `
You are an expert tarot reader. 
Speak directly, honestly, and without sugarcoating.
Give clear, structured insights.

User question: ${question || "General guidance"}
Cards drawn: ${cards?.join(", ")}

Instructions:
1. Interpret each card individually (short & direct)
2. Give a combined meaning (how the cards interact)
3. Give final advice: what should the user do next?
4. Keep the tone grounded, confident, and realistic.
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

    const data = await response.json();

    return NextResponse.json({
      success: true,
      answer: data.choices?.[0]?.message?.content || "No response from AI",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get interpretation",
      },
      { status: 500 }
    );
  }
}
