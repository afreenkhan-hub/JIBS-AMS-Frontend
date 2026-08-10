export function FilterPanel({
  filters = [],
  values = {},
  onChange,
  onReset
}) {
  return (
    <div className="filter-panel">
      <div className="filter-panel-row">
        {filters.map((filter) => (
          <label
            key={filter.key}
            className={`filter-field ${filter.className || ''}`}
          >
            <span className="field-label">{filter.label}</span>
 
            {filter.type === 'select' ? (
              <select
                className="form-select"
                value={values[filter.key] || ''}
                onChange={(event) => onChange(filter.key, event.target.value)}
              >
                <option value="">{filter.allLabel || `All ${filter.label}`}</option>
 
                {filter.options?.map((option) => {
                  const optionValue = typeof option === 'object'
                    ? option.value
                    : option;
 
                  const optionLabel = typeof option === 'object'
                    ? option.label
                    : option;
 
                  return (
                    <option key={optionValue} value={optionValue}>
                      {optionLabel}
                    </option>
                  );
                })}
              </select>
            ) : (
              <input
                className="form-control"
                type={filter.type || 'text'}
                placeholder={filter.placeholder || `Search ${filter.label}`}
                value={values[filter.key] || ''}
                onChange={(event) => onChange(filter.key, event.target.value)}
              />
            )}
          </label>
        ))}
 
        <div className="filter-actions">
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={onReset}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}