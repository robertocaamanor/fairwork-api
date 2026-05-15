import { NewsSourceType } from '../entities/news-source.entity';

export const NON_GOOGLE_HTML_SOURCE_NAMES = [] as const;
export const NON_GOOGLE_RSS_SOURCE_NAMES = [] as const;
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
