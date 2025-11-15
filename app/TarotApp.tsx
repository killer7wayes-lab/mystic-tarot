"use client";

import React, { useState } from "react";

// 🔮 Small optimized decks
const decks = {
  Classic: [
    "The Fool","The Magician","The High Priestess","The Empress","The Emperor",
    "The Lovers","Strength","The Hermit","Wheel of Fortune","Death","The Star",
    "The Moon","The Sun","Judgement","The World"
  ],
  Anime: [
    "Anime Fool", "Anime Magician", "Anime Lovers", "Anime Death", "Anime Star",
    "Anime Sun", "Anime Moon"
  ],
  Gothic: [
    "Gothic Death","Gothic Moon","Gothic Tower","Gothic Devil","Gothic Hermit",
    "Gothic Star"
  ]
};

export default function TarotApp() {
  const [deck, setDeck] = useState("Classic");
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState<string[]>([]);
  const [reading, setReading] = useState("");

  async function drawCards() {
    const chosenDeck = decks[deck];
    const draw = [];

    for (let i = 0; i < 3; i++) {
      draw.push(chosenDeck[Math.floor(Math.random() * chosenDeck.length)]);
    }

    setCards(draw);
    generateReading(draw);
  }

  async function generateReading(drawnCards: string[]) {
    setReading("🔮 Connecting to Grok…");

    const prompt = `
You are a master tarot reader with 20+ years of intuitive and symbolic experience.

USER QUESTION:
"${question || "General guidance"}"

CARDS DRAWN:
${drawnCards.join(", ")}

WRITING RULES:
- No repetition
- No generic clichés ("inner guidance", "change is coming", etc.)
- Adapt the interpretation to the user's question
- Use symbolism, psychology, and narrative flow
- Tone: mystical, confident, direct, emotional
- Break the answer into clear sections

FORMAT:

1) 🔹 **Meaning of Each Card**
Give a deep, specific meaning for each one in THIS context.

2) 🔮 **Combined Story**
Explain what the cards say together as a whole.
Make it meaningful, not generic.

3) ✨ **Advice**
Strong, practical, emotional tarot guidance.
`;

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROK_KEY}`,
        },
        body: JSON.stringify({
          model: "grok-2-latest",
          messages: [{ role: "user", content: prompt }],
          temperature: 1,
        }),
      });

      const data = await res.json();
      setReading(data?.choices?.[0]?.message?.content || "No reading.");
    } catch {
      setReading("❌ Error contacting Grok.");
    }
  }

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>Mystic Tarot</h1>

      {/* Question */}
      <textarea
        placeholder="Your question (optional)"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{
          width: "100%",
          height: 70,
          marginTop: 20,
          padding: 10,
          background: "#111",
          borderRadius: 6,
          color: "white",
        }}
      />

      {/* Deck Selector */}
      <div style={{ marginTop: 20 }}>
        <label>Deck:</label>
        <select
          value={deck}
          onChange={(e) => setDeck(e.target.value)}
          style={{ marginLeft: 10, padding: 5, color: "black" }}
        >
          {Object.keys(decks).map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Draw Button */}
      <button
        onClick={drawCards}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#b06bff",
          borderRadius: 8,
          fontSize: 16,
        }}
      >
        Draw 3 Cards
      </button>

      {/* Cards */}
      {cards.length > 0 && (
        <>
          <h2 style={{ marginTop: 25 }}>Your Cards</h2>
          <div style={{ display: "flex", gap: 10 }}>
            {cards.map((c) => (
              <div
                key={c}
                style={{
                  background: "#222",
                  padding: 12,
                  borderRadius: 6,
                }}
              >
                {c}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reading */}
      {reading && (
        <div
          style={{
            marginTop: 25,
            background: "#222",
            padding: 20,
            borderRadius: 10,
            whiteSpace: "pre-wrap",
          }}
        >
          {reading}
        </div>
      )}
    </div>
  );
}
