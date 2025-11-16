"use client";

import React, { useEffect, useMemo, useState } from "react";

// ----- Types -----
type DeckStyle = "classic" | "goth" | "anime";
type SpreadType = "one" | "three" | "cross" | "nine";

interface TarotCard {
  id: string;
  name: string;
  suit: "Major" | "Wands" | "Cups" | "Swords" | "Pentacles";
  number: number;
}

// ----- Tarot Deck (78 cards) -----
// Names are used ONLY for interpretation prompt & result, not shown on card backs.
const MAJOR_ARCANA = [
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
];

const MINOR_RANKS = [
  "Ace",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Page",
  "Knight",
  "Queen",
  "King",
];

const createDeck = (): TarotCard[] => {
  const cards: TarotCard[] = [];

  // Major
  MAJOR_ARCANA.forEach((name, index) => {
    cards.push({
      id: `major-${index}`,
      name,
      suit: "Major",
      number: index,
    });
  });

  const suits: TarotCard["suit"][] = ["Wands", "Cups", "Swords", "Pentacles"];

  suits.forEach((suit) => {
    MINOR_RANKS.forEach((rank, idx) => {
      cards.push({
        id: `${suit}-${idx}`,
        name: `${rank} of ${suit}`,
        suit,
        number: idx + 1,
      });
    });
  });

  return cards;
};

const FULL_DECK = createDeck();

// ----- WebLLM / DeepSeek config (local LLM via WebGPU – 0$) -----
// Uses WebLLM via CDN. Browser downloads the model once, then caches it. :contentReference[oaicite:1]{index=1}
const MODEL_NAME = "DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC"; // You can change to a smaller DeepSeek model if it’s too heavy. :contentReference[oaicite:2]{index=2}

type WebLLMEngine = any; // keep it simple for now

const systemPrompt = `
You are a deep, intelligent, no-bullshit tarot reader.
You speak clearly and directly, but with empathy.
User is choosing between decks (classic, goth, anime) and spreads (one-card, three-card, Celtic Cross, nine-card).
Your job:

1. Respect the card meanings (Rider–Waite style) but you can adapt the "vibe" to the chosen deck (classic / goth / anime).
2. Always structure the answer and go deep on psychology, patterns, and advice.
3. Do NOT predict death, illness, or medical stuff. Stay on emotional, psychological, practical guidance.
4. If the question is about love, talk about emotions, dynamics, patterns, and self-respect.
5. If the question is about work/money, talk about strategy, mindset, and realistic next steps.
6. Be specific. No generic "everything will be fine" fluff.
7. At the end, always give 3 very concrete action steps.
`;

function buildUserPrompt(
  question: string,
  deckStyle: DeckStyle,
  spreadType: SpreadType,
  selectedCards: TarotCard[]
): string {
  const spreadName =
    spreadType === "one"
      ? "One-card pull"
      : spreadType === "three"
      ? "Three-card Past / Present / Future spread"
      : spreadType === "cross"
      ? "Celtic Cross spread"
      : "Nine-card spread";

  const positionsDescription =
    spreadType === "one"
      ? "Position 1: Core answer / main energy."
      : spreadType === "three"
      ? "Position 1: Past. Position 2: Present. Position 3: Future."
      : spreadType === "cross"
      ? "Classic Celtic Cross: 1) Present situation, 2) Crossing challenge, 3) Subconscious, 4) Recent past, 5) Conscious goal, 6) Near future, 7) Self, 8) Environment, 9) Hopes/fears, 10) Outcome."
      : "Nine-card grid: 1-3 top row (past), 4-6 middle row (present), 7-9 bottom row (future & outcome).";

  const cardList = selectedCards
    .map((card, index) => `Card ${index + 1}: ${card.name} (${card.suit})`)
    .join("\n");

  return `
User question: "${question || "[User did not type a question]"}"

Chosen deck style: ${deckStyle}
Spread type: ${spreadName}
Positions meaning: ${positionsDescription}

Drawn cards:
${cardList}

Please:
- First, briefly restate the question and the general energy.
- Then interpret each card in its position (explicitly mention which card and which position).
- Then synthesize: what is the story, tension, or main lesson tying the cards together?
- Finally, give 3 clear, practical action steps tailored to the question.
`;
}

// ----- Helper: spread size -----
function spreadSize(spread: SpreadType): number {
  switch (spread) {
    case "one":
      return 1;
    case "three":
      return 3;
    case "cross":
      return 10;
    case "nine":
      return 9;
    default:
      return 3;
  }
}

// ----- The Tarot App Component -----
const TarotApp: React.FC = () => {
  const [deckStyle, setDeckStyle] = useState<DeckStyle>("classic");
  const [spread, setSpread] = useState<SpreadType>("three");
  const [question, setQuestion] = useState("");
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);

  const [engine, setEngine] = useState<WebLLMEngine | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [loadingModel, setLoadingModel] = useState(false);
  const [loadProgress, setLoadProgress] = useState<string>("");
  const [interpreting, setInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState<string>("");

  const requiredCards = useMemo(() => spreadSize(spread), [spread]);

  // Initialize WebLLM + DeepSeek in browser (WebGPU, no API, 0$)
  useEffect(() => {
    let cancelled = false;

    const initEngine = async () => {
      setLoadingModel(true);
      setEngineError(null);
      setLoadProgress("Preparing DeepSeek…");

      try {
        // dynamic import from CDN, works on Vercel / Bolt environments. :contentReference[oaicite:3]{index=3}
        // @ts-ignore
        const webllm = await import("https://esm.run/@mlc-ai/web-llm");

        const engineInstance = await webllm.CreateMLCEngine(MODEL_NAME, {
          initProgressCallback: (progress: any) => {
            if (cancelled) return;
            const pct = progress?.progress
              ? Math.round(progress.progress * 100)
              : 0;
            const text = progress?.text ?? "";
            setLoadProgress(`${pct}% – ${text}`);
          },
        });

        if (!cancelled) {
          setEngine(engineInstance);
          setLoadProgress("Model loaded. Ready.");
        }
      } catch (err: any) {
        console.error("Error loading WebLLM / DeepSeek:", err);
        if (!cancelled) {
          setEngineError(
            "Could not load the local AI model. Check that your browser supports WebGPU and try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingModel(false);
        }
      }
    };

    initEngine();

    return () => {
      cancelled = true;
    };
  }, []);

  // Shuffle the deck once (for each refresh)
  const shuffledDeck = useMemo(() => {
    const arr = [...FULL_DECK];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  // Card selecting logic
  const toggleCard = (card: TarotCard) => {
    const already = selectedCards.find((c) => c.id === card.id);
    if (already) {
      setSelectedCards((prev) => prev.filter((c) => c.id !== card.id));
    } else {
      if (selectedCards.length >= requiredCards) return;
      setSelectedCards((prev) => [...prev, card]);
    }
    setInterpretation("");
  };

  const resetSelection = () => {
    setSelectedCards([]);
    setInterpretation("");
  };

  // Interpretation
  const handleInterpret = async () => {
    if (!engine) {
      alert(
        "The AI model is not ready yet. Wait a bit for DeepSeek to load (WebGPU)."
      );
      return;
    }
    if (selectedCards.length !== requiredCards) {
      alert(`You must pick exactly ${requiredCards} card(s) for this spread.`);
      return;
    }

    setInterpreting(true);
    setInterpretation("");

    try {
      const userPrompt = buildUserPrompt(
        question,
        deckStyle,
        spread,
        selectedCards
      );

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];

      // WebLLM uses an OpenAI-style chat API in browser. :contentReference[oaicite:4]{index=4}
      const reply = await engine.chat.completions.create({
        messages,
        temperature: 0.9,
        max_tokens: 900,
      });

      const content =
        reply?.choices?.[0]?.message?.content ||
        "I could not generate an interpretation.";
      setInterpretation(content);
    } catch (err) {
      console.error(err);
      setInterpretation(
        "Error while asking the local AI. Please reload the page and try again."
      );
    } finally {
      setInterpreting(false);
    }
  };

  // UI helpers
  const spreadLabel = (s: SpreadType) => {
    switch (s) {
      case "one":
        return "1 Card (Direct Answer)";
      case "three":
        return "3 Cards (Past / Present / Future)";
      case "cross":
        return "Celtic Cross (10 Cards)";
      case "nine":
        return "9 Cards (Grid)";
      default:
        return "Spread";
    }
  };

  const deckLabel = (d: DeckStyle) => {
    if (d === "classic") return "Classic";
    if (d === "goth") return "Goth";
    return "Anime";
  };

  const cardBackStyleClasses = useMemo(() => {
    if (deckStyle === "classic")
      return "bg-gradient-to-br from-purple-800 to-yellow-500 border-yellow-400";
    if (deckStyle === "goth")
      return "bg-gradient-to-br from-gray-900 to-red-700 border-red-500";
    return "bg-gradient-to-br from-indigo-700 to-pink-500 border-pink-400";
  }, [deckStyle]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-3xl border border-purple-700/40 bg-slate-900/70 shadow-xl backdrop-blur-xl p-4 sm:p-8 space-y-6">
        {/* Header */}
        <header className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-wide text-purple-200">
            Mystic Tarot Portal
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Breathe. Relax your shoulders. Let your mind go quiet.  
            When you&apos;re ready, choose your deck, type your question, and pick
            your cards.
          </p>
        </header>

        {/* Deck & spread choice */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Deck style
            </h2>
            <div className="flex gap-2">
              {(["classic", "goth", "anime"] as DeckStyle[]).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDeckStyle(d);
                    setInterpretation("");
                  }}
                  className={`flex-1 rounded-full px-3 py-2 text-xs sm:text-sm border transition
                    ${
                      deckStyle === d
                        ? "bg-purple-600 text-white border-purple-300 shadow-md"
                        : "bg-slate-900/60 text-slate-200 border-slate-600 hover:border-purple-400"
                    }`}
                >
                  {deckLabel(d)}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Visual vibe only. Meanings stay consistent, but the tone of the
              reading can match the deck.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Spread
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {(["one", "three", "cross", "nine"] as SpreadType[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSpread(s);
                    setSelectedCards([]);
                    setInterpretation("");
                  }}
                  className={`rounded-2xl px-3 py-2 text-xs sm:text-sm border text-left transition
                    ${
                      spread === s
                        ? "bg-purple-600 text-white border-purple-300 shadow-md"
                        : "bg-slate-900/60 text-slate-200 border-slate-600 hover:border-purple-400"
                    }`}
                >
                  {spreadLabel(s)}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Required cards: {requiredCards}. Click again on a card to unselect
              it.
            </p>
          </div>
        </section>

        {/* Question */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Your question
          </h2>
          <textarea
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setInterpretation("");
            }}
            placeholder="Example: What do I need to know about my love life in the next few months?"
            className="w-full min-h-[80px] rounded-2xl bg-slate-950/60 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none"
          />
          <p className="text-xs text-slate-400">
            Before picking cards: close your eyes, breathe slowly, and focus on
            this one question. Empty your mind from all other noise.
          </p>
        </section>

        {/* Model loading status */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            AI status (DeepSeek local – WebGPU)
          </h2>
          <div className="text-xs text-slate-300 border border-slate-700 rounded-2xl px-3 py-2 bg-slate-950/60">
            {loadingModel && (
              <p>
                Loading model in your browser… <br />
                <span className="text-purple-300">{loadProgress}</span>
              </p>
            )}
            {!loadingModel && engine && (
              <p className="text-emerald-300">
                ✅ Model ready. Your browser is running the AI locally (no
                server, no API key, 0$).
              </p>
            )}
            {engineError && (
              <p className="text-red-300">
                ⚠ {engineError} Try Chrome or Edge with WebGPU enabled.
              </p>
            )}
          </div>
        </section>

        {/* Deck display */}
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Pick your cards
            </h2>
            <button
              onClick={resetSelection}
              className="text-xs text-slate-300 hover:text-purple-300 underline underline-offset-4"
            >
              Reset selection
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Tap to select cards face-down. No names are shown under the cards.
            You can see all cards by scrolling horizontally if needed.
          </p>

          <div className="w-full overflow-x-auto">
            <div className="flex gap-2 py-2 min-w-max">
              {shuffledDeck.map((card) => {
                const isSelected = !!selectedCards.find((c) => c.id === card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => toggleCard(card)}
                    className={`relative flex-none w-10 h-16 sm:w-12 sm:h-20 rounded-md border
                      ${cardBackStyleClasses}
                      ${
                        isSelected
                          ? "ring-2 ring-emerald-400 scale-105"
                          : "opacity-90 hover:opacity-100 hover:-translate-y-0.5"
                      }
                      transition transform duration-150 ease-out`}
                  >
                    {/* Small deck marker, no card name text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] sm:text-[10px] font-semibold text-slate-100/90">
                        ✦
                      </span>
                    </div>
                    {isSelected && (
                      <span className="absolute -top-2 -right-2 bg-emerald-400 text-slate-900 text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected cards summary (names shown here so user knows what they drew) */}
          <div className="mt-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2">
            <h3 className="text-xs font-semibold text-slate-200 mb-1">
              Selected cards ({selectedCards.length}/{requiredCards})
            </h3>
            {selectedCards.length === 0 ? (
              <p className="text-xs text-slate-400">
                No cards yet. Pick exactly {requiredCards} card(s).
              </p>
            ) : (
              <ol className="text-xs text-slate-300 space-y-1">
                {selectedCards.map((card, idx) => (
                  <li key={card.id}>
                    <span className="text-purple-300">Card {idx + 1}:</span>{" "}
                    {card.name}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* Interpret button */}
        <section className="space-y-2">
          <button
            onClick={handleInterpret}
            disabled={
              interpreting ||
              !engine ||
              selectedCards.length !== requiredCards ||
              loadingModel
            }
            className={`w-full rounded-full px-4 py-3 text-sm font-semibold tracking-wide transition
              ${
                interpreting || loadingModel || !engine
                  ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/50"
              }`}
          >
            {interpreting
              ? "Interpreting your spread..."
              : !engine
              ? "AI loading…"
              : `Interpret (${requiredCards} card${
                  requiredCards > 1 ? "s" : ""
                })`}
          </button>
          <p className="text-[11px] text-center text-slate-500">
            The interpretation is generated in your browser using a local
            DeepSeek model (WebGPU). No data is sent to any server.
          </p>
        </section>

        {/* Interpretation output */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Reading
          </h2>
          <div className="min-h-[120px] rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm leading-relaxed text-slate-100 whitespace-pre-wrap">
            {interpretation
              ? interpretation
              : "Your reading will appear here after you pick your cards and click Interpret."}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TarotApp;

