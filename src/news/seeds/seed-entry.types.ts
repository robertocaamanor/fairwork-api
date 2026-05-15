import type { NewsSource } from '../entities/news-source.entity';

export type GoogleSearchEntry = {
  name: string;
  category: NewsSource['category'];
  queryEs: string;
  queryEn: string;
};

export type DirectRssFeed = {
  url: string;
  category: NewsSource['category'];
};

export type DirectRssEntry = {
  name: string;
  feeds: DirectRssFeed[];
};
