import { Link, useLocation, useParams } from 'react-router-dom';
import { NotFoundError } from '../api/errors';
import CommentThread from '../components/CommentThread';
import FavoriteButton from '../components/FavoriteButton';
import { ChevronLeftIcon, ExternalIcon } from '../components/Icons';
import PageHeading from '../components/PageHeading';
import { EmptyState, ErrorState, NotFoundState, Skeleton } from '../components/StateViews';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuthorStories, useStory } from '../hooks/useStoryData';
import {
  COMMENTS_FORMS,
  KIND_LABELS,
  POINTS_FORMS,
  formatCount,
  formatDateTime,
  formatRelativeTime,
  pluralize,
} from '../utils/format';

function RelatedStories({ author, related, backTo }) {
  return (
    <aside className="related" aria-labelledby="related-title">
      <h2 id="related-title" className="section__title section__title--small">
        Інші публікації {author}
      </h2>

      {related.status === 'loading' && (
        <ul className="related__list" aria-hidden="true">
          {[0, 1, 2].map((key) => (
            <li key={key} className="related__item">
              <Skeleton className="skeleton--title" />
              <Skeleton className="skeleton--meta" />
            </li>
          ))}
        </ul>
      )}

      {related.status === 'error' && <ErrorState compact error={related.error} onRetry={related.retry} />}

      {related.status === 'success' && related.data.items.length === 0 && (
        <EmptyState compact title="Більше нічого немає">
          Це єдина історія цього автора.
        </EmptyState>
      )}

      {related.status === 'success' && related.data.items.length > 0 && (
        <ul className="related__list">
          {related.data.items.map((story) => (
            <li key={story.id} className="related__item">
              <Link className="related__link" to={`/story/${story.id}`} state={{ from: backTo }}>
                {story.title}
              </Link>
              <span className="related__meta">
                <span>
                  {formatCount(story.points)} {pluralize(story.points, POINTS_FORMS)}
                </span>
                <span>{formatRelativeTime(story.createdAt)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default function DetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const backTo = location.state?.from ?? '/catalog';
  const backLabel = backTo.startsWith('/favorites')
    ? 'Назад до обраного'
    : backTo === '/'
      ? 'На головну'
      : 'Назад до каталогу';

  const story = useStory(id);
  // Пов'язані дані — окремий запит: стартує, коли відомий автор, і не блокує основний вміст.
  const related = useAuthorStories(story.data?.author ?? null, id);

  const isNotFound = story.status === 'error' && story.error instanceof NotFoundError;

  let title = 'Матеріал';
  if (story.status === 'success') title = story.data.title;
  if (isNotFound) title = 'Не знайдено';
  else if (story.status === 'error') title = 'Помилка';
  useDocumentTitle(title);

  const data = story.data;

  return (
    <article className="details">
      <Link className="back-link" to={backTo}>
        <ChevronLeftIcon />
        {backLabel}
      </Link>

      <PageHeading className="details__title">
        {story.status === 'loading' && (
          <>
            <Skeleton className="skeleton--heading" />
            <span className="visually-hidden">Завантаження історії…</span>
          </>
        )}
        {story.status === 'success' && data.title}
        {isNotFound && 'Історію не знайдено'}
        {story.status === 'error' && !isNotFound && 'Не вдалося завантажити'}
      </PageHeading>

      {isNotFound && (
        <NotFoundState title={`Історії з номером ${id} не існує`} to={backTo} linkLabel={backLabel}>
          Можливо, її видалили, або адресу введено з помилкою.
        </NotFoundState>
      )}

      {story.status === 'error' && !isNotFound && <ErrorState error={story.error} onRetry={story.retry} />}

      {story.status === 'success' && (
        <div className="details__layout">
          <div className="details__main">
            <div className="facts">
              <div className="facts__score">
                <span className="facts__points">{formatCount(data.points)}</span>
                <span className="facts__unit">{pluralize(data.points, POINTS_FORMS)}</span>
              </div>
              <dl className="facts__list">
                <div>
                  <dt>Тип</dt>
                  <dd>{KIND_LABELS[data.kind]}</dd>
                </div>
                <div>
                  <dt>Автор</dt>
                  <dd>{data.author ?? 'видалений акаунт'}</dd>
                </div>
                <div>
                  <dt>Опубліковано</dt>
                  <dd>{formatDateTime(data.createdAt) || '—'}</dd>
                </div>
                <div>
                  <dt>Джерело</dt>
                  <dd>{data.hostname}</dd>
                </div>
                <div>
                  <dt>Коментарі</dt>
                  <dd>
                    {formatCount(data.comments)} {pluralize(data.comments, COMMENTS_FORMS)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="details__actions">
              <FavoriteButton item={data} withLabel />
              {data.hasExternalUrl && (
                <a className="button button--ghost" href={data.url} target="_blank" rel="noopener noreferrer">
                  <ExternalIcon />
                  Читати першоджерело
                </a>
              )}
              <a className="button button--ghost" href={data.discussionUrl} target="_blank" rel="noopener noreferrer">
                <ExternalIcon />
                Обговорення на Hacker News
              </a>
            </div>

            {data.html && <div className="prose" dangerouslySetInnerHTML={{ __html: data.html }} />}

            <section className="comments-section" aria-labelledby="comments-title">
              <h2 id="comments-title" className="section__title">
                Коментарі
                <span className="section__count">{formatCount(data.comments)}</span>
              </h2>
              {data.thread.length > 0 ? (
                <CommentThread comments={data.thread} />
              ) : (
                <EmptyState compact title="Коментарів поки немає">
                  Станьте першим на Hacker News: посилання на обговорення вгорі сторінки.
                </EmptyState>
              )}
            </section>
          </div>

          <div className="details__side">
            {data.author ? (
              <RelatedStories author={data.author} related={related} backTo={backTo} />
            ) : null}
          </div>
        </div>
      )}
    </article>
  );
}
