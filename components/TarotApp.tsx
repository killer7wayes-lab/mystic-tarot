"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { generateLocal } from "../local-llm";

// Simple deck (you can expand later)
const BASE_DECK = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World"
];

const DECK_STYLES = {
  classic: {
    id: "classic",
    label: "Classic Tarot",
    backGradient: "from-purple-900 via-indigo-900 to-slate-900",
    faceGradient: "from-yellow-300 via-amber-400 to-orange-500",
    border: "border-yellow-400",
  },
  anime: {
    id: "anime",
    label: "Anime Tarot",
    backGradient: "from-pink-600 via-purple-600 to-indigo-600",
    faceGradient: "from-fuchsia-400 via-rose-400 to-amber-300",
    border: "border-fuchsia-400",
  },
  goth: {
    id: "goth",
    label: "Goth Tarot",
    backGradient: "from-black via-slate-900 to-gray-800",
    faceGradient: "from-slate-700 via-slate-500 to-red-700",
    border: "border-red-500",
  },
} as const;

const SPREADS = {
  one: { id: "one", label: "1 Card – Simple Answer", slots: 1 },
  three: { id: "three", label: "3 Cards – Past/Present/Future", slots: 3 },
  nine: { id: "nine", label: "9 Cards – Grid", slots: 9 },
} as const;

export default function TarotApp() {
  const [deckStyle, setDeckStyle] = useState("classic");
  const [spread, setSpread] = useState("three");
  const [question, setQuestion] = useState("");
  const [shuffledDeck, setShuffledDeck] = useState(() =>
    [...BASE_DECK].sort(() => Math.random() - 0.5)
  );
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const slots = SPREADS[spread].slots;
  const selectedCards = useMemo(
    () => selectedIndexes.map((i) => shuffledDeck[i]),
    [selectedIndexes, shuffledDeck]
  );

  const canInterpret = selectedCards.length === slots;

  const shuffle = () => {
    setShuffledDeck([...BASE_DECK].sort(() => Math.random() - 0.5));
    setSelectedIndexes([]);
    setResult("");
  };

  const toggleCard = (index: number) => {
    if (selectedIndexes.includes(index)) {
      setSelectedIndexes(selectedIndexes.filter((i) => i !== index));
      return;
    }
    if (selectedIndexes.length >= slots) return;
    setSelectedIndexes([...selectedIndexes, index]);
  };

  const handleInterpret = async () => {
    if (!canInterpret) return;

    setLoading(true);
    setResult("");

    const prompt = `
User question: ${question || "General guidance"}
Spread: ${spread}
Deck style: ${deckStyle}
Cards drawn: ${selectedCards.join(", ")}

Write the reading in 3 clear parts:
1) Meaning of each card (1–2 lines per card)
2) Combined interpretation (max 10 lines)
3) Final practical advice (3–5 bullet points)
Tone: direct, no sugarcoating, brutally honest.
`;

    try {
      const answer = await generateLocal(prompt);
      setResult(answer);
    } catch (e) {
      setResult("Your browser does not support WebGPU. Try Chrome or Edge.");
    }

    setLoading(false);
  };

  const style = DECK_STYLES[deckStyle];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-mysticBg to-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Mystic Tarot ✦ AI</h1>

      {/* Deck & Spread selectors */}
      <div className="flex gap-4 mb-6">
        <select
          className="bg-black/50 p-2 rounded border border-gray-600"
          value={deckStyle}
          onChange={(e) => {
            setDeckStyle(e.target.value);
            setSelectedIndexes([]);
            setResult("");
          }}
        >
          {Object.values(DECK_STYLES).map((d) => (
            <option value={d.id} key={d.id}>
              {d.label}
            </option>
          ))}
        </select>

        <select
          className="bg-black/50 p-2 rounded border border-gray-600"
          value={spread}
          onChange={(e) => {
            setSpread(e.target.value);
            setSelectedIndexes([]);
            setResult("");
          }}
        >
          {Object.values(SPREADS).map((s) => (
            <option value={s.id} key={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={shuffle}
          className="bg-purple-700 px-4 rounded hover:bg-purple-600 transition"
        >
          Shuffle
        </button>
      </div>

      {/* Question */}
      <input
        className="w-full bg-black/40 border border-gray-600 p-2 rounded mb-6"
        placeholder="Your question (optional)"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {/* Deck */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3 mb-8">
        {shuffledDeck.map((name, idx) => {
          const selected = selectedIndexes.includes(idx);
          return (
            <motion.button
              key={idx}
              onClick={() => toggleCard(idx)}
              whileHover={{ scale: 1.05 }}
              className={`aspect-[3/5] rounded-xl text-xs flex items-center justify-center ${
                selected
                  ? `bg-gradient-to-br ${style.faceGradient} border-2 ${style.border}`
                  : `bg-gradient-to-br ${style.backGradient}`
              }`}
            >
              {selected ? name : "Tap"}
            </motion.button>
          );
        })}
      </div>

      {/* Interpret Button */}
      <button
        disabled={!canInterpret || loading}
        onClick={handleInterpret}
        className="bg-mysticAccent text-black font-bold px-6 py-2 rounded-xl disabled:bg-gray-700 mb-6"
      >
        {loading ? "Interpreting..." : "Get interpretation"}
      </button>

      {/* Result */}
      <div className="bg-black/40 border border-gray-700 p-4 rounded-xl min-h-[150px] whitespace-pre-wrap text-sm">
        {result || "Your reading will appear here."}
      </div>
    </div>
  );
}
