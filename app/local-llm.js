import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

let engine = null;

export async function loadModel() {
  if (engine) return engine;

  engine = await CreateMLCEngine("deepseek-r1:1.5b", {
    model_url:
      "https://huggingface.co/mlc-ai/mlc-chat-deepseek-r1-1_5b-q4f32_1/resolve/main",
    gpu_memory_in_mb: 2048,
  });

  return engine;
}

export async function generateLocal(prompt) {
  const model = await loadModel();
  const result = await model.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    stream: false,
  });
  return result.choices?.[0]?.message?.content || "No response.";
}
