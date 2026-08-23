/**
 * Architex Wingman — Bring-Your-Own-API (BYOAPI) provider layer.
 *
 * Lets users run the copilot against their own key for:
 *   - OpenAI (ChatGPT subscription)  → OpenAI-compatible /chat/completions
 *   - NVIDIA NIM (vision models)     → OpenAI-compatible /chat/completions
 *   - Google Gemini (existing)       → @google/genai
 *
 * Keys are supplied per-request from the client (stored in the browser via
 * localStorage), never persisted server-side, and never logged.
 */

export type WingmanProvider = 'gemini' | 'openai' | 'nvidia';

export interface WingmanProviderConfig {
  provider: WingmanProvider;
  apiKey: string;
  model: string;
}

export interface WingmanCompletionInput {
  provider: WingmanProvider;
  apiKey: string;
  model: string;
  systemInstruction: string;
  prompt: string;
  temperature?: number;
}

export interface WingmanCompletionResult {
  text: string;
  model: string;
  provider: WingmanProvider;
}

/** Default models shown in the provider picker (user can type their own). */
export const PROVIDER_PRESETS: Record<WingmanProvider, { label: string; baseUrl: string | null; models: string[] }> = {
  gemini: {
    label: 'Google Gemini',
    baseUrl: null,
    models: ['gemini-2.5-flash', 'gemini-3.5-flash'],
  },
  openai: {
    label: 'OpenAI (ChatGPT)',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini'],
  },
  nvidia: {
    label: 'NVIDIA NIM (vision models)',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    models: [
      'nvidia/llama-3.1-nemotron-vision-8b',
      'meta/llama-3.2-90b-vision-instruct',
      'nvidia/gr00t-n1-2b',
      'google/gemma-3-27b-it',
    ],
  },
};

/** OpenAI-compatible chat completion request used by OpenAI + NVIDIA NIM. */
async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemInstruction: string,
  prompt: string,
  temperature: number,
): Promise<WingmanCompletionResult> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Provider HTTP ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  if (!text) {
    throw new Error('Provider returned an empty completion.');
  }
  return { text, model, provider: data?.model ? 'openai' : 'openai' };
}

/** Google Gemini completion via the @google/genai SDK. */
async function callGemini(
  apiKey: string,
  model: string,
  systemInstruction: string,
  prompt: string,
  temperature: number,
): Promise<WingmanCompletionResult> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { systemInstruction, temperature },
  });
  const text = response.text || '';
  if (!text) {
    throw new Error('Gemini returned an empty completion.');
  }
  return { text, model, provider: 'gemini' };
}

/**
 * Run a Wingman completion against the chosen provider.
 * Throws on provider error; the route wraps this in a graceful fallback.
 */
export async function runWingmanCompletion(input: WingmanCompletionInput): Promise<WingmanCompletionResult> {
  const temperature = input.temperature ?? 0.2;
  if (input.provider === 'openai') {
    const base = PROVIDER_PRESETS.openai.baseUrl!;
    return callOpenAICompatible(base, input.apiKey, input.model, input.systemInstruction, input.prompt, temperature);
  }
  if (input.provider === 'nvidia') {
    const base = PROVIDER_PRESETS.nvidia.baseUrl!;
    return callOpenAICompatible(base, input.apiKey, input.model, input.systemInstruction, input.prompt, temperature);
  }
  return callGemini(input.apiKey, input.model, input.systemInstruction, input.prompt, temperature);
}

/** Validate a provider configuration payload from the client. */
export function isValidProviderConfig(cfg: unknown): cfg is WingmanProviderConfig {
  if (!cfg || typeof cfg !== 'object') return false;
  const c = cfg as Record<string, unknown>;
  return (
    typeof c.provider === 'string' &&
    ['gemini', 'openai', 'nvidia'].includes(c.provider) &&
    typeof c.apiKey === 'string' &&
    c.apiKey.trim().length > 0 &&
    typeof c.model === 'string' &&
    c.model.trim().length > 0
  );
}
