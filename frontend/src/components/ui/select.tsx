'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';

interface Option {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ options, value, onValueChange, placeholder = 'Selecione...', searchable = true, disabled = false, error, className }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const listboxRef = React.useRef<HTMLUListElement>(null);

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options;
      return options.filter(
        option =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          option.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [options, searchQuery]);
    const selectedOption = options.find(opt => opt.value === value);

    React.useEffect(() => {
      if (!open) {
        setHighlightedIndex(-1);
      }
    }, [open]);


    React.useEffect(() => {
      if (open && highlightedIndex >= 0 && listboxRef.current) {
        const items = listboxRef.current.querySelectorAll('[role="option"]');
        const highlightedItem = items[highlightedIndex] as HTMLElement;
        if (highlightedItem) {
          highlightedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }, [open, highlightedIndex]);

    return (
      <div ref={ref} className={cn('relative w-full', className)}>
        <button
          ref={buttonRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-labelledby="select-label"
          aria-describedby={error ? 'select-error' : undefined}
          onClick={() => setOpen(prev => !prev)}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            open && 'ring-2 ring-ring ring-offset-2',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
        >
          <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon}
                {selectedOption.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDownIcon className={cn('h-4 w-4 opacity-50 transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div
            role="listbox"
            aria-label="Opções disponíveis"
            className={cn(
              'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md animate-in fade-in zoom-in-95 duration-200',
              'top-full left-0'
            )}
          >
            {searchable && options.length > 10 && (
              <div className="border-b p-2">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={e => e.stopPropagation()}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoFocus
                />
              </div>
            )}

            <ul ref={listboxRef} className="max-h-52 overflow-auto p-1" role="group">
              {filteredOptions.length === 0 ? (
                <li className="relative flex cursor-default select-none items-center rounded-sm py-2 px-3 text-sm text-muted-foreground">
                  Nenhum resultado encontrado
                </li>
              ) : (
                filteredOptions.map((option, index) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={value === option.value}
                    data-highlighted={highlightedIndex === index}
                    onClick={() => {
                      onValueChange(option.value);
                      setOpen(false);
                      setSearchQuery('');
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      value === option.value && 'bg-accent text-accent-foreground font-medium',
                      highlightedIndex === index && 'bg-accent'
                    )}
                  >
                    <span className="flex items-center gap-2 flex-1 truncate">
                      {option.icon && <span>{option.icon}</span>}
                      <span className="flex flex-col">
                        <span>{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {option.description}
                          </span>
                        )}
                      </span>
                    </span>
                    {value === option.value && (
                      <CheckIcon className="h-4 w-4 ml-2" aria-hidden="true" />
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
