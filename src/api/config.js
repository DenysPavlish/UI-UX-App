/** Єдине місце, де живе базова адреса API. Можна перевизначити змінною оточення VITE_API_BASE_URL. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://hn.algolia.com/api/v1'
).replace(/\/+$/, '');
