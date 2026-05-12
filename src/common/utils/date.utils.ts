import { Logger } from '@nestjs/common';

const logger = new Logger('DateUtils');

/**
 * Valida si un objeto Date es válido
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Parsea diferentes formatos de fecha y retorna un Date válido o null
 * Soporta:
 * - ISO 8601 (2026-05-05T00:45:48Z)
 * - RSS pubDate (RFC 822/2822)
 * - Timestamps numéricos
 * - Strings de fecha personalizados (4/5, 10:11 a. m.)
 */
export function parsePublishedDate(input: any): Date | null {
  if (!input) {
    return null;
  }

  // Si ya es un Date válido, retornarlo
  if (input instanceof Date) {
    return isValidDate(input) ? input : null;
  }

  // Si es un número (timestamp), intentar parsear
  if (typeof input === 'number') {
    const date = new Date(input);
    return isValidDate(date) ? date : null;
  }

  // Si es string, intentar varios formatos
  if (typeof input === 'string') {
    const trimmed = input.trim();
    
    if (!trimmed) {
      return null;
    }

    // Intentar parsearlo directamente (funciona con ISO y muchos formatos estándar)
    let date = new Date(trimmed);
    if (isValidDate(date)) {
      return date;
    }

    // Intentar con formato "4/5, 10:11 a. m." o similar
    // Este es un formato común en feeds de noticias en español
    const customDatePattern = /^(\d{1,2})\/(\d{1,2}),?\s+(\d{1,2}):(\d{2})\s*(a\.|p\.)\s*m\.?/i;
    const match = trimmed.match(customDatePattern);
    
    if (match) {
      const month = parseInt(match[1], 10);
      const day = parseInt(match[2], 10);
      let hours = parseInt(match[3], 10);
      const minutes = parseInt(match[4], 10);
      const meridiem = match[5].toLowerCase();

      // Ajustar horas para formato 12h
      if (meridiem.startsWith('p') && hours !== 12) {
        hours += 12;
      } else if (meridiem.startsWith('a') && hours === 12) {
        hours = 0;
      }

      // Asumir año actual si no se especifica
      const currentYear = new Date().getFullYear();
      date = new Date(currentYear, month - 1, day, hours, minutes, 0, 0);
      
      if (isValidDate(date)) {
        return date;
      }
    }

    // Si nada funciona, intentar parsear solo la parte de fecha
    // Algunos formatos pueden tener información adicional
    const dateOnlyPattern = /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/;
    const dateMatch = trimmed.match(dateOnlyPattern);
    
    if (dateMatch) {
      date = new Date(dateMatch[1]);
      if (isValidDate(date)) {
        return date;
      }
    }
  }

  return null;
}

/**
 * Normaliza una fecha a UTC, asegurando que sea válida y razonable.
 * Si la fecha no puede parsearse, usa la fecha actual.
 * Si la fecha está en el futuro (más de 1 día), usa la fecha actual.
 * Si la fecha es muy antigua (antes de 2015), usa la fecha actual.
 * Si la fecha está muy desactualizada (más de 30 días atrás), usa la fecha actual.
 */
export function normalizeDate(input: any, context?: string): Date {
  const now = new Date();
  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const minValidDate = new Date('2015-01-01T00:00:00Z');
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Intentar parsear la fecha
  const parsed = parsePublishedDate(input);

  // Si no se pudo parsear, usar fecha actual
  if (!parsed) {
    if (input !== null && input !== undefined) {
      logger.warn(
        `No se pudo parsear fecha: ${JSON.stringify(input)}${context ? ` [${context}]` : ''}`,
      );
    }
    return now;
  }

  // Si la fecha está en el futuro (más de 1 día), es probablemente un error
  if (parsed > oneDayFromNow) {
    logger.warn(
      `Fecha en el futuro detectada: ${parsed.toISOString()}, usando fecha actual${context ? ` [${context}]` : ''}`,
    );
    return now;
  }

  // Si la fecha es muy antigua (antes de 2015), probablemente es un error
  if (parsed < minValidDate) {
    logger.warn(
      `Fecha muy antigua detectada: ${parsed.toISOString()}, usando fecha actual${context ? ` [${context}]` : ''}`,
    );
    return now;
  }

  // Si la fecha está muy desactualizada (más de 30 días atrás), es sospechoso
  // Esto detecta feeds RSS que retornan fechas incorrectas (ej: Google News)
  if (parsed < thirtyDaysAgo) {
    logger.warn(
      `Fecha muy desactualizada detectada: ${parsed.toISOString()} (más de 30 días atrás), usando fecha actual${context ? ` [${context}]` : ''}`,
    );
    return now;
  }

  // La fecha es válida y razonable, convertir a UTC
  return new Date(parsed.toISOString());
}

/**
 * Extrae la fecha de publicación de múltiples fuentes posibles
 * Prioriza: isoDate > pubDate > date > publishedAt
 */
export function extractPublishedDate(
  item: Record<string, any>,
  context?: string,
): Date {
  const candidates = [
    item.isoDate,
    item.pubDate,
    item.date,
    item.publishedAt,
    item.published,
    item.created,
  ];

  for (const candidate of candidates) {
    const parsed = parsePublishedDate(candidate);
    if (parsed) {
      return normalizeDate(parsed, context);
    }
  }

  // Si ninguna fecha es válida, usar la fecha actual
  logger.warn(
    `No se encontró fecha válida en el item${context ? ` [${context}]` : ''}`,
  );
  return new Date();
}

/**
 * Formatea una fecha para logging/debugging
 */
export function formatDateForLog(date: Date | null | undefined): string {
  if (!date) {
    return 'null';
  }
  if (!isValidDate(date)) {
    return 'invalid';
  }
  return date.toISOString();
}

/**
 * Serializa el valor raw para guardarlo como string
 */
export function serializeRawDate(input: any): string | undefined {
  if (input === null || input === undefined) {
    return undefined;
  }

  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof Date) {
    return input.toISOString();
  }

  if (typeof input === 'number') {
    return new Date(input).toISOString();
  }

  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}
