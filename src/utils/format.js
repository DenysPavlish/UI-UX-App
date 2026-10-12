const relativeFormat = new Intl.RelativeTimeFormat('uk-UA', { numeric: 'auto' });
const pluralRules = new Intl.PluralRules('uk-UA');

const UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

export const KIND_LABELS = {
  story: 'Історія',
  show: 'Show HN',
  ask: 'Ask HN',
  job: 'Вакансія',
  poll: 'Опитування',
};

/** «2 години тому», «вчора» тощо; приймає ISO-рядок. */
export function formatRelativeTime(iso, now = Date.now()) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const diff = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(diff);
  for (const [unit, seconds] of UNITS) {
    if (abs >= seconds) return relativeFormat.format(Math.round(diff / seconds), unit);
  }
  return 'щойно';
}

export function formatDateTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString('uk-UA', { dateStyle: 'long', timeStyle: 'short' });
}

/** Українська множина: 1 бал, 2 бали, 5 балів. */
export function pluralize(count, forms) {
  const category = pluralRules.select(count);
  if (category === 'one') return forms.one;
  if (category === 'few') return forms.few;
  return forms.many;
}

export function formatCount(count) {
  return Number(count).toLocaleString('uk-UA');
}

export const POINTS_FORMS = { one: 'бал', few: 'бали', many: 'балів' };
export const COMMENTS_FORMS = { one: 'коментар', few: 'коментарі', many: 'коментарів' };
export const STORIES_FORMS = { one: 'історію', few: 'історії', many: 'історій' };
