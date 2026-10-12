import { MIN_POINTS_OPTIONS, SORT_OPTIONS, TYPE_OPTIONS } from '../config';
import ChipGroup from './ChipGroup';

export default function FilterPanel({ id, params, open, onChange, onReset, canReset }) {
  return (
    <div id={id} className={`filter-panel${open ? ' is-open' : ''}`}>
      <ChipGroup
        legend="Тип публікації"
        options={TYPE_OPTIONS}
        value={params.type}
        onChange={(type) => onChange({ type })}
      />

      <div className="filter-panel__row">
        <div className="field">
          <label className="field__label" htmlFor={`${id}-points`}>
            Мінімум балів
          </label>
          <select
            id={`${id}-points`}
            className="field__select"
            value={params.minPoints}
            onChange={(event) => onChange({ minPoints: Number(event.target.value) })}
          >
            {MIN_POINTS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <ChipGroup
          legend="Сортування"
          options={SORT_OPTIONS}
          value={params.sort}
          onChange={(sort) => onChange({ sort })}
        />
      </div>

      {canReset && (
        <button type="button" className="button button--ghost" onClick={onReset}>
          Скинути фільтри
        </button>
      )}
    </div>
  );
}
