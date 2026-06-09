import { MUSIC_ARTISTS } from './seeds/music-artists.seed';
import { TV_PERSONALITIES_CHILE } from './seeds/tv-chile.seed';

export const EDITORIAL_TONES = [
  'automatic',
  'informative',
  'positive',
  'critical',
] as const;

export type EditorialTone = (typeof EDITORIAL_TONES)[number];
export type ResolvedEditorialTone = Exclude<EditorialTone, 'automatic'>;
export type EditorialToneSource = 'manual' | 'automatic' | 'rating';

export interface ResolveEditorialToneInput {
  requestedTone?: string | null;
  editorialRating?: number | null;
  title?: string | null;
  summary?: string | null;
  content?: string | null;
  extraTexts?: Array<string | null | undefined>;
}

export interface EditorialToneResolution {
  tone: ResolvedEditorialTone;
  source: EditorialToneSource;
  reason: string;
  matchedExpressions: string[];
  matchedProfiles: string[];
}

const CRITICAL_EXPRESSIONS = [
  'la fulmino',
  'lo fulmino',
  'las fulmino',
  'los fulmino',
  'repaso',
  'arremete sin filtro',
  'arremetio sin filtro',
  'se fue con todo',
  'sin filtro',
  'insulto',
  'insultos',
  'ninguneo',
  'ninguneada',
  'ninguneado',
  'descalifico',
  'destrato',
  'ataque',
  'ataques',
  'critica',
  'critico',
  'criticas',
  'lapido',
  'destrozo',
  'destroza',
  'destrozo sin filtro',
  'polemica por insultos',
  'duro cruce',
  'duro ataque',
  'feroz critica',
  'duros dichos',
  'se lanzo contra',
  'se lanzo en contra',
  'disparo contra',
  'carga contra',
  'exploto contra',
].map(normalizeText);

const TARGET_PROFILE_NAMES = Array.from(
  new Set(
    [...TV_PERSONALITIES_CHILE, ...MUSIC_ARTISTS]
      .map((entry) => entry.name)
      .filter(Boolean)
      .map((value) => value.trim()),
  ),
).sort((left, right) => right.length - left.length);

export function resolveEditorialTone(
  input: ResolveEditorialToneInput,
): EditorialToneResolution {
  const manualTone = normalizeEditorialTone(input.requestedTone);

  if (manualTone && manualTone !== 'automatic') {
    return {
      tone: manualTone,
      source: 'manual',
      reason: `Tono definido manualmente: ${manualTone}.`,
      matchedExpressions: [],
      matchedProfiles: [],
    };
  }

  const texts = [
    input.title,
    input.summary,
    input.content,
    ...(input.extraTexts ?? []),
  ];
  const combinedText = normalizeText(texts.filter(Boolean).join(' '));
  const matchedExpressions = CRITICAL_EXPRESSIONS.filter((expression) =>
    combinedText.includes(expression),
  );
  const matchedProfiles = TARGET_PROFILE_NAMES.filter((profile) =>
    combinedText.includes(normalizeText(profile)),
  );

  if (matchedExpressions.length > 0) {
    return {
      tone: 'critical',
      source: 'automatic',
      reason: buildAutomaticReason(matchedExpressions, matchedProfiles),
      matchedExpressions,
      matchedProfiles,
    };
  }

  if ((input.editorialRating ?? 0) <= 3 && input.editorialRating !== undefined) {
    return {
      tone: 'critical',
      source: 'rating',
      reason:
        'Tono critico aplicado por radar editorial en rango negativo (1-3).',
      matchedExpressions,
      matchedProfiles,
    };
  }

  if ((input.editorialRating ?? 0) >= 5) {
    return {
      tone: 'positive',
      source: 'rating',
      reason:
        'Tono positivo aplicado por radar editorial en rango favorable (5-7).',
      matchedExpressions,
      matchedProfiles,
    };
  }

  return {
    tone: 'informative',
    source: 'automatic',
    reason:
      manualTone === 'automatic'
        ? 'Modo automatico sin senales fuertes: se mantiene tono informativo.'
        : 'Sin senales fuertes: se mantiene tono informativo.',
    matchedExpressions,
    matchedProfiles,
  };
}

export function normalizeEditorialTone(
  value?: string | null,
): EditorialTone | undefined {
  const normalized = normalizeText(value ?? '');

  if (!normalized) {
    return undefined;
  }

  if (['automatic', 'automatico', 'automatica', 'auto'].includes(normalized)) {
    return 'automatic';
  }

  if (['critical', 'critica', 'critico'].includes(normalized)) {
    return 'critical';
  }

  if (['positive', 'positiva', 'positivo'].includes(normalized)) {
    return 'positive';
  }

  if (
    ['informative', 'informativo', 'informativa', 'neutral', 'neutro'].includes(
      normalized,
    )
  ) {
    return 'informative';
  }

  return undefined;
}

function buildAutomaticReason(
  matchedExpressions: string[],
  matchedProfiles: string[],
): string {
  const parts = [
    `Deteccion automatica de tono critico por senales: ${matchedExpressions.join(', ')}.`,
  ];

  if (matchedProfiles.length > 0) {
    parts.push(`Perfiles relacionados: ${matchedProfiles.join(', ')}.`);
  }

  return parts.join(' ');
}

function normalizeText(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}