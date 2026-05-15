import type { GoogleSearchEntry } from './seed-entry.types';

// Panel: tecnologia — búsqueda general
export const TECH_GENERAL: GoogleSearchEntry = {
  name: 'Tecnologia',
  category: 'tecnologia',
  queryEs: 'tecnologia inteligencia artificial apps Chile',
  queryEn: 'technology artificial intelligence apps Chile',
};

// Panel: tecnologia — marcas, productos y empresas
const TECH_NAMES: string[] = [
  'Samsung',
  'Apple',
  'OpenAI',
  'ChatGPT',
  'Gemini',
  'Claude',
  'Anthropic',
  'Xiaomi',
  'LG',
  'WOM',
  'Entel Chile',
  'Tigo Chile',
  'MacBook',
  'iPhone',
  'Android',
];

export const TECH_TOPICS: GoogleSearchEntry[] = TECH_NAMES.map((name) => ({
  name,
  category: 'tecnologia',
  queryEs: name,
  queryEn: name,
}));

// Panel: streaming — búsqueda general
export const STREAMING_GENERAL: GoogleSearchEntry = {
  name: 'Streaming',
  category: 'streaming',
  queryEs: 'streaming series estrenos plataformas',
  queryEn: 'streaming series premieres platforms',
};

// Panel: streaming — plataformas individuales
const STREAMING_PLATFORM_NAMES: string[] = [
  'Netflix',
  'Prime Video',
  'Apple TV+',
  'HBO Max',
  'Paramount+',
  'Disney+',
];

export const STREAMING_PLATFORMS: GoogleSearchEntry[] =
  STREAMING_PLATFORM_NAMES.map((name) => ({
    name,
    category: 'streaming',
    queryEs: name,
    queryEn: name,
  }));
