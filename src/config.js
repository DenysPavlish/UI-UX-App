export const APP_NAME = 'Сигнал';

/** Джерело даних для підвалу та сторінки «Про застосунок» (це посилання для людей, не адреса запитів). */
export const API_ATTRIBUTION = {
  name: 'Hacker News Search API',
  provider: 'Algolia',
  url: 'https://hn.algolia.com/api',
};

export const STORAGE_KEYS = {
  favorites: 'signal:favorites',
  theme: 'signal:theme',
};

export const SEARCH_DELAY_MS = 400;
export const MIN_QUERY_LENGTH = 2;

export const TYPE_OPTIONS = [
  { value: 'story', label: 'Усі історії' },
  { value: 'show_hn', label: 'Show HN' },
  { value: 'ask_hn', label: 'Ask HN' },
  { value: 'front_page', label: 'На головній' },
  { value: 'poll', label: 'Опитування' },
  { value: 'job', label: 'Вакансії' },
];

export const MIN_POINTS_OPTIONS = [0, 10, 50, 100, 300, 500].map((value) => ({
  value,
  label: value === 0 ? 'Будь-яка' : `від ${value}`,
}));

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'За популярністю' },
  { value: 'date', label: 'Спочатку нові' },
];

/** Добірки на головній: кожна веде в каталог із уже застосованими фільтрами. */
export const HOME_LINKS = [
  {
    label: 'Show HN зі 100+ балами',
    description: 'Проєкти, які автори показують спільноті',
    params: { type: 'show_hn', minPoints: 100 },
  },
  {
    label: 'Нові запитання Ask HN',
    description: 'Що зараз питають розробники',
    params: { type: 'ask_hn', sort: 'date' },
  },
  {
    label: 'Вакансії',
    description: 'Свіжі пропозиції від компаній',
    params: { type: 'job', sort: 'date' },
  },
  {
    label: 'Усе про Rust',
    description: 'Обговорення з 50+ балами',
    params: { q: 'rust', minPoints: 50 },
  },
];
