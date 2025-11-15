"use client";

import { useState } from "react";

export default function TarotApp() {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  async function interpretCards() {
    setLoading(true);
    setAnswer("Thinking...");

    // Load WebLLM only in the browser dynamically
    const webllm = await import("@mlc-ai/web-llm");

    // Use the smallest local model
    const engine = await webllm.CreateMLCEngine(
      "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q4f16_1-MLC/resolve/main/"
    );

    const output = await engine.chat.completions.create({
      messages: [
        { role: "user", content: "Give a tarot interpretation for: The Fool, The Hermit, Ace of Pentacles" }
      ],
      stream: false,
    });

    setAnswer(output.choices[0].message.content);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Tarot Reader (Local AI – WebGPU)</h1>
      <button onClick={interpretCards} disabled={loading}>
        {loading ? "Interpreting..." : "Get Interpretation"}
      </button>

      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
        {answer}
      </pre>
    </div>
  );
}
