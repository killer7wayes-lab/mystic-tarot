"use client";

import { useState } from "react";

export default function TarotApp() {
  const [cards, setCards] = useState<string[]>([]);
  const [reading, setReading] = useState("");

  const deck = [
    "The Fool", "The Magician", "The High Priestess", "The Empress",
    "The Emperor", "The Lovers", "The Chariot", "Strength", "The Hermit",
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
    "Judgement", "The World"
  ];

  function drawCards() {
    const drawn = [];
    while (drawn.length < 3) {
      const card = deck[Math.floor(Math.random() * deck.length)];
      if (!drawn.includes(card)) drawn.push(card);
    }
    setCards(drawn);

    setReading(
`Your reading:

1. Card meanings:
${drawn.map(c => `– ${c}: A sign of inner change and guidance.`).join("\n")}

2. Combined Story:
Your energy is shifting. Trust your intuition and prepare for growth.

3. Advice:
Stay grounded and move with purpose.`
    );
  }

  return (
    <div className="text-white max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Mystic Tarot</h1>

      <button
        onClick={drawCards}
        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-lg"
      >
        Draw Cards
      </button>

      {cards.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Cards:</h2>

          <div className="flex gap-4">
            {cards.map((c, i) => (
              <div key={i} className="bg-white/10 p-4 rounded-lg">
                {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {reading && (
        <pre className="mt-8 bg-white/10 p-6 rounded-lg whitespace-pre-wrap">
          {reading}
        </pre>
      )}
    </div>
  );
}
