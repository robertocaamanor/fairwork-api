import {
  normalizeEditorialTone,
  resolveEditorialTone,
} from './editorial-tone.util';

describe('editorial tone resolver', () => {
  it('prioriza el tono manual cuando el editor lo define', () => {
    const result = resolveEditorialTone({
      requestedTone: 'critical',
      editorialRating: 7,
      title: 'Titular neutro',
    });

    expect(result.tone).toBe('critical');
    expect(result.source).toBe('manual');
  });

  it('detecta tono critico por expresiones del titular', () => {
    const result = resolveEditorialTone({
      requestedTone: 'automatic',
      title: 'Karen Paola la fulmino tras duro cruce en pantalla',
      summary: 'La panelista se fue con todo en plena polemica.',
    });

    expect(result.tone).toBe('critical');
    expect(result.source).toBe('automatic');
    expect(result.matchedExpressions).toEqual(
      expect.arrayContaining(['la fulmino', 'se fue con todo']),
    );
    expect(result.matchedProfiles).toContain('Karen Paola');
  });

  it('cae a tono positivo cuando el rating editorial es alto', () => {
    const result = resolveEditorialTone({
      requestedTone: 'automatic',
      editorialRating: 6,
      title: 'Nuevo proyecto entusiasma a los fans',
    });

    expect(result.tone).toBe('positive');
    expect(result.source).toBe('rating');
  });

  it('mantiene tono informativo cuando no hay senales fuertes', () => {
    const result = resolveEditorialTone({
      requestedTone: 'automatic',
      editorialRating: 4,
      title: 'Canal 13 anuncia cambios en su parrilla',
    });

    expect(result.tone).toBe('informative');
  });

  it('normaliza sinonimos en espanol', () => {
    expect(normalizeEditorialTone('Crítica')).toBe('critical');
    expect(normalizeEditorialTone('Positiva')).toBe('positive');
    expect(normalizeEditorialTone('Automático')).toBe('automatic');
    expect(normalizeEditorialTone('Informativo')).toBe('informative');
  });
});