import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { question, cards, spread, deckStyle } = await req.json();

  const spreadName =
    spread === "one"
      ? "one-card message"
      : spread === "three"
      ? "past / present / future"
      : spread === "nine"
      ? "nine-card grid"
      : "Celtic Cross";

  const introQuestion = question
    ? `Question: ${question}\n\n`
    : "General reading (no specific question).\n\n";

  const text = `${introQuestion}Spread: ${spreadName}
Deck style: ${deckStyle}

Cards drawn:
- ${cards.join("\n- ")}

Interpretation:
• There is a shift in your energy around this topic.
• A mix of inner reflection and practical action is needed.
• Some patterns from the past are ready to be released so you can move forward.

Practical advice:
1) Write one clear intention related to this situation.
2) Take one small, concrete action in the next 48 hours.
3) Revisit this reading in a few days and notice what changed.

Remember: the cards highlight energy and possibilities – you always keep your free will.`;

  return NextResponse.json({ text });
}
