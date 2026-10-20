// lib/ai/provider.js  (sirf yahi file provider SDK jaanti hai)
import "server-only";
import { GoogleGenAI } from "@google/genai";
import { AppError } from "./errors";

const SUPPORTED = ["gemini", "openai-compatible"];

let geminiClient;

function getProvider() {
  return (process.env.AI_PROVIDER || "gemini").toLowerCase();
}

export function assertProviderConfigured() {
  const provider = getProvider();

  if (!SUPPORTED.includes(provider)) {
    throw new AppError(
      "ai_provider_unsupported",
      501,
      `AI provider "${provider}" is not supported yet.`,
    );
  }
  if (!process.env.AI_API_KEY) {
    throw new AppError(
      "ai_not_configured",
      503,
      "The AI assistant isn't configured yet. Please contact support.",
    );
  }
  if (provider === "openai-compatible") {
    if (!process.env.AI_BASE_URL || !process.env.AI_MODEL) {
      throw new AppError(
        "ai_not_configured",
        503,
        "The AI assistant isn't configured yet. Please contact support.",
      );
    }
  }
}

export function getModelConfig() {
  const provider = getProvider();
  const defaultModel =
    provider === "gemini" ? "gemini-3.8-flash" : process.env.AI_MODEL;

  return {
    model: process.env.AI_MODEL || defaultModel,
    maxTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS) || 1024,
  };
}

/* ------------------------------ Gemini ------------------------------ */

// "AQ." se shuru hone wali key Vertex AI Express Mode ki hoti hai.
// "AIza" wali key Gemini Developer API (AI Studio) ki hoti hai.
function useVertexMode() {
  if (process.env.AI_GEMINI_VERTEX === "true") return true;
  if (process.env.AI_GEMINI_VERTEX === "false") return false;
  return (process.env.AI_API_KEY || "").startsWith("AQ.");
}

function getGeminiClient() {
  geminiClient ??= new GoogleGenAI(
    useVertexMode()
      ? { vertexai: true, apiKey: process.env.AI_API_KEY }
      : { apiKey: process.env.AI_API_KEY },
  );
  return geminiClient;
}

function toGeminiContents(messages) {
  return messages.map(({ role, content }) => ({
    role: role === "assistant" ? "model" : "user",
    parts: [{ text: String(content ?? "") }],
  }));
}

function getThinkingConfig(model) {
  const name = model.toLowerCase();
  if (/gemini-3/.test(name)) return { thinkingLevel: "low" };
  if (name.includes("flash")) return { thinkingBudget: 0 };
  return undefined;
}

async function* streamGemini({ system, messages, signal }) {
  const { model, maxTokens } = getModelConfig();

  const config = {
    systemInstruction: system,
    maxOutputTokens: maxTokens,
    abortSignal: signal,
  };

  const thinkingConfig = getThinkingConfig(model);
  if (thinkingConfig) config.thinkingConfig = thinkingConfig;

  const stream = await getGeminiClient().models.generateContentStream({
    model,
    contents: toGeminiContents(messages),
    config,
  });

  let inputTokens = 0;
  let outputTokens = 0;

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) yield { type: "text", text };

    if (chunk.usageMetadata) {
      inputTokens = chunk.usageMetadata.promptTokenCount ?? inputTokens;
      outputTokens = chunk.usageMetadata.candidatesTokenCount ?? outputTokens;
    }
  }

  yield { type: "usage", inputTokens, outputTokens };
}

/* ------------------- OpenAI-compatible (Groq, OpenRouter...) ------------------- */

async function* streamOpenAICompatible({ system, messages, signal }) {
  const { model, maxTokens } = getModelConfig();
  const baseUrl = process.env.AI_BASE_URL.replace(/\/+$/, "");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      stream_options: { include_usage: true },
      messages: [
        { role: "system", content: system },
        ...messages.map(({ role, content }) => ({
          role: role === "assistant" ? "assistant" : "user",
          content: String(content ?? ""),
        })),
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const error = new Error(
      `Provider returned ${response.status}: ${detail.slice(0, 500)}`,
    );
    error.status = response.status;
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let inputTokens = 0;
  let outputTokens = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith("data:")) continue;

      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;

      let json;
      try {
        json = JSON.parse(data);
      } catch {
        continue;
      }

      const text = json.choices?.[0]?.delta?.content;
      if (text) yield { type: "text", text };

      if (json.usage) {
        inputTokens = json.usage.prompt_tokens ?? inputTokens;
        outputTokens = json.usage.completion_tokens ?? outputTokens;
      }
    }
  }

  yield { type: "usage", inputTokens, outputTokens };
}

/* ------------------------------ Public API ------------------------------ */

// Yields { type: "text", text } chunks, then { type: "usage", ... }
export async function* streamChat(args) {
  if (getProvider() === "openai-compatible") {
    yield* streamOpenAICompatible(args);
  } else {
    yield* streamGemini(args);
  }
}
