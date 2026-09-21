import { useCallback, useState } from 'react';

/**
 * Minimal form state hook: values, per-field errors, touched state, and a
 * submit wrapper that validates before calling onSubmit. Small enough that a
 * form library buys nothing at this app's size.
 *
 * @param {object} options
 * @param {object} options.initialValues
 * @param {Record<string, (value: any, values: object) => string | undefined>} [options.validators]
 * @param {(values: object) => Promise<void> | void} options.onSubmit
 */
export function useForm({ initialValues, validators = {}, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const validateField = useCallback(
    (name, value, allValues) => {
      const validator = validators[name];
      return validator ? validator(value, allValues) : undefined;
    },
    [validators]
  );

  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        return next;
      });
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    []
  );

  const handleChange = useCallback(
    (name) => (eventOrValue) => {
      const value =
        eventOrValue && eventOrValue.target
          ? eventOrValue.target.type === 'checkbox'
            ? eventOrValue.target.checked
            : eventOrValue.target.value
          : eventOrValue;
      setValue(name, value);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    (name) => () => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({ ...prev, [name]: validateField(name, values[name], values) }));
    },
    [validateField, values]
  );

  const validateAll = useCallback(() => {
    const nextErrors = {};
    for (const name of Object.keys(validators)) {
      const err = validateField(name, values[name], values);
      if (err) nextErrors[name] = err;
    }
    setErrors(nextErrors);
    setTouched(Object.fromEntries(Object.keys(validators).map((k) => [k, true])));
    return Object.keys(nextErrors).length === 0;
  }, [validateField, validators, values]);

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault?.();
      setSubmitError(null);
      if (!validateAll()) return;

      setIsSubmitting(true);
      Promise.resolve(onSubmit(values))
        .catch((err) => setSubmitError(err?.message ?? 'Something went wrong. Please try again.'))
        .finally(() => setIsSubmitting(false));
    },
    [onSubmit, validateAll, values]
  );

  const reset = useCallback((next = initialValues) => {
    setValues(next);
    setErrors({});
    setTouched({});
    setSubmitError(null);
  }, [initialValues]);

  // Deliberately excludes the error message itself: every caller passes that
  // to FormField's own `error` prop, and `errorMessage` is not a valid DOM
  // attribute — spreading it onto a native <input> would leak through as an
  // unrecognized prop and trigger a React warning.
  const fieldProps = useCallback(
    (name) => ({
      name,
      value: values[name] ?? '',
      onChange: handleChange(name),
      onBlur: handleBlur(name),
      invalid: Boolean(touched[name] && errors[name]),
    }),
    [values, errors, touched, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    setValue,
    setValues,
    handleChange,
    handleBlur,
    handleSubmit,
    fieldProps,
    reset,
  };
}
