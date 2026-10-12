import { Link } from 'react-router-dom';
import PageHeading from '../components/PageHeading';
import { CardSkeletonGrid, ErrorState } from '../components/StateViews';
import StoryCard from '../components/StoryCard';
import { HOME_LINKS } from '../config';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFeaturedStories } from '../hooks/useStoryData';
import { catalogPath } from '../utils/catalogParams';

export default function HomePage() {
  useDocumentTitle('');
  const featured = useFeaturedStories();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__copy">
          <PageHeading className="hero__title">Що зараз обговорюють розробники</PageHeading>
          <p className="hero__lead">
            Сигнал показує історії з Hacker News: головне зараз, проєкти Show HN, запитання спільноті
            та вакансії. Шукайте за темою, відсікайте шум балами й зберігайте потрібне в обране.
          </p>
          <Link className="button button--large" to="/catalog">
            Відкрити каталог
          </Link>
        </div>

        <nav className="hero__picks" aria-label="Швидкі добірки">
          <p className="hero__picks-title">Швидкі добірки</p>
          <ul className="picks">
            {HOME_LINKS.map((link) => (
              <li key={link.label}>
                <Link className="pick" to={catalogPath(link.params)}>
                  <span className="pick__label">{link.label}</span>
                  <span className="pick__description">{link.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <section className="section" aria-labelledby="featured-title">
        <div className="section__head">
          <h2 id="featured-title" className="section__title">
            Зараз на головній Hacker News
          </h2>
          <Link className="text-link" to="/catalog?type=front_page">
            Усі з головної
          </Link>
        </div>

        {featured.status === 'loading' && <CardSkeletonGrid count={6} />}
        {featured.status === 'error' && <ErrorState error={featured.error} onRetry={featured.retry} />}
        {featured.status === 'success' && (
          <ol className="card-grid card-grid--ranked">
            {featured.data.items.map((story, index) => (
              <li key={story.id}>
                <StoryCard story={story} from="/" rank={index + 1} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
