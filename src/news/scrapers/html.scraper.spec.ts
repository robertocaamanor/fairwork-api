import axios from 'axios';
import { NewsSource } from '../entities/news-source.entity';
import { HtmlScraper } from './html.scraper';

jest.mock('axios');

const mockedAxios = jest.mocked(axios);

describe('HtmlScraper', () => {
  const source = {
    name: 'Fuente HTML',
    url: 'https://example.com/seccion/',
    type: 'html',
    category: 'tv_chilena',
    enabled: true,
    selectors: {
      linkPattern: '^https://example\\.com/noticias/.+$',
    },
  } as NewsSource;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('asigna fecha de scrapeo a items extraidos por linkPattern', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: `
        <a href="/noticias/nota-uno">
          Titulo suficientemente largo para la noticia
        </a>
      `,
    });

    const items = await new HtmlScraper().scrape(source);

    expect(items).toHaveLength(1);
    expect(items[0].publishedAt).toBeInstanceOf(Date);
    expect(items[0].originalUrl).toBe('https://example.com/noticias/nota-uno');
  });
});
