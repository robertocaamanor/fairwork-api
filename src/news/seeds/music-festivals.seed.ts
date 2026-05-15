import type { GoogleSearchEntry } from './seed-entry.types';

// Cada festival tiene su propio panel (categoría dedicada)
export const MUSIC_FESTIVALS: GoogleSearchEntry[] = [
  {
    name: 'Festival de Viña del Mar',
    category: 'vina_del_mar',
    queryEs: 'Festival de Viña del Mar',
    queryEn: 'Viña del Mar music festival Chile',
  },
  {
    name: 'Sanremo',
    category: 'sanremo',
    queryEs: 'festival Sanremo musica',
    queryEn: 'Sanremo festival music',
  },
  {
    name: 'Coachella',
    category: 'coachella',
    queryEs: 'Coachella festival musica',
    queryEn: 'Coachella music festival',
  },
  {
    name: 'Eurovision',
    category: 'eurovision',
    queryEs: 'Eurovision festival cancion',
    queryEn: 'Eurovision song contest',
  },
];
