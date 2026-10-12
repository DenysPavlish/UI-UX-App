const ALLOWED_TAGS = new Set([
  'P', 'A', 'I', 'EM', 'B', 'STRONG', 'PRE', 'CODE', 'BR', 'UL', 'OL', 'LI', 'BLOCKQUOTE',
]);
const DROPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'NOSCRIPT']);

function clean(parent) {
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) continue;
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.remove();
      continue;
    }
    if (DROPPED_TAGS.has(node.tagName)) {
      node.remove();
      continue;
    }

    clean(node);

    const href = node.tagName === 'A' ? node.getAttribute('href') || '' : '';
    const isSafeLink = node.tagName !== 'A' || /^https?:\/\//i.test(href);

    if (!ALLOWED_TAGS.has(node.tagName) || !isSafeLink) {
      node.replaceWith(...Array.from(node.childNodes));
      continue;
    }

    for (const attr of Array.from(node.attributes)) node.removeAttribute(attr.name);
    if (node.tagName === 'A') {
      node.setAttribute('href', href);
      node.setAttribute('rel', 'noopener noreferrer nofollow');
      node.setAttribute('target', '_blank');
    }
  }
}

/**
 * Коментарі приходять як HTML. Перед показом лишаємо лише безпечні теги
 * й посилання http(s); усе інше розгортається в текст або видаляється.
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string' || html.trim() === '') return '';
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  clean(doc.body);
  return doc.body.innerHTML;
}
