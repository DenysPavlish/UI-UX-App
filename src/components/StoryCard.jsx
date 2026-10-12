import { Link } from 'react-router-dom';
import {
  COMMENTS_FORMS,
  KIND_LABELS,
  POINTS_FORMS,
  formatCount,
  formatDateTime,
  formatRelativeTime,
  pluralize,
} from '../utils/format';
import FavoriteButton from './FavoriteButton';

/**
 * Картка історії. Ліворуч — смуга балів: висота шкали усередині залежить від кількості балів
 * (логарифмічно, 1000 балів — повна шкала).
 * Вся картка клікабельна через розтягнуте посилання на заголовку.
 */
export default function StoryCard({ story, from, rank }) {
  const level = Math.min(1, Math.log10(story.points + 1) / 3);
  const isJob = story.kind === 'job';

  return (
    <article className="story-card">
      <div className="story-card__score" style={{ '--level': level }}>
        {rank != null && <span className="story-card__rank">№{rank}</span>}
        {isJob ? (
          <span className="story-card__job">Вакансія</span>
        ) : (
          <>
            <span className="story-card__points">{formatCount(story.points)}</span>
            <span className="story-card__unit">{pluralize(story.points, POINTS_FORMS)}</span>
          </>
        )}
      </div>

      <div className="story-card__body">
        <p className="story-card__kind">
          <span className={`badge badge--${story.kind}`}>{KIND_LABELS[story.kind]}</span>
          <span className="story-card__source">{story.hostname}</span>
        </p>
        <h3 className="story-card__title">
          <Link to={`/story/${story.id}`} state={{ from }} className="story-card__link">
            {story.title}
          </Link>
        </h3>
        <p className="story-card__meta">
          {story.author && <span>{story.author}</span>}
          {story.createdAt && (
            <time dateTime={story.createdAt} title={formatDateTime(story.createdAt)}>
              {formatRelativeTime(story.createdAt)}
            </time>
          )}
          <span>
            {formatCount(story.comments)} {pluralize(story.comments, COMMENTS_FORMS)}
          </span>
        </p>
      </div>

      <FavoriteButton item={story} className="story-card__favorite" />
    </article>
  );
}
