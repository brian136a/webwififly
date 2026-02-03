/**
 * Autocomplete Input Component
 * Provides suggestions while typing
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { MdExpandMore } from 'react-icons/md';

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  suggestions: string[];
  placeholder: string;
  inputClassName: string;
  disabled?: boolean;
  type?: 'text' | 'number';
  inputMode?: 'text' | 'numeric' | 'decimal';
  step?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function Autocomplete({
  value,
  onChange,
  onSuggestionSelect,
  suggestions,
  placeholder,
  inputClassName,
  disabled = false,
  type = 'text',
  inputMode = 'text',
  step,
  onKeyDown,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setHighlightedIndex(-1);
    setIsOpen(newValue.length > 0 && suggestions.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Call parent handler first
    onKeyDown?.(e);
    
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          selectSuggestion(suggestions[highlightedIndex]);
        } else {
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    onSuggestionSelect?.(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(value.length > 0 && suggestions.length > 0)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClassName}
          disabled={disabled}
          inputMode={inputMode}
          step={step}
          autoComplete="off"
        />
        {suggestions.length > 0 && isOpen && (
          <MdExpandMore className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/20 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => selectSuggestion(suggestion)}
              className={`w-full text-left px-4 py-2.5 transition-colors ${
                index === highlightedIndex
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-200 hover:bg-gray-700'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
