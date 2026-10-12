import { FormatError, NotFoundError } from './errors';
import { sanitizeHtml } from './sanitize';

const HN_ITEM_URL = 'https://news.ycombinator.com/item?id=';
const HN_HOSTNAME = 'news.ycombinator.com';

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const num = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

function toIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function hostnameOf(url) {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** show | ask | job | poll | story */
function kindOf(tags, type, title) {
  if (tags.includes('show_hn') || /^show hn:/i.test(title)) return 'show';
  if (tags.includes('ask_hn') || /^ask hn:/i.test(title)) return 'ask';
  if (tags.includes('job') || type === 'job') return 'job';
  if (tags.includes('poll') || type === 'poll') return 'poll';
  return 'story';
}

function summaryFields({ id, title, url, author, points, comments, createdAt, kind }) {
  const discussionUrl = `${HN_ITEM_URL}${encodeURIComponent(id)}`;
  const hostname = url ? hostnameOf(url) : null;
  return {
    id,
    title: title || 'Без назви',
    url: hostname ? url : discussionUrl,
    hostname: hostname ?? HN_HOSTNAME,
    hasExternalUrl: hostname !== null,
    author: author || null,
    points,
    comments,
    createdAt,
    kind,
    discussionUrl,
  };
}

/** Елемент зі списку пошуку -> власна структура. */
export function normalizeHit(hit) {
  if (!hit || hit.objectID == null) return null;
  const title = text(hit.title) || text(hit.story_title);
  const tags = Array.isArray(hit._tags) ? hit._tags : [];

  return summaryFields({
    id: String(hit.objectID),
    title,
    url: text(hit.url),
    author: text(hit.author),
    points: num(hit.points),
    comments: num(hit.num_comments),
    createdAt: toIso(hit.created_at),
    kind: kindOf(tags, '', title),
  });
}

function normalizeComment(raw) {
  const children = (Array.isArray(raw.children) ? raw.children : [])
    .map(normalizeComment)
    .filter(Boolean);
  const html = sanitizeHtml(raw.text);

  // Видалений коментар без відповідей показувати нема чого.
  if (!html && children.length === 0) return null;

  return {
    id: String(raw.id),
    author: text(raw.author) || null,
    html,
    createdAt: toIso(raw.created_at),
    children,
    descendants: children.reduce((sum, child) => sum + 1 + child.descendants, 0),
  };
}

/** Відповідь /items/{id} -> історія з деревом коментарів. */
export function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object' || raw.id == null) throw new FormatError();

  // Id коментаря чи варіанта опитування — це не сторінка історії.
  if (raw.type === 'comment' || raw.type === 'pollopt') throw new NotFoundError();

  const title = text(raw.title);
  const thread = (Array.isArray(raw.children) ? raw.children : [])
    .map(normalizeComment)
    .filter(Boolean);
  const commentCount = thread.reduce((sum, comment) => sum + 1 + comment.descendants, 0);

  return {
    ...summaryFields({
      id: String(raw.id),
      title,
      url: text(raw.url),
      author: text(raw.author),
      points: num(raw.points),
      comments: commentCount,
      createdAt: toIso(raw.created_at),
      kind: kindOf([], raw.type, title),
    }),
    html: sanitizeHtml(raw.text),
    thread,
  };
}
