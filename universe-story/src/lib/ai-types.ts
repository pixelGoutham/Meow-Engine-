// src/lib/ai-types.ts
// Shared TypeScript types for AI Assistant integration

export type ModelId =
  | 'hydrogen'
  | 'carbon'
  | 'oxygen'
  | 'iron'
  | 'gas'
  | 'solar'
  | 'galaxy'
  | 'universe';

export const VALID_MODEL_IDS: ModelId[] = [
  'hydrogen',
  'carbon',
  'oxygen',
  'iron',
  'gas',
  'solar',
  'galaxy',
  'universe',
];

export interface ScientificModel {
  id: ModelId;
  name: string;
  subtitle: string;
  category: string;
  discoverer: string;
  year: string;
  accentHex: string;
  secondaryHex: string;
  cbseLink: string;
  description: string;
  toggleLabel: string;
  toggleActiveLabel: string;
  properties: Record<string, string>;
}

export interface AIModelContext {
  modelId: ModelId;
  name: string;
  subtitle: string;
  category: string;
  discoverer: string;
  year: string;
  description: string;
  properties: Record<string, string>;
  visualizationType: string;
  currentVariantLabel: string;
  variantActive: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  modelContext: AIModelContext;
  history: ChatMessage[];
}

export interface ChatResponse {
  text: string;
  done: boolean;
  error?: string;
}

export interface StreamingChatResponse {
  chunk: string;
  done: boolean;
}

export interface AIError {
  code: 'VALIDATION_ERROR' | 'RATE_LIMIT' | 'PROVIDER_ERROR' | 'NETWORK_ERROR' | 'INVALID_MODEL';
  message: string;
  details?: unknown;
}

// Validation constants
export const VALIDATION_LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_HISTORY_MESSAGES: 10,
  MAX_REQUEST_SIZE_KB: 64,
} as const;