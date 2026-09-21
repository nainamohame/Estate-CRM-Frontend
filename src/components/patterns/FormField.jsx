import { Label } from '../ui/label';

/**
 * Wraps a field with a label, hint and error message, wiring aria attributes
 * and reserving space for the error line so the form doesn't jump around as
 * validation messages appear and disappear.
 */
export function FormField({ label, htmlFor, required, hint, error, children }) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;

  return (
    <div>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      <div aria-describedby={error ? errorId : hintId}>{children}</div>
      <div className="min-h-[1.125rem] mt-1">
        {error ? (
          <p id={errorId} className="text-xs text-danger-600">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-fg-subtle">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
