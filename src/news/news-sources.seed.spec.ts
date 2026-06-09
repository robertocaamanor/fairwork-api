import { TEST_ONLY } from './news-sources.seed';

describe('news source seeds', () => {
  it('incluye en exclusiones de Google News los dominios con RSS directo', () => {
    const domains = TEST_ONLY.buildGoogleNewsExcludedDomains();

    expect(domains).toEqual(
      expect.arrayContaining([
        'tvenserio.com',
        'fotech.cl',
        'limalimon.cl',
        'biobiochile.cl',
        'cooperativa.cl',
        'billboard.com',
        'folha.uol.com.br',
      ]),
    );
  });

  it('normaliza prefijos comunes en hosts de feeds', () => {
    expect(
      TEST_ONLY.normalizeExcludedDomain(
        'https://www.biobiochile.cl/static/feed-rss',
      ),
    ).toBe('biobiochile.cl');

    expect(
      TEST_ONLY.normalizeExcludedDomain(
        'http://feeds.folha.uol.com.br/f5/musica/rss091.xml',
      ),
    ).toBe('folha.uol.com.br');
  });
});