import { NewsService } from './news.service';

describe('NewsService Google inspector', () => {
  const createService = () =>
    new NewsService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

  it('inspecciona URLs intermedias aunque vengan de fuentes legacy', () => {
    const service = createService() as any;

    const result = service.isGoogleAttributedItem({
      sourceName: 'Fotech Feed',
      originalUrl: 'https://news.google.com/rss/articles/ABC123',
      resolvedUrl: '',
      title: 'Google News',
    });

    expect(result).toBe(true);
  });

  it('mantiene la inspeccion para fuentes reales de Google News', () => {
    const service = createService() as any;

    const result = service.isGoogleAttributedItem({
      sourceName: 'Google News Television Chile',
      originalUrl: 'https://news.google.com/rss/articles/ABC123',
      resolvedUrl: '',
      title: 'Google News',
    });

    expect(result).toBe(true);
  });
});
