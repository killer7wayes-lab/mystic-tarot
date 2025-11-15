"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

// Simple text-only tarot deck (you can expand later to full 78)
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
  "The World",
  "Ace of Wands",
  "Ace of Cups",
  "Ace of Swords",
  "Ace of Pentacles"
];

const DECK_STYLES = {
  classic: {
    id: "classic",
    label: "Classic Tarot",
    backGradient: "from-purple-900 via-indigo-900 to-slate-900",
    faceGradient: "from-yellow-300 via-amber-400 to-orange-500",
    border: "border-yellow-400"
  },
  anime: {
    id: "anime",
    label: "Anime Tarot",
    backGradient: "from-pink-600 via-purple-600 to-indigo-600",
    faceGradient: "from-fuchsia-400 via-rose-400 to-amber-300",
    border: "border-fuchsia-400"
  },
  goth: {
    id: "goth",
    label: "Goth Tarot",
    backGradient: "from-black via-slate-900 to-gray-800",
    faceGradient: "from-slate-700 via-slate-500 to-red-700",
    border: "border-red-500"
  }
} as const;

type DeckKey = keyof typeof DECK_STYLES;

const SPREADS = {
  one: {
    id: "one",
    label: "1 Card – Simple Answer",
    slots: 1,
    description: "One clear message."
  },
  three: {
    id: "three",
    label: "3 Cards – Past / Present / Future",
    slots: 3,
    description: "Timeline overview."
  },
  nine: {
    id: "nine",
    label: "9 Cards – 3×3 Insight Grid",
    slots: 9,
    description: "Deeper multi-angle reading."
  },
  celtic: {
    id: "celtic",
    label: "Celtic Cross – 10 Cards",
    slots: 10,
    description: "Full in-depth spread."
  }
} as const;

type SpreadKey = keyof typeof SPREADS;

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function TarotApp() {
  const [deckStyle, setDeckStyle] = useState<DeckKey>("classic");
  const [spread, setSpread] = useState<SpreadKey>("three");
  const [question, setQuestion] = useState("");
  const [shuffledDeck, setShuffledDeck] = useState<string[]>(() =>
    shuffleArray(BASE_DECK)
  );
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const slots = SPREADS[spread].slots;

  const selectedCards = useMemo(
    () => selectedIndexes.map((i) => shuffledDeck[i]),
    [selectedIndexes, shuffledDeck]
  );

  const canInterpret = selectedCards.length === slots;

  const handleShuffle = () => {
    setShuffledDeck(shuffleArray(BASE_DECK));
    setSelectedIndexes([]);
    setResult("");
  };

  const toggleCard = (index: number) => {
    // Don't allow more than spread slots
    if (selectedIndexes.includes(index)) {
      setSelectedIndexes((prev) => prev.filter((i) => i !== index));
      setResult("");
      return;
    }
    if (selectedIndexes.length >= slots) return;
    setSelectedIndexes((prev) => [...prev, index]);
    setResult("");
  };

  const handleInterpret = async () => {
    if (!canInterpret) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          cards: selectedCards,
          spread,
          deckStyle
        })
      });
      const data = await res.json();
      setResult(data.answer || "No interpretation.");
    } catch (e) {
      setResult("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentDeck = DECK_STYLES[deckStyle];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-mysticBg to-black">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Mystic Tarot <span className="text-mysticAccent">✦ AI</span>
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              Choose your deck, pick a spread, breathe, then draw your cards.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Deck selector */}
            <div className="flex flex-col text-xs">
              <span className="mb-1 text-gray-300">Deck style</span>
              <select
                value={deckStyle}
                onChange={(e) => {
                  setDeckStyle(e.target.value as DeckKey);
                  setSelectedIndexes([]);
                  setResult("");
                }}
                className="bg-mysticCard/80 border border-mysticAccentSoft/60 rounded-xl px-3 py-2 text-sm shadow-mystic-card"
              >
                {Object.values(DECK_STYLES).map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Spread selector */}
            <div className="flex flex-col text-xs">
              <span className="mb-1 text-gray-300">Spread</span>
              <select
                value={spread}
                onChange={(e) => {
                  setSpread(e.target.value as SpreadKey);
                  setSelectedIndexes([]);
                  setResult("");
                }}
                className="bg-mysticCard/80 border border-mysticAccentSoft/60 rounded-xl px-3 py-2 text-sm shadow-mystic-card"
              >
                {Object.values(SPREADS).map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Shuffle */}
            <button
              onClick={handleShuffle}
              className="self-end md:self-center bg-gray-900/70 border border-mysticAccentSoft/60 rounded-xl px-4 py-2 text-sm hover:bg-gray-800 transition"
            >
              Shuffle deck
            </button>
          </div>
        </header>

        {/* Question + guidance */}
        <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] mb-8">
          <div className="bg-mysticCard/80 border border-mysticAccentSoft/40 rounded-2xl p-4 shadow-mystic-card">
            <label className="block text-xs text-gray-300 mb-2">
              Your question (optional)
            </label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Example: What should I focus on in the next 3 months?"
              className="w-full bg-black/60 border border-mysticAccentSoft/40 rounded-xl px-3 py-2 text-sm outline-none focus:border-mysticAccentSoft"
            />
            <p className="text-[11px] text-gray-400 mt-2">
              You can leave this empty for a general message.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/60 via-mysticCard/80 to-slate-900/70 border border-mysticAccentSoft/50 rounded-2xl p-4 text-xs shadow-mystic-card">
            <p className="text-[11px] text-gray-200 font-semibold mb-2">
              Before you pick your cards:
            </p>
            <ul className="space-y-1 text-[11px] text-gray-300">
              <li>• Take a slow breath in… and out.</li>
              <li>• Gently bring your question or intention to mind.</li>
              <li>• Let go of overthinking about any specific person or outcome.</li>
              <li>• When you feel ready, close your eyes for a moment…</li>
              <li>• Then open them and choose the cards that you feel drawn to.</li>
            </ul>
          </div>
        </section>

        {/* Deck visual */}
        <section className="mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">
                Pick {slots} card{slots > 1 ? "s" : ""} from the deck
              </h2>
              <p className="text-[11px] text-gray-400">
                Spread: {SPREADS[spread].description}
              </p>
            </div>
            <p className="text-[11px] text-gray-400">
              Selected:{" "}
              <span className="text-mysticAccent">
                {selectedCards.length}/{slots}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">
            {shuffledDeck.map((name, index) => {
              const selected = selectedIndexes.includes(index);
              return (
                <Card
                  key={index}
                  name={name}
                  selected={selected}
                  deckStyle={currentDeck}
                  onClick={() => toggleCard(index)}
                />
              );
            })}
          </div>
        </section>

        {/* Spread layout */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Spread layout</h2>
          <SpreadLayout spread={spread} cards={selectedCards} />
        </section>

        {/* Interpret + result */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleInterpret}
              disabled={!canInterpret || loading}
              className="bg-mysticAccent disabled:bg-gray-700 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-mystic-card hover:bg-mysticAccentSoft transition disabled:cursor-not-allowed"
            >
              {loading ? "Interpreting..." : "Get interpretation"}
            </button>
            {!canInterpret && (
              <span className="text-[11px] text-gray-400">
                Select {slots} card{slots > 1 ? "s" : ""} to continue.
              </span>
            )}
          </div>

          <div className="bg-black/60 border border-mysticAccentSoft/30 rounded-2xl p-4 min-h-[110px] text-sm">
            {result ? (
              <pre className="whitespace-pre-wrap text-gray-100 text-[13px] leading-relaxed">
                {result}
              </pre>
            ) : (
              <p className="text-[12px] text-gray-400">
                Your AI interpretation will appear here once you have chosen all
                your cards and clicked{" "}
                <span className="text-mysticAccent">Get interpretation</span>.
              </p>
            )}
          </div>
        </section>

        <footer className="text-[11px] text-gray-500 text-center pb-4">
          For reflection and entertainment only. Not professional advice.
        </footer>
      </div>
    </div>
  );
}

function Card({
  name,
  selected,
  deckStyle,
  onClick
}: {
  name: string;
  selected: boolean;
  deckStyle: (typeof DECK_STYLES)[DeckKey];
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="relative w-full aspect-[3/5] rounded-2xl focus:outline-none"
    >
      <div className={`absolute inset-0 rounded-2xl p-[2px] ${selected ? "shadow-mystic-card" : ""}`}>
        {/* Outer border with gradient */}
        <div
          className={`w-full h-full rounded-2xl bg-gradient-to-br ${
            selected ? deckStyle.faceGradient : deckStyle.backGradient
          } ${deckStyle.border}`}
        >
          {/* Inner panel */}
          <div className="w-full h-full rounded-2xl bg-black/60 flex items-center justify-center px-2">
            {selected ? (
              <motion.div
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.4 }}
                className="text-[11px] text-center text-gray-100 font-medium"
              >
                {name}
              </motion.div>
            ) : (
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 0 }}
                className="flex flex-col items-center gap-1 text-[10px] text-purple-200/80"
              >
                <span className="text-xl">✦</span>
                <span>Tap to draw</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function SpreadLayout({
  spread,
  cards
}: {
  spread: SpreadKey;
  cards: string[];
}) {
  const slots = SPREADS[spread].slots;
  const renderSlot = (idx: number, label?: string) => {
    const card = cards[idx];
    return (
      <div
        key={idx}
        className="w-20 sm:w-24 aspect-[3/5] border border-mysticAccentSoft/40 rounded-xl bg-mysticCard/70 flex flex-col items-center justify-center text-[10px] text-gray-300"
      >
        {card ? (
          <>
            <div className="text-[9px] text-mysticAccent mb-1">
              {label || `Card ${idx + 1}`}
            </div>
            <div className="px-1 text-[10px] text-center">{card}</div>
          </>
        ) : (
          <span className="opacity-60">
            {label || `Card ${idx + 1}`}
          </span>
        )}
      </div>
    );
  };

  if (spread === "one") {
    return (
      <div className="flex justify-center">
        {renderSlot(0, "Message")}
      </div>
    );
  }

  if (spread === "three") {
    return (
      <div className="flex justify-center gap-3 sm:gap-4">
        {renderSlot(0, "Past")}
        {renderSlot(1, "Present")}
        {renderSlot(2, "Future")}
      </div>
    );
  }

  if (spread === "nine") {
    return (
      <div className="grid grid-cols-3 gap-3 sm:gap-4 justify-items-center">
        {Array.from({ length: 9 }).map((_, i) => renderSlot(i))}
      </div>
    );
  }

  // Celtic Cross (10 cards) – approximate layout
  if (spread === "celtic") {
    return (
      <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-3 sm:gap-4 justify-items-center max-w-xl">
        {/* center cross (0–5) */}
        <div className="col-span-2 row-span-2 flex items-center justify-center">
          {renderSlot(0, "Present")}
        </div>
        <div className="col-span-2 row-span-2 flex items-center justify-center">
          {renderSlot(1, "Challenge")}
        </div>
        <div className="col-span-1">{renderSlot(2, "Past")}</div>
        <div className="col-span-1">{renderSlot(3, "Future")}</div>
        <div className="col-span-1">{renderSlot(4, "Above")}</div>
        <div className="col-span-1">{renderSlot(5, "Below")}</div>
        {/* right vertical line (6–9) */}
        <div className="col-start-4 row-span-1">{renderSlot(6, "Self")}</div>
        <div className="col-start-4 row-span-1">{renderSlot(7, "Environment")}</div>
        <div className="col-start-4 row-span-1">{renderSlot(8, "Hopes / Fears")}</div>
        <div className="col-start-4 row-span-1">{renderSlot(9, "Outcome")}</div>
      </div>
    );
  }

  return null;
}
