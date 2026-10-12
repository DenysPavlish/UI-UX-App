import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeading from '../components/PageHeading';
import { EmptyState } from '../components/StateViews';
import StoryCard from '../components/StoryCard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesPage() {
  useDocumentTitle('Обране');
  const { items, count, clear } = useFavorites();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="favorites">
      <header className="page-header">
        <PageHeading>Обране</PageHeading>
        <p className="page-header__lead">
          Збережене лишається в цьому браузері й відкривається без запитів до сервера.
        </p>
      </header>

      {count === 0 ? (
        <EmptyState
          title="Тут поки порожньо"
          action={
            <Link className="button" to="/catalog">
              Перейти до каталогу
            </Link>
          }
        >
          Натисніть зірку на картці історії, і вона з’явиться тут.
        </EmptyState>
      ) : (
        <>
          <div className="favorites__bar">
            <p className="favorites__count" role="status">
              Збережено: {count}
            </p>
            {confirming ? (
              <div className="favorites__confirm" role="group" aria-label="Підтвердження очищення">
                <span>Видалити все з обраного?</span>
                <button
                  type="button"
                  className="button button--danger"
                  onClick={() => {
                    clear();
                    setConfirming(false);
                  }}
                >
                  Так, очистити
                </button>
                <button type="button" className="button button--ghost" onClick={() => setConfirming(false)}>
                  Скасувати
                </button>
              </div>
            ) : (
              <button type="button" className="button button--ghost" onClick={() => setConfirming(true)}>
                Очистити все
              </button>
            )}
          </div>

          <ul className="card-grid">
            {items.map((story) => (
              <li key={story.id}>
                <StoryCard story={story} from="/favorites" />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
