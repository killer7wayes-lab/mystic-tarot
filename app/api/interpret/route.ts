import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, cards } = await req.json();

    const prompt = `
You are an expert tarot reader. 
You speak directly, with no sugarcoating. 
You give clear, structured, emotionally honest insights.

User question: ${question || "General guidance"}
Cards drawn: ${cards?.join(", ")}

For each spread:
- Interpret each card individually (short and direct)
- Then give a combined reading that connects the cards
- Then give final advice: what should the user do next?

Keep the tone: direct, grounded, confident. No clichés, no generic spiritual fluff.
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

Remember: the cards highlight energy and possibilities – you always keep your free will.`;

  return NextResponse.json({ text });
}
