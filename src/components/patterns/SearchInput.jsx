import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { IconSearch, IconX } from '../ui/icons';
import { useDebounce } from '../../hooks/useDebounce';

export function SearchInput({ value = '', onChange, placeholder = 'Search…', delay = 300, className }) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebounce(draft, delay);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <Input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      placeholder={placeholder}
      leftIcon={<IconSearch size={16} />}
      rightIcon={
        draft ? (
          <button type="button" onClick={() => setDraft('')} aria-label="Clear search" className="hover:text-fg">
            <IconX size={14} />
          </button>
        ) : undefined
      }
      className={className}
    />
  );
}
