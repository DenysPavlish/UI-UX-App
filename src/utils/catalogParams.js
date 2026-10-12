import { MIN_POINTS_OPTIONS, SORT_OPTIONS, TYPE_OPTIONS } from '../config';

export const DEFAULT_FILTERS = { type: 'story', minPoints: 0, sort: 'relevance' };

const isOneOf = (options, value) => options.some((option) => option.value === value);

export function normalizeQuery(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

/** URL -> параметри каталогу. Усе недозволене (ручна правка адреси) замінюється значеннями за замовчуванням. */
export function readCatalogParams(searchParams) {
  const type = searchParams.get('type');
  const minPoints = Number(searchParams.get('minPoints') ?? 0);
  const sort = searchParams.get('sort');
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10);

  return {
    q: normalizeQuery(searchParams.get('q')),
    type: isOneOf(TYPE_OPTIONS, type) ? type : DEFAULT_FILTERS.type,
    minPoints: isOneOf(MIN_POINTS_OPTIONS, minPoints) ? minPoints : DEFAULT_FILTERS.minPoints,
    sort: isOneOf(SORT_OPTIONS, sort) ? sort : DEFAULT_FILTERS.sort,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Параметри каталогу -> URL. Значення за замовчуванням в адресу не потрапляють. */
export function toSearchParams(params) {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.type !== DEFAULT_FILTERS.type) search.set('type', params.type);
  if (params.minPoints !== DEFAULT_FILTERS.minPoints) search.set('minPoints', String(params.minPoints));
  if (params.sort !== DEFAULT_FILTERS.sort) search.set('sort', params.sort);
  if (params.page > 1) search.set('page', String(params.page));
  return search;
}

export function catalogPath(params) {
  const query = toSearchParams({ q: '', page: 1, ...DEFAULT_FILTERS, ...params }).toString();
  return query ? `/catalog?${query}` : '/catalog';
}

/** Скільки фільтрів відрізняються від значень за замовчуванням (пошуковий текст не рахується). */
export function countActiveFilters(params) {
  return ['type', 'minPoints', 'sort'].filter((key) => params[key] !== DEFAULT_FILTERS[key]).length;
}
