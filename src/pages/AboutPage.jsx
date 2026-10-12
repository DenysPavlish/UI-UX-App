import PageHeading from '../components/PageHeading';
import { API_ATTRIBUTION, APP_NAME } from '../config';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const TECH = [
  ['React 19', 'інтерфейс і хуки'],
  ['React Router', 'сторінки, параметри адреси, відновлення прокрутки'],
  ['Context + localStorage', 'обране й тема, що переживають перезавантаження'],
  ['fetch + AbortController', 'запити до API й скасування застарілих'],
  ['Vite і SCSS', 'збірка та стилі на дизайн-токенах'],
];

export default function AboutPage() {
  useDocumentTitle('Про застосунок');

  return (
    <div className="about">
      <header className="page-header">
        <PageHeading>Про застосунок</PageHeading>
        <p className="page-header__lead">
          {APP_NAME} — зручний клієнт для Hacker News: історії, дерево коментарів і добірки без реєстрації.
        </p>
      </header>

      <div className="about__grid">
        <section className="about__block" aria-labelledby="about-data">
          <h2 id="about-data" className="section__title section__title--small">
            Звідки дані
          </h2>
          <p>
            Усі історії й коментарі приходять з{' '}
            <a href={API_ATTRIBUTION.url} target="_blank" rel="noopener noreferrer">
              {API_ATTRIBUTION.name}
            </a>{' '}
            від {API_ATTRIBUTION.provider}. Це відкритий API Hacker News, ключ доступу не потрібен.
          </p>
          <p>
            Каталог використовує пошук, фільтри за типом і балами та сортування за датою. Сторінка історії
            завантажує пост із деревом коментарів, а список інших публікацій автора — окремим запитом.
          </p>
          <p>{APP_NAME} не пов’язаний з Y Combinator чи Hacker News.</p>
        </section>

        <section className="about__block" aria-labelledby="about-tech">
          <h2 id="about-tech" className="section__title section__title--small">
            З чого зроблено
          </h2>
          <ul className="tech-list">
            {TECH.map(([name, description]) => (
              <li key={name}>
                <strong>{name}</strong>
                <span>{description}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
