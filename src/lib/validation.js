// Tiny, dependency-free validators for the hand-rolled useForm hook.
// Each returns an error string or undefined.

export const required = (message = 'This field is required') => (value) => {
  if (value === undefined || value === null) return message;
  if (typeof value === 'string' && value.trim() === '') return message;
  return undefined;
};

export const minLength = (min, message) => (value) => {
  if (!value) return undefined;
  return String(value).trim().length < min ? message ?? `Must be at least ${min} characters` : undefined;
};

export const email = (message = 'Enter a valid email address') => (value) => {
  if (!value) return undefined;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : message;
};

export const phone = (message = 'Enter a valid phone number') => (value) => {
  if (!value) return undefined;
  return String(value).replace(/\D/g, '').length >= 10 ? undefined : message;
};

export const min = (n, message) => (value) => {
  if (value === '' || value === undefined || value === null) return undefined;
  return Number(value) < n ? message ?? `Must be at least ${n}` : undefined;
};

export const compose = (...validators) => (value) => {
  for (const v of validators) {
    const err = v(value);
    if (err) return err;
  }
  return undefined;
};
