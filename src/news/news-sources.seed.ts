import { NewsSource } from './entities/news-source.entity';
import type { GoogleSearchEntry } from './seeds/seed-entry.types';
import { TV_CHANNELS_CHILE, TV_PERSONALITIES_CHILE } from './seeds/tv-chile.seed';
import { TV_PROGRAMS } from './seeds/tv-programs.seed';
import { MUSIC_GENERAL, MUSIC_ARTISTS } from './seeds/music-artists.seed';
import { MUSIC_FESTIVALS } from './seeds/music-festivals.seed';
import {
  TV_ARGENTINA,
  TV_MEXICANA,
  TV_ESPANOLA,
  TV_ITALIANA,
  TV_USA,
  CINE,
} from './seeds/international-tv.seed';
import {
  TECH_GENERAL,
  TECH_TOPICS,
  STREAMING_GENERAL,
  STREAMING_PLATFORMS,
} from './seeds/tech-streaming.seed';
import { DIRECT_RSS } from './seeds/direct-rss.seed';

// ─── Google News config ───────────────────────────────────────────────────────

const GOOGLE_NEWS_SEARCH_WINDOW = '2d';
const GOOGLE_NEWS_MAX_AGE_HOURS = '48';

const googleNewsSelectors = {
  maxAgeHours: GOOGLE_NEWS_MAX_AGE_HOURS,
  sortOrder: 'desc',
  excludedDomains: 'tvenserio.com',
};

type GoogleNewsLocale = {
  suffix: string;
  queryKey: keyof Pick<GoogleSearchEntry, 'queryEs' | 'queryEn'>;
  hl: string;
  gl: string;
  ceid: string;
};

const GOOGLE_NEWS_LOCALES: GoogleNewsLocale[] = [
  { suffix: 'ES', queryKey: 'queryEs', hl: 'es-419', gl: 'CL', ceid: 'CL:es-419' },
  { suffix: 'EN', queryKey: 'queryEn', hl: 'en-US',  gl: 'US', ceid: 'US:en' },
];

// ─── Agrupación de todas las búsquedas Google News ───────────────────────────

const ALL_GOOGLE_SEARCHES: GoogleSearchEntry[] = [
  ...TV_CHANNELS_CHILE,
  ...TV_PERSONALITIES_CHILE,
  ...TV_PROGRAMS,
  MUSIC_GENERAL,
  ...MUSIC_ARTISTS,
  ...MUSIC_FESTIVALS,
  STREAMING_GENERAL,
  ...STREAMING_PLATFORMS,
  TECH_GENERAL,
  ...TECH_TOPICS,
  ...TV_ARGENTINA,
  ...TV_MEXICANA,
  ...TV_ESPANOLA,
  ...TV_ITALIANA,
  ...TV_USA,
  CINE,
];

// ─── Exports ─────────────────────────────────────────────────────────────────

export const LEGACY_FIXED_SOURCE_NAMES = [] as const;

export function buildNewsSourceSeeds(): Array<Partial<NewsSource>> {
  const googleSources = ALL_GOOGLE_SEARCHES.flatMap((entry) =>
    GOOGLE_NEWS_LOCALES.map((locale) => ({
      name: `Google News ${entry.name} ${locale.suffix}`,
      url: buildGoogleNewsSearchUrl(entry[locale.queryKey], locale),
      type: 'rss' as const,
      category: entry.category,
      enabled: true,
      selectors: googleNewsSelectors,
    })),
  );

  const rssSources: Array<Partial<NewsSource>> = DIRECT_RSS.flatMap(
    ({ name, feeds }) =>
      feeds.map(({ url, category }) => ({
        name,
        url,
        type: 'rss' as const,
        category,
        enabled: true,
        selectors: { maxAgeHours: '48' },
      })),
  );

  return [...googleSources, ...rssSources];
}

function buildGoogleNewsSearchUrl(
  query: string,
  locale: GoogleNewsLocale,
): string {
  const parsed = new URL('https://news.google.com/rss/search');
  parsed.searchParams.set('q', `${query.trim()} when:${GOOGLE_NEWS_SEARCH_WINDOW}`);
  parsed.searchParams.set('hl', locale.hl);
  parsed.searchParams.set('gl', locale.gl);
  parsed.searchParams.set('ceid', locale.ceid);
  return parsed.toString();
}
