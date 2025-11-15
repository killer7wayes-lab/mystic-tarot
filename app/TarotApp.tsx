"use client";

import React, { useState, useEffect } from "react";
import * as webllm from "https://esm.run/@mlc-ai/web-llm";

export default function TarotApp() {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [spreadType, setSpreadType] = useState("Past / Present / Future");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [modelReady, setModelReady] = useState(false);

  // Load WebLLM in the browser
  useEffect(() => {
    async function loadModel() {
      try {
        const engine = await webllm.CreateMLCEngine(
          webllm.prebuiltAppConfig.default
        );
        (window as any).webllmEngine = engine;
        setModelReady(true);
      } catch (err) {
        console.error("WebLLM load error:", err);
        setAiOutput("Failed to load AI model. Please refresh.");
      }
    }
    loadModel();
  }, []);

  // Example tarot deck (add your real list)
  const tarotDeck = [
    "The Fool", "The Magician", "The High Priestess", "The Empress",
    "The Emperor", "The Hierophant", "The Lovers", "The Chariot",
    "Strength", "The Hermit", "Wheel of Fortune", "Justice",
    "The Hanged Man", "Death", "Temperance", "The Devil",
    "The Tower", "The Star", "The Moon", "The Sun",
    "Judgement", "The World",
    "Ace of Pentacles", "Ace of Swords", "Ace of Cups", "Ace of Wands"
  ];

  function drawCard() {
    if (selectedCards.length >= 3) return;
    const card = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
    setSelectedCards([...selectedCards, card]);
  }

  function resetSession() {
    setSelectedCards([]);
    setAiOutput("");
  }

  async function interpretCards() {
    if (!modelReady) {
      setAiOutput("AI model still loading… please wait.");
      return;
    }

    if (selectedCards.length === 0) {
      setAiOutput("Please draw cards first.");
      return;
    }

    setLoading(true);

    const prompt = `
You are a direct tarot interpreter. No spiritual fluff. Clear, sharp, actionable.
Question: ${question || "General guidance"}
Spread: ${spreadType}
Cards: ${selectedCards.join(", ")}

Write:
1) Short meaning of each card (2 lines each)
2) Combined story (8–10 lines)
3) Final advice (5 bullet points)
    `;

    try {
      const engine = (window as any).webllmEngine;
      const reply = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        stream: false,
      });

      const text = reply.choices?.[0]?.message?.content || "No output.";
      setAiOutput(text);
    } catch (err) {
      console.error(err);
      setAiOutput("AI failed to interpret. Try again.");
    }

    setLoading(false);
  }

  return (
    <div className="p-6 text-white min-h-screen">
      <h1 className="text-3xl mb-4">Mystic Tarot AI</h1>

      {/* Question Input */}
      <textarea
        className="w-full bg-black/30 p-3 rounded mb-4"
        placeholder="Your question (optional)…"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {/* Draw Cards */}
      <button
        className="bg-purple-600 px-4 py-2 rounded mr-3"
        onClick={drawCard}
      >
        Draw Card
      </button>

      <button
        className="bg-gray-700 px-4 py-2 rounded"
        onClick={resetSession}
      >
        Reset
      </button>

      {/* Cards */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {selectedCards.map((card, i) => (
          <div key={i} className="p-4 bg-white/10 rounded text-center">
            {card}
          </div>
        ))}
      </div>

      {/* Interpret Button */}
      <button
        className="mt-6 bg-purple-500 px-6 py-3 rounded text-lg"
        onClick={interpretCards}
        disabled={loading}
      >
        {loading ? "Interpreting…" : "Get Interpretation"}
      </button>

      {/* Output */}
      {aiOutput && (
        <pre className="mt-6 p-4 bg-black/40 rounded whitespace-pre-wrap text-sm">
          {aiOutput}
        </pre>
      )}

      {!modelReady && (
        <p className="text-yellow-400 mt-4">Loading AI model…</p>
      )}
    </div>
  );
}
