import { useState } from 'react';
import { COMMENTS_FORMS, formatDateTime, formatRelativeTime, pluralize } from '../utils/format';
import { ChevronDownIcon } from './Icons';

const TOP_LEVEL_STEP = 15;
const OPEN_BY_DEFAULT_DEPTH = 2;
const FLAT_DEPTH = 6; // глибше відступ не збільшуємо, щоб колонка не звужувалась до нуля

function CommentNode({ comment, depth }) {
  const [open, setOpen] = useState(depth < OPEN_BY_DEFAULT_DEPTH);
  const author = comment.author ?? 'видалений акаунт';
  const hidden = comment.descendants;

  return (
    <li className="comment">
      <div className="comment__head">
        <button
          type="button"
          className="comment__toggle"
          aria-expanded={open}
          aria-label={`${open ? 'Згорнути' : 'Розгорнути'} гілку: ${author}`}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDownIcon />
        </button>
        <span className="comment__author">{author}</span>
        {comment.createdAt && (
          <time className="comment__time" dateTime={comment.createdAt} title={formatDateTime(comment.createdAt)}>
            {formatRelativeTime(comment.createdAt)}
          </time>
        )}
        {!open && hidden > 0 && (
          <span className="comment__hidden">
            згорнуто: {hidden} {pluralize(hidden, COMMENTS_FORMS)}
          </span>
        )}
      </div>

      {open && (
        <div className="comment__content">
          {comment.html ? (
            <div className="comment__body" dangerouslySetInnerHTML={{ __html: comment.html }} />
          ) : (
            <p className="comment__body comment__body--deleted">Коментар видалено.</p>
          )}
          {comment.children.length > 0 && (
            <ol className={`comments comments--nested${depth + 1 >= FLAT_DEPTH ? ' comments--flat' : ''}`}>
              {comment.children.map((child) => (
                <CommentNode key={child.id} comment={child} depth={depth + 1} />
              ))}
            </ol>
          )}
        </div>
      )}
    </li>
  );
}

/** Дерево коментарів. Верхній рівень показується порціями, глибокі гілки — згорнуті, щоб сторінка не «важчала». */
export default function CommentThread({ comments }) {
  const [visible, setVisible] = useState(TOP_LEVEL_STEP);
  const rest = comments.length - visible;

  return (
    <>
      <ol className="comments">
        {comments.slice(0, visible).map((comment) => (
          <CommentNode key={comment.id} comment={comment} depth={0} />
        ))}
      </ol>
      {rest > 0 && (
        <button type="button" className="button button--ghost" onClick={() => setVisible((v) => v + TOP_LEVEL_STEP)}>
          Показати ще коментарі ({Math.min(rest, TOP_LEVEL_STEP)} з {rest})
        </button>
      )}
    </>
  );
}
