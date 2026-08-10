import { useState } from "react";
import { FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { AccessorySelector } from './AccessorySelector.jsx';

export function CrudModal({
  open,
  title,
  fields = [],
  values = {},
  onChange,
  onSubmit,
  onClose,
  submitLabel = "Save",
}) {
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  return (
    <div className="modal-backdrop-custom">
      <div
        className="action-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="action-modal-header">
          <h2>{title}</h2>

          <button
            className="icon-btn"
            type="button"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <form
  className="action-form"
  onSubmit={(e) => {
    console.log("CRUD MODAL SUBMIT");
    console.log(onSubmit);
    onSubmit(e);
  }}
>
          {fields.map((field) => (
            <label key={field.key}>
              <span>
  {field.label}
  {field.required && <span style={{ color: "red" }}> *</span>}
</span>

              {/* Select Dropdown */}
              {field.type === "accessories" ? (
                <AccessorySelector value={values[field.key] || []} onChange={(nextValue) => onChange(field.key, nextValue)} />
              ) : field.type === "select" ? (

  <select
    className="form-control"
    value={values[field.key] || ""}
    required={field.required}
    onChange={(e) => onChange(field.key, e.target.value)}
  >
    <option value="">Select {field.label}</option>

    {field.options?.map((option) => {
      // Options can be a plain string ("CRM") or a { value, label } pair
      // when the stored value and the human-readable text need to differ,
      // e.g. role: value "IT_TEAM" but label "IT Team".
      const value = typeof option === "object" ? option.value : option;
      const label = typeof option === "object" ? option.label : option;
      return (
        <option key={value} value={value}>
          {label}
        </option>
      );
    })}
  </select>

) : field.type === "file" ? (

  <input
    className="form-control"
    type="file"
    accept={field.accept}
    multiple={field.multiple}
    onChange={(e) => onChange(field.key, field.multiple ? Array.from(e.target.files || []) : e.target.files?.[0])}
  />

) : field.type === "textarea" ? (

  <textarea
    className="form-control"
    rows={3}
    placeholder={field.placeholder || ""}
    required={field.required}
    value={values[field.key] || ""}
    onChange={(e) => onChange(field.key, e.target.value)}
  />

) : field.type === "password" ? (
<div className="password-field">
  <input
    className="form-control"
    type={showPassword ? "text" : "password"}
    placeholder={field.placeholder}
    required={field.required}
    value={values[field.key] || ""}
    onChange={(e) => onChange(field.key, e.target.value)}
  />

  <button
    type="button"
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <FiEyeOff /> : <FiEye />}
  </button>
</div>

) : (

  <input
    className="form-control"
    type={field.type || "text"}
    placeholder={field.placeholder || ""}
    required={field.required}
    value={values[field.key] || ""}
    onChange={(e) => onChange(field.key, e.target.value)}
  />

)}
            </label>
          ))}

          <div className="modal-actions">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

           <button
  className="btn btn-primary"
  type="button"
  onClick={(e) => {
    console.log("BUTTON CLICKED");
    console.log("onSubmit =", onSubmit);

    if (onSubmit) {
      onSubmit(e);
    }
  }}
>
  {submitLabel}
</button>
          </div>
        </form>
      </div>
    </div>
  );
}