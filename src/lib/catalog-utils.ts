import type { CatalogEntry } from './supabase';

export type FilterType = 'all' | 'movie' | 'series';
export type FilterStatus = 'all' | 'watching' | 'completed' | 'wishlist' | 'dropped';
export type SortBy = 'newest' | 'oldest' | 'title' | 'rating';

export function filterEntries(
  entries: CatalogEntry[],
  filterType: FilterType,
  filterStatus: FilterStatus,
  search: string
): CatalogEntry[] {
  return entries.filter((e) => {
    if (filterType !== 'all' && e.type !== filterType) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}

export function sortEntries(entries: CatalogEntry[], sortBy: SortBy): CatalogEntry[] {
  return [...entries].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'title':
        return a.title.localeCompare(b.title, 'es');
      case 'rating':
        return (b.rating ?? 0) - (a.rating ?? 0);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
}

export function computeStats(entries: CatalogEntry[]) {
  return {
    total: entries.length,
    movies: entries.filter((e) => e.type === 'movie').length,
    series: entries.filter((e) => e.type === 'series').length,
    completed: entries.filter((e) => e.status === 'completed').length,
  };
}

export function validateRating(rating: number | null): boolean {
  if (rating === null) return true;
  return Number.isInteger(rating) && rating >= 1 && rating <= 10;
}

export function validateYear(year: number | null): boolean {
  if (year === null) return true;
  return Number.isInteger(year) && year >= 1888 && year <= 2030;
}
