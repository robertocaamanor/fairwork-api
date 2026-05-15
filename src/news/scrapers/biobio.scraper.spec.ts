import axios from 'axios';
import { NewsSource } from '../entities/news-source.entity';
import { BiobioScraper } from './biobio.scraper';

jest.mock('axios');

const mockedAxios = jest.mocked(axios);

describe('BiobioScraper', () => {
  const source = {
    name: 'BioBio Espectaculos y TV',
    url: 'https://www.biobiochile.cl/lista/categorias/espectaculos-y-tv',
    type: 'html',
    category: 'tv_chilena',
    enabled: true,
  } as NewsSource;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('normaliza imagenes cuando BioBio entrega post_image como objeto', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        articles: [
          {
            post_title: 'Rosario Bravo revelo una nueva noticia televisiva',
            post_excerpt: '<p>Resumen</p>',
            post_content: '<p>Contenido</p>',
            post_URL_https:
              'https://www.biobiochile.cl/noticias/espectaculos-y-tv/2026/05/14/nota.shtml',
            raw_post_date: '2026-05-14 18:00:00',
            post_image: {
              URL: '2026/05/rosario-bravo.png',
              thumbnails: {
                large: { URL: '2026/05/rosario-bravo.png' },
                medium: { URL: '2026/05/rosario-bravo-750x400.png' },
              },
            },
          },
        ],
      },
    });

    const items = await new BiobioScraper().scrape(source);

    expect(items).toHaveLength(1);
    expect(items[0].imageUrl).toBe(
      'https://media.biobiochile.cl/wp-content/uploads/2026/05/rosario-bravo.png',
    );
  });
});
