/**
 * Шар доступу до даних. Усе, що стосується адрес, параметрів і формату відповіді Hacker News API,
 * живе лише тут. Функції повертають уже нормалізовані дані, а помилки розрізняють за типом:
 * NotFoundError (404), NetworkError, HttpError, FormatError.
 */
import { createCache } from './cache';
import { API_BASE_URL } from './config';
import { FormatError, NotFoundError } from './errors';
import { getJson } from './http';
import { normalizeHit, normalizeItem } from './normalize';

export const PAGE_SIZE = 12;

const TAGS = ['story', 'show_hn', 'ask_hn', 'poll', 'job', 'front_page'];

// Дані HN змінюються щохвилини, тому кеш короткоживучий: запис старший за 5 хвилин вважається застарілим.
const cache = createCache({ ttlMs: 5 * 60 * 1000, maxEntries: 150 });

async function cachedGet(url, parse, signal) {
  const cached = cache.get(url);
  if (cached !== undefined) return cached;

  const data = parse(await getJson(url, { signal }));
  cache.set(url, data);
  return data;
}

const num = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

/* ------------------------------ каталог ------------------------------ */

/**
 * Усі фільтри каталогу виконує СЕРВЕР, бо клієнт бачить лише одну сторінку з 12 результатів:
 *  - type       -> параметр tags (історії / Show HN / Ask HN / опитування / вакансії / головна);
 *  - minPoints  -> numericFilters=points>=N;
 *  - sort       -> окремий ендпоінт: /search (за популярністю) або /search_by_date (за датою);
 *  - page       -> параметр page (в API нумерація з нуля, у застосунку — з одиниці).
 */
function buildSearchUrl({ query = '', type = 'story', minPoints = 0, sort = 'relevance', page = 1 }) {
  const endpoint = sort === 'date' ? 'search_by_date' : 'search';
  const params = new URLSearchParams({
    tags: TAGS.includes(type) ? type : 'story',
    hitsPerPage: String(PAGE_SIZE),
    page: String(Math.max(0, page - 1)),
  });
  if (query) params.set('query', query); // URLSearchParams кодує пробіли, кирилицю та &, #, ?
  if (minPoints > 0) params.set('numericFilters', `points>=${minPoints}`);
  return `${API_BASE_URL}/${endpoint}?${params.toString()}`;
}

function parseSearch(raw) {
  if (!raw || !Array.isArray(raw.hits)) throw new FormatError();
  return {
    items: raw.hits.map(normalizeHit).filter(Boolean),
    total: num(raw.nbHits),
    totalPages: num(raw.nbPages),
    page: num(raw.page) + 1,
  };
}

/** Список історій за параметрами. Порожній query означає «без пошуку, лише фільтри». */
export function searchStories(params, { signal } = {}) {
  return cachedGet(buildSearchUrl(params), parseSearch, signal);
}

/** Те, що вже є в кеші для цих параметрів (без запиту), або undefined. */
export function peekStories(params) {
  return cache.get(buildSearchUrl(params));
}

/* ------------------------- добірка для головної ------------------------- */

function buildFeaturedUrl() {
  const params = new URLSearchParams({ tags: 'front_page', hitsPerPage: '6' });
  return `${API_BASE_URL}/search?${params.toString()}`;
}

export function getFeaturedStories({ signal } = {}) {
  return cachedGet(buildFeaturedUrl(), parseSearch, signal);
}

export function peekFeaturedStories() {
  return cache.get(buildFeaturedUrl());
}

/* ------------------------------ деталі ------------------------------ */

function buildItemUrl(id) {
  return `${API_BASE_URL}/items/${encodeURIComponent(id)}`;
}

/** Історія з деревом коментарів. Неіснуючий id -> NotFoundError. */
export async function getStory(id, { signal } = {}) {
  // Id в HN — лише цифри. Усе інше не варто навіть відправляти на сервер.
  if (!/^\d+$/.test(String(id))) throw new NotFoundError();
  return cachedGet(buildItemUrl(id), normalizeItem, signal);
}

export function peekStory(id) {
  return cache.get(buildItemUrl(id));
}

/* ------------------------- пов'язані дані: автор ------------------------- */

function buildAuthorUrl(author) {
  const params = new URLSearchParams({ tags: `author_${author},story`, hitsPerPage: '7' });
  return `${API_BASE_URL}/search?${params.toString()}`;
}

function withoutCurrent(data, excludeId) {
  return {
    total: data.total,
    items: data.items.filter((story) => story.id !== String(excludeId)).slice(0, 6),
  };
}

/** Інші публікації автора (окремий запит). Поточну історію прибираємо зі списку. */
export async function getAuthorStories(author, excludeId, { signal } = {}) {
  const data = await cachedGet(buildAuthorUrl(author), parseSearch, signal);
  return withoutCurrent(data, excludeId);
}

export function peekAuthorStories(author, excludeId) {
  const data = cache.get(buildAuthorUrl(author));
  return data ? withoutCurrent(data, excludeId) : undefined;
}
