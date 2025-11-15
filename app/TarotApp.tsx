"use client";

import { useState } from "react";

export default function TarotApp() {
  const decks = {
    "Classic Rider-Waite": [
      "The Fool","The Magician","The High Priestess","The Empress","The Emperor",
      "The Hierophant","The Lovers","The Chariot","Strength","The Hermit",
      "Wheel of Fortune","Justice","The Hanged Man","Death","Temperance",
      "The Devil","The Tower","The Star","The Moon","The Sun",
      "Judgement","The World"
    ],
    "Dark Gothic Deck": [
      "The Void", "The Raven", "The Blood Moon", "The Fallen Angel",
      "The Shadow Priestess", "The Bone King", "The Abyss Gate"
    ]
  };

  const [selectedDeck, setSelectedDeck] = useState("Classic Rider-Waite");
  const [cards, setCards] = useState<string[]>([]);
  const [reading, setReading] = useState("");

  async function drawCards() {
    const deck = decks[selectedDeck];
    const chosen = [...deck].sort(() => Math.random() - 0.5).slice(0, 3);
    setCards(chosen);

    const prompt = `
You are a master tarot reader with 25+ years of experience.
Interpret these 3 tarot cards with depth, emotion, symbolism, and storytelling:

Cards: ${chosen.join(", ")}

Structure your answer EXACTLY like this:

1. **Card Meanings (Detailed)**  
Explain the symbolism, emotional energy, and accurate upright meanings.

2. **Combined Story (Flowing Explanation)**  
Explain how the energies connect.  
Make it mystical but grounded.  
Avoid generic phrases like “inner guidance” or “change.”  
Give powerful, specific insight.

3. **Advice (Real + Spiritual)**  
Give practical guidance.  
Speak like a wise, intuitive tarot master.
`;

    const response = await fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    setReading(data.text || "Error generating reading.");
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-4xl font-bold mb-6">Mystic Tarot</h1>

      {/* Deck Selector */}
      <div className="mb-4">
        <label className="block mb-2">Choose Deck:</label>
        <select
          className="bg-black text-white p-2 rounded"
          value={selectedDeck}
          onChange={(e) => setSelectedDeck(e.target.value)}
        >
          {Object.keys(decks).map(deck => (
            <option key={deck}>{deck}</option>
          ))}
        </select>
      </div>

      <button
        onClick={drawCards}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-800 rounded"
      >
        Draw Cards
      </button>

      {/* Drawn Cards */}
      {cards.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl mb-3">Your Cards:</h2>
          <div className="flex gap-4">
            {cards.map((c) => (
              <div key={c} className="bg-gray-800 px-4 py-2 rounded">
                {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reading */}
      {reading && (
        <div className="mt-8 p-6 bg-gray-900 rounded whitespace-pre-line">
          {reading}
        </div>
      )}
    </div>
  );
}
