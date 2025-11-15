"use client";

import { useState } from "react";

export default function TarotApp() {
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [reading, setReading] = useState<string>("");

  // Simple fake local “AI” generator
  function generateInterpretation(cards: string[]) {
    return `
Here’s your reading:

1. **Card meanings**
${cards.map(c => `- **${c}**: A symbol of energy, change, intuition, and personal growth.`).join("\n")}

2. **Combined Story**
These cards together suggest transformation, inner guidance, and important decisions coming into your life.

3. **Advice**
Stay grounded, trust your intuition, and follow the path that aligns with long-term stability.
    `;
  }

  const allCards = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
    "The Lovers", "The Chariot", "Strength", "The Hermit", "Wheel of Fortune",
    "Justice", "The Hanged Man", "Death", "Temperance", "The Devil",
    "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
  ];

  function drawThree() {
    const drawn = [];
    while (drawn.length < 3) {
      const card = allCards[Math.floor(Math.random() * allCards.length)];
      if (!drawn.includes(card)) drawn.push(card);
    }
    setSelectedCards(drawn);
    setReading(generateInterpretation(drawn));
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>Mystic Tarot</h1>

      <button
        onClick={drawThree}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#6a4cff",
          borderRadius: "8px"
        }}
      >
        Draw Cards
      </button>

      {selectedCards.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Your Cards:</h2>
          <div>
            {selectedCards.map((c, i) => (
              <div key={i} style={{ marginTop: "8px" }}>
                {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {reading && (
        <pre
          style={{
            marginTop: "20px",
            whiteSpace: "pre-wrap",
            background: "rgba(255,255,255,0.1)",
            padding: "15px",
            borderRadius: "10px"
          }}
        >
          {reading}
        </pre>
      )}
    </div>
  );
}
