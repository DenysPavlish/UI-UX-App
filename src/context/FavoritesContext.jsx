import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../config';

export const FavoritesContext = createContext(null);

/**
 * В обране кладемо знімок картки (а не лише id): так сторінка «Обране» показується
 * без жодного запиту до API. Дерево коментарів не зберігаємо — воно велике й не потрібне для списку.
 */
function pickFavorite(item) {
  if (!item || typeof item.id !== 'string' || typeof item.title !== 'string') return null;
  return {
    id: item.id,
    title: item.title,
    url: typeof item.url === 'string' ? item.url : '',
    hostname: typeof item.hostname === 'string' ? item.hostname : '',
    author: typeof item.author === 'string' ? item.author : null,
    points: Number.isFinite(item.points) ? item.points : 0,
    comments: Number.isFinite(item.comments) ? item.comments : 0,
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : null,
    kind: typeof item.kind === 'string' ? item.kind : 'story',
    discussionUrl: typeof item.discussionUrl === 'string' ? item.discussionUrl : '',
  };
}

/** Читання з localStorage захищене: пошкоджений рядок або чужий формат дають порожній список. */
function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.favorites);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    const seen = new Set();
    return data
      .map(pickFavorite)
      .filter((item) => item && !seen.has(item.id) && seen.add(item.id));
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  // Читаємо один раз, під час створення стану: функція в useState виконується лише на першому рендері.
  const [items, setItems] = useState(readStored);

  // Запис — побічний ефект, який залежить від стану: змінився список -> записали.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(items));
    } catch {
      // сховище переповнене або заборонене — застосунок працює далі, просто без збереження
    }
  }, [items]);

  // Якщо обране змінили в іншій вкладці — підтягуємо.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEYS.favorites) setItems(readStored());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggle = useCallback((item) => {
    const favorite = pickFavorite(item);
    if (!favorite) return;
    setItems((current) =>
      current.some((entry) => entry.id === favorite.id)
        ? current.filter((entry) => entry.id !== favorite.id)
        : [favorite, ...current],
    );
  }, []);

  const remove = useCallback((id) => {
    setItems((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const ids = new Set(items.map((entry) => entry.id));
    return {
      items,
      count: items.length,
      isFavorite: (id) => ids.has(id),
      toggle,
      remove,
      clear,
    };
  }, [items, toggle, remove, clear]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
