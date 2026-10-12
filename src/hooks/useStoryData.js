import {
  getAuthorStories,
  getFeaturedStories,
  getStory,
  peekAuthorStories,
  peekFeaturedStories,
  peekStories,
  peekStory,
  searchStories,
} from '../api/hn';
import { useResource } from './useResource';

/** Каталог: параметри беруться з URL, тож ключ складається з простих значень. */
export function useStoryList({ query, type, minPoints, sort, page }) {
  const params = { query, type, minPoints, sort, page };
  return useResource({
    key: JSON.stringify([query, type, minPoints, sort, page]),
    peek: () => peekStories(params),
    load: (signal) => searchStories(params, { signal }),
  });
}

/** Головна: добірка з головної сторінки HN. */
export function useFeaturedStories() {
  return useResource({
    key: 'featured',
    peek: peekFeaturedStories,
    load: (signal) => getFeaturedStories({ signal }),
  });
}

/** Деталі: id з адреси входить у ключ, тому перехід між історіями завантажує нову. */
export function useStory(id) {
  return useResource({
    key: `story:${id}`,
    peek: () => peekStory(id),
    load: (signal) => getStory(id, { signal }),
  });
}

/** Пов'язані дані: окремий запит зі своїми станами. Стартує, коли відомий автор. */
export function useAuthorStories(author, excludeId) {
  return useResource({
    key: `author:${author}:${excludeId}`,
    enabled: Boolean(author),
    peek: () => peekAuthorStories(author, excludeId),
    load: (signal) => getAuthorStories(author, excludeId, { signal }),
  });
}
