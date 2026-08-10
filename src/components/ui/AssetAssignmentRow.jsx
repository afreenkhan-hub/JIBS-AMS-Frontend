import { Controller } from 'react-hook-form';
import { FiTrash2 } from 'react-icons/fi';
import Select from 'react-select';

/**
 * Builds the Asset Type -> Asset Name -> Serial Number cascading options
 * from the pool of Asset Master records that are currently Available.
 * Expects Asset Master's own field names: assetType, assetName, serialNumber, status.
 */
export function buildAssetOptionMaps(availableAssets = []) {
  const typeOptions = [...new Set(availableAssets.map((asset) => asset.assetType))]
    .filter(Boolean)
    .sort()
    .map((type) => ({ value: type, label: type }));

  return { typeOptions };
}

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    borderColor: state.isFocused ? 'var(--primary, #2563eb)' : '#d9e0ea',
    boxShadow: 'none',
    '&:hover': { borderColor: 'var(--primary, #2563eb)' }
  }),
  menu: (base) => ({ ...base, zIndex: 30 })
};

/**
 * A single asset row inside the "Assigned Assets" / "Replacement Asset"
 * card list. Fully controlled through React Hook Form's <Controller>,
 * so it never reads or writes state outside the form. `availableAssets`
 * must be Asset Master records (status === 'Available').
 */
export function AssetAssignmentRow({
  control,
  index,
  namePrefix = 'rows',
  availableAssets = [],
  selectedRows = [],
  setValue,
  remove,
  canRemove = true
}) {
const currentRow = selectedRows[index] || {};
const currentType = currentRow.assetType || "";
const currentName = currentRow.assetName || "";

// Asset IDs already selected in other rows
const selectedAssetIds = selectedRows
  .filter((_, i) => i !== index)
  .map((row) => Number(row.assetId))
  .filter(Boolean);

// Only assets not already selected
const remainingAssets = availableAssets.filter(
  (asset) => !selectedAssetIds.includes(asset.id)
);

// Asset Type dropdown
const typeOptions = [
  ...new Set(remainingAssets.map((asset) => asset.assetType))
]
  .filter(Boolean)
  .map((type) => ({
    value: type,
    label: type
  }));

const nameOptions = [
  ...new Set(
    remainingAssets
      .filter(asset => !currentType || asset.assetType === currentType)
      .map(asset => asset.assetName)
  )
]
.filter(Boolean)
.map(name => ({
  value: name,
  label: name
}));
   


  const serialOptions = remainingAssets
    .filter((asset) => (!currentType || asset.assetType === currentType) && (!currentName || asset.assetName === currentName))
    .map((asset) => ({ value: String(asset.id), label: asset.serialNumber }));

  return (
    <div className="asset-row-card">
      <div className="asset-row-field">
        <label className="asset-row-label">Asset Type</label>
        <Controller
          control={control}
          name={`${namePrefix}.${index}.assetType`}
          rules={{ required: 'Asset type is required' }}
          render={({ field, fieldState }) => (
            <>
              <Select
                inputId={`assetType-${namePrefix}-${index}`}
                classNamePrefix="rs"
                styles={selectStyles}
                placeholder="Select type"
                isClearable
                options={typeOptions}
                value={typeOptions.find((option) => option.value === field.value) || null}
                onChange={(option) => {
                  field.onChange(option ? option.value : '');
                  setValue(`${namePrefix}.${index}.assetName`, '', { shouldDirty: true });
                  setValue(`${namePrefix}.${index}.assetId`, '', { shouldDirty: true });
                }}
                onBlur={field.onBlur}
              />
              {fieldState.error && <span className="field-error">{fieldState.error.message}</span>}
            </>
          )}
        />
      </div>

      <div className="asset-row-field">
        <label className="asset-row-label">Asset Name</label>
        <Controller
          control={control}
          name={`${namePrefix}.${index}.assetName`}
          rules={{ required: 'Asset name is required' }}
          render={({ field, fieldState }) => (
            <>
              <Select
                inputId={`assetName-${namePrefix}-${index}`}
                classNamePrefix="rs"
                styles={selectStyles}
                placeholder="Select name"
                isClearable
                isDisabled={!currentType}
                options={nameOptions}
                value={nameOptions.find((option) => option.value === field.value) || null}
                onChange={(option) => {
                  field.onChange(option ? option.value : '');
                  setValue(`${namePrefix}.${index}.assetId`, '', { shouldDirty: true });
                }}
                onBlur={field.onBlur}
              />
              {fieldState.error && <span className="field-error">{fieldState.error.message}</span>}
            </>
          )}
        />
      </div>

      <div className="asset-row-field">
        <label className="asset-row-label">Serial Number</label>
        <Controller
          control={control}
          name={`${namePrefix}.${index}.assetId`}
          rules={{ required: 'Serial number is required' }}
          render={({ field, fieldState }) => (
            <>
              <Select
                inputId={`assetSerial-${namePrefix}-${index}`}
                classNamePrefix="rs"
                styles={selectStyles}
                placeholder="Select serial"
                isClearable
                isDisabled={!currentName}
                options={serialOptions}
                value={serialOptions.find((option) => option.value === String(field.value)) || null}
                onChange={(option) => field.onChange(option ? option.value : '')}
                onBlur={field.onBlur}
              />
              {fieldState.error && <span className="field-error">{fieldState.error.message}</span>}
            </>
          )}
        />
      </div>

      <div className="asset-row-field asset-row-field-status">
        <label className="asset-row-label">Status</label>
        <Controller
          control={control}
          name={`${namePrefix}.${index}.status`}
          render={({ field }) => (
            <select className="form-select" {...field}>
              <option>Active</option>
            </select>
          )}
        />
      </div>

      <div className="asset-row-field asset-row-field-remove">
        <button
          type="button"
          className="btn btn-outline-danger w-100"
          onClick={() => remove(index)}
          disabled={!canRemove}
          title="Remove asset row"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}
