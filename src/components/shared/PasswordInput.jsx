import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Password field with a show/hide toggle and an inline error line.
const PasswordInput = ({ id, label, value, onChange, error, autoComplete = "new-password", placeholder, hint }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 ${
            error ? "border-rose-400 focus:ring-rose-300" : "border-gray-300 focus:ring-blue-300"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 hover:text-gray-600"
          aria-label={visible ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
};

// First message per field from a Laravel 422 { errors: { field: [msg] } } response.
export const fieldErrorsFrom = (err) => {
  const errors = err?.data?.errors;
  if (!errors || typeof errors !== "object") return {};
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, Array.isArray(messages) ? messages[0] : String(messages)])
  );
};

export const MIN_PASSWORD_LENGTH = 5;

export default PasswordInput;
