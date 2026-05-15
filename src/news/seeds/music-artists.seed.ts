import type { GoogleSearchEntry } from './seed-entry.types';

// Panel: musica — búsqueda general
export const MUSIC_GENERAL: GoogleSearchEntry = {
  name: 'Musica',
  category: 'musica',
  queryEs: 'musica pop latina conciertos festivales',
  queryEn: 'latin pop music concerts festivals',
};

// Panel: musica — artistas individuales
const ARTIST_NAMES: string[] = [
  'Dua Lipa',
  'Tini Stoessel',
  'Lali Esposito',
  'Katy Perry',
  'María Becerra',
  'Ariana Grande',
  'Demi Lovato',
  'Britney Spears',
  'Selena Gomez',
  'Shakira',
  'Rihanna',
  'Lady Gaga',
  'Soulfía',
  'Camila Cabello',
  'Karol G',
  'Becky G',
  'Anuel AA',
  'Bad Bunny',
  'J Balvin',
  'Maluma',
  'Ozuna',
  'Daddy Yankee',
  'Shirel',
  'Denise Rosenthal',
  'Kylie Minogue',
  'Sabrina Carpenter',
  'Megan Thee Stallion',
  'Lizzo',
  'Anitta',
  'Ludmilla',
  'Nicki Minaj',
  'Emilia Mernes',
  'Bebe Rexha',
];

export const MUSIC_ARTISTS: GoogleSearchEntry[] = ARTIST_NAMES.map((name) => ({
  name,
  category: 'musica',
  queryEs: name,
  queryEn: name,
}));
