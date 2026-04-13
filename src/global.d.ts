declare module '*.css';

interface ImportMetaEnv {
  VITE_ANTHROPIC_API_KEY: string;
  VITE_OPENAI_API_KEY: string;
  VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 