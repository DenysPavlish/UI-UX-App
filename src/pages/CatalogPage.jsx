import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { PAGE_SIZE } from '../api/hn';
import FilterPanel from '../components/FilterPanel';
import { FilterIcon } from '../components/Icons';
import PageHeading from '../components/PageHeading';
import Pagination from '../components/Pagination';
import SearchField from '../components/SearchField';
import { CardSkeletonGrid, EmptyState, ErrorState } from '../components/StateViews';
import StoryCard from '../components/StoryCard';
import { MIN_QUERY_LENGTH, SEARCH_DELAY_MS } from '../config';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useStoryList } from '../hooks/useStoryData';
import { STORIES_FORMS, formatCount, pluralize } from '../utils/format';
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  normalizeQuery,
  readCatalogParams,
  toSearchParams,
} from '../utils/catalogParams';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // URL — єдине джерело правди для запиту: пошук, фільтри, сортування й сторінка читаються звідси.
  const params = readCatalogParams(searchParams);
  const { q, type, minPoints, sort, page } = params;
  const query = q.length >= MIN_QUERY_LENGTH ? q : '';

  const [filtersOpen, setFiltersOpen] = useState(false);

  /* ---------- поле пошуку: текст -> (пауза) -> URL, і назад (кнопка «Назад») ---------- */
  const [text, setText] = useState(q);
  const typed = normalizeQuery(text);
  const debounced = useDebouncedValue(typed, typed === '' ? 0 : SEARCH_DELAY_MS);

  useEffect(() => {
    // URL змінився ззовні (Назад, посилання) -> оновлюємо поле
    setText((current) => (normalizeQuery(current) === q ? current : q));
  }, [q]);

  useEffect(() => {
    // Записуємо в адресу лише «заспокоєний» текст; replace, щоб кожна літера не засмічувала історію.
    if (debounced !== typed || debounced === q) return;
    setSearchParams(toSearchParams({ type, minPoints, sort, q: debounced, page: 1 }), { replace: true });
  }, [debounced, typed, q, type, minPoints, sort, setSearchParams]);

  /* ---------- фільтри: зміна будь-якого повертає на першу сторінку ---------- */
  const updateFilters = (patch) => {
    setSearchParams(toSearchParams({ ...params, ...patch, page: 1 }));
  };
  const resetFilters = () => {
    setSearchParams(toSearchParams({ ...DEFAULT_FILTERS, q, page: 1 }));
  };
  const getPageTo = (nextPage) => ({ search: `?${toSearchParams({ ...params, page: nextPage })}` });

  /* ---------- дані ---------- */
  const list = useStoryList({ query, type, minPoints, sort, page });
  const activeFilters = countActiveFilters(params);
  const from = `${location.pathname}${location.search}`;

  useDocumentTitle(page > 1 ? `Каталог, сторінка ${page}` : 'Каталог');

  const total = list.data?.total ?? 0;
  const totalPages = list.data?.totalPages ?? 0;
  const items = list.data?.items ?? [];
  const firstShown = (page - 1) * PAGE_SIZE + 1;

  let summary = '';
  if (list.status === 'loading') summary = 'Завантаження…';
  if (list.status === 'success' && items.length > 0) {
    summary = `Знайдено ${formatCount(total)} ${pluralize(total, STORIES_FORMS)}. Показано ${firstShown}–${firstShown + items.length - 1}.`;
  }

  return (
    <div className="catalog">
      <header className="page-header">
        <PageHeading>Каталог</PageHeading>
        <p className="page-header__lead">
          Шукайте за темою, відфільтруйте за типом і балами, відсортуйте за популярністю або датою.
        </p>
      </header>

      <div className="catalog__controls">
        <SearchField
          id="catalog-search"
          label="Пошук історій"
          value={text}
          onChange={setText}
          placeholder="Наприклад: rust, sqlite, startup"
          hint={
            typed.length === 1
              ? 'Для пошуку потрібно щонайменше 2 символи.'
              : 'Порожнє поле показує всі історії за вибраними фільтрами.'
          }
        />

        <button
          type="button"
          className="button button--ghost catalog__filters-toggle"
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <FilterIcon />
          Фільтри
          {activeFilters > 0 && <span className="counter">{activeFilters}</span>}
        </button>

        <FilterPanel
          id="catalog-filters"
          params={params}
          open={filtersOpen}
          onChange={updateFilters}
          onReset={resetFilters}
          canReset={activeFilters > 0}
        />
      </div>

      <section className="results" aria-live="polite" aria-busy={list.status === 'loading'} aria-label="Результати">
        <p className="results__summary">{summary}</p>

        {list.status === 'loading' && <CardSkeletonGrid count={PAGE_SIZE} />}

        {list.status === 'error' && <ErrorState error={list.error} onRetry={list.retry} />}

        {list.status === 'success' && items.length === 0 && (
          <EmptyState
            title="Нічого не знайдено"
            action={
              page > 1 ? (
                <Link className="button" to={getPageTo(1)}>
                  На першу сторінку
                </Link>
              ) : activeFilters > 0 ? (
                <button type="button" className="button" onClick={resetFilters}>
                  Скинути фільтри
                </button>
              ) : null
            }
          >
            {page > 1
              ? 'На цій сторінці немає результатів: у вибірки менше сторінок.'
              : query
                ? `За запитом «${query}» нічого не знайдено. Змініть слово або послабте фільтри.`
                : 'За вибраними фільтрами історій немає. Послабте фільтри.'}
          </EmptyState>
        )}

        {list.status === 'success' && items.length > 0 && (
          <>
            <ul className="card-grid">
              {items.map((story) => (
                <li key={story.id}>
                  <StoryCard story={story} from={from} />
                </li>
              ))}
            </ul>
            <Pagination page={page} totalPages={totalPages} getTo={getPageTo} />
          </>
        )}
      </section>
    </div>
  );
}
