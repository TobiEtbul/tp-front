import { describe, it, expect } from 'vitest';
import { filterEntries, sortEntries, computeStats, validateRating, validateYear } from './catalog-utils';
import type { CatalogEntry } from './supabase';

function makeEntry(overrides: Partial<CatalogEntry> = {}): CatalogEntry {
  return {
    id: '1',
    user_id: 'u1',
    title: 'Test Movie',
    type: 'movie',
    status: 'completed',
    rating: 8,
    review: null,
    poster_url: null,
    genre: 'Drama',
    year: 2023,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

const entries: CatalogEntry[] = [
  makeEntry({ id: '1', title: 'Breaking Bad', type: 'series', status: 'completed', rating: 10, created_at: '2024-01-01T00:00:00Z' }),
  makeEntry({ id: '2', title: 'Inception', type: 'movie', status: 'completed', rating: 9, created_at: '2024-02-01T00:00:00Z' }),
  makeEntry({ id: '3', title: 'Avatar', type: 'movie', status: 'wishlist', rating: null, created_at: '2024-03-01T00:00:00Z' }),
  makeEntry({ id: '4', title: 'The Office', type: 'series', status: 'watching', rating: 7, created_at: '2024-04-01T00:00:00Z' }),
];

describe('filterEntries', () => {
  it('devuelve todas las entradas cuando no hay filtros', () => {
    const result = filterEntries(entries, 'all', 'all', '');
    expect(result).toHaveLength(4);
  });

  it('filtra por tipo película', () => {
    const result = filterEntries(entries, 'movie', 'all', '');
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.type === 'movie')).toBe(true);
  });

  it('filtra por tipo serie', () => {
    const result = filterEntries(entries, 'series', 'all', '');
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.type === 'series')).toBe(true);
  });

  it('filtra por estado completed', () => {
    const result = filterEntries(entries, 'all', 'completed', '');
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.status === 'completed')).toBe(true);
  });

  it('filtra por texto de busqueda (case insensitive)', () => {
    const result = filterEntries(entries, 'all', 'all', 'breaking');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Breaking Bad');
  });

  it('combina filtros de tipo, estado y busqueda', () => {
    const result = filterEntries(entries, 'movie', 'completed', 'inception');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Inception');
  });

  it('retorna vacío si no hay coincidencias', () => {
    const result = filterEntries(entries, 'all', 'all', 'nonexistent');
    expect(result).toHaveLength(0);
  });
});

describe('sortEntries', () => {
  it('ordena por más reciente (newest) por defecto', () => {
    const result = sortEntries(entries, 'newest');
    expect(result[0].title).toBe('The Office');
    expect(result[3].title).toBe('Breaking Bad');
  });

  it('ordena por más antiguo (oldest)', () => {
    const result = sortEntries(entries, 'oldest');
    expect(result[0].title).toBe('Breaking Bad');
    expect(result[3].title).toBe('The Office');
  });

  it('ordena alfabeticamente por titulo', () => {
    const result = sortEntries(entries, 'title');
    expect(result[0].title).toBe('Avatar');
    expect(result[3].title).toBe('The Office');
  });

  it('ordena por rating (mayor a menor), null como 0', () => {
    const result = sortEntries(entries, 'rating');
    expect(result[0].title).toBe('Breaking Bad');
    expect(result[3].title).toBe('Avatar');
  });

  it('no muta el array original', () => {
    const original = [...entries];
    sortEntries(entries, 'title');
    expect(entries).toEqual(original);
  });
});

describe('computeStats', () => {
  it('calcula estadísticas correctamente', () => {
    const stats = computeStats(entries);
    expect(stats.total).toBe(4);
    expect(stats.movies).toBe(2);
    expect(stats.series).toBe(2);
    expect(stats.completed).toBe(2);
  });

  it('devuelve ceros para array vacío', () => {
    const stats = computeStats([]);
    expect(stats).toEqual({ total: 0, movies: 0, series: 0, completed: 0 });
  });
});

describe('validateRating', () => {
  it('acepta null', () => expect(validateRating(null)).toBe(true));
  it('acepta 1', () => expect(validateRating(1)).toBe(true));
  it('acepta 10', () => expect(validateRating(10)).toBe(true));
  it('rechaza 0', () => expect(validateRating(0)).toBe(false));
  it('rechaza 11', () => expect(validateRating(11)).toBe(false));
  it('rechaza decimales', () => expect(validateRating(5.5)).toBe(false));
});

describe('validateYear', () => {
  it('acepta null', () => expect(validateYear(null)).toBe(true));
  it('acepta 2024', () => expect(validateYear(2024)).toBe(true));
  it('rechaza 1800', () => expect(validateYear(1800)).toBe(false));
  it('rechaza 2031', () => expect(validateYear(2031)).toBe(false));
});
