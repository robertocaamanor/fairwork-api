import { NewsSourceType } from '../entities/news-source.entity';

export const NON_GOOGLE_HTML_SOURCE_NAMES = [] as const;
export const NON_GOOGLE_RSS_SOURCE_NAMES = [
  'Fotech Televisión',
  'Fotech Fiebre de Baile',
  'Lima Limón',
  'Lima Limón Fiebre de Baile',
  'Ojo a la Tele',
  'Cooperativa Televisión',
  'Bio-Bio Chile Televisión',
  'Bio-Bio Chile Música',
  'Bio-Bio Chile Cine',
  'Publimetro Entretenimiento',
  'Publimetro Tecnología',
  'Rai News',
  'Variety TV',
  'Rolling Stone TV & Movies',
  'Variety Music',
  'Billboard Music',
  'Rolling Stone Music',
  'Portal Famosos Música',
  'Portal Popline',
  'Cooperativa Música',
  'Folha F5 Música',
  'The Guardian Music',
  'Stranotizie',
  'Radio Italia',
  'Mix 98.7',
  'Cooperativa Streaming',
  '9to5Google',
  'Xataka',
  '9to5Mac',
  'Pisapapeles',
  'Cooperativa Tecnología',
] as const;
export const NON_GOOGLE_WORDPRESS_SOURCE_NAMES = [] as const;

export const NON_GOOGLE_SOURCE_NAMES_BY_TYPE: Readonly<
  Record<NewsSourceType, readonly string[]>
> = {
  html: NON_GOOGLE_HTML_SOURCE_NAMES,
  rss: NON_GOOGLE_RSS_SOURCE_NAMES,
  wordpress: NON_GOOGLE_WORDPRESS_SOURCE_NAMES,
};

export const NON_GOOGLE_SEED_SOURCE_NAMES = [
  ...NON_GOOGLE_HTML_SOURCE_NAMES,
  ...NON_GOOGLE_RSS_SOURCE_NAMES,
  ...NON_GOOGLE_WORDPRESS_SOURCE_NAMES,
] as const;

const NON_GOOGLE_SEED_SOURCE_NAME_SET = new Set<string>(
  NON_GOOGLE_SEED_SOURCE_NAMES,
);

export function isGoogleNewsSourceName(sourceName: string): boolean {
  return /^Google News\b/i.test(sourceName.trim());
}

export function isExcludedFromGoogleNewsInspector(sourceName: string): boolean {
  return NON_GOOGLE_SEED_SOURCE_NAME_SET.has(sourceName.trim());
}
