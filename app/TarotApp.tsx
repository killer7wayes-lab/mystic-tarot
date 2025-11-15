"use client";

import { useState, useEffect } from "react";

const TAROT_CARDS = [
  "The Fool", "The Magician", "The High Priestess",
  "The Empress", "The Emperor", "The Hierophant",
  "The Lovers", "The Chariot", "Strength",
  "The Hermit", "Wheel of Fortune", "Justice",
  "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star",
  "The Moon", "The Sun", "Judgement", "The World"
];

export default function TarotApp() {
  const [cards, setCards] = useState<string[]>([]);
  const [reading, setReading] = useState("");
  const [llm, setLlm] = useState<any>(null);

  // Load WebLLM only in browser (fix for Vercel)
  useEffect(() => {
    async function loadLLM() {
      const webllm = await import("@mlc-ai/web-llm");

      const engine = await webllm.CreateMLCEngine(
        webllm.prebuiltAppConfig.chat_v3(),
        { initProgressCallback: console.log }
      );

      setLlm(engine);
    }

    loadLLM();
  }, []);

  // Draw 3 random cards
  function drawCards() {
    const selected = [...TAROT_CARDS]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    setCards(selected);

    if (llm) {
      generateReading(selected);
    }
  }

  async function generateReading(selectedCards: string[]) {
    const prompt = `
      You are a tarot master. Interpret these cards:
      ${selectedCards.join(", ")}
      Give:
      1. Short meaning for each card.
      2. Combined story.
      3. Final advice.
      Keep it short.
    `;

    const reply = await llm.chat.completions.create({
      model: "chat-v3",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    setReading(reply.choices[0].message.content);
  }

  return (
    <div style={{ padding: 40, color: "white", fontFamily: "sans-serif" }}>
      <h1>Mystic Tarot</h1>

      <button
        onClick={drawCards}
        style={{
          background: "#8b46ff",
          padding: "12px 22px",
          borderRadius: 8,
          border: "none",
          color: "white",
          fontSize: 20,
          cursor: "pointer"
        }}
      >
        Draw Cards
      </button>

      {cards.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2>Your Cards:</h2>
          <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
            {cards.map((card) => (
              <div
                key={card}
                style={{
                  background: "#1c1c28",
                  padding: 20,
                  borderRadius: 8,
                  fontSize: 18
                }}
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      )}

      {reading && (
        <pre
          style={{
            marginTop: 40,
            padding: 20,
            background: "#252533",
            borderRadius: 8,
            whiteSpace: "pre-wrap",
            fontSize: 16,
          }}
        >
          {reading}
        </pre>
      )}
    </div>
  );
}

