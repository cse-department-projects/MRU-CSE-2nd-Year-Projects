import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building2, Warehouse as WarehouseIcon, Loader2, X } from 'lucide-react';
import { routeService } from '../../services/routeService.js';

export default function LocationSearchInput({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Search city, hub, warehouse, district...',
  label = null,
  disabled = false,
  required = false
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Sync internal query when value prop changes externally
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await routeService.searchLocations(query.trim());
        if (Array.isArray(results)) {
          setSuggestions(results);
          setIsOpen(results.length > 0);
        }
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);
  };

  const handleSelectSuggestion = (item) => {
    setQuery(item.name);
    setIsOpen(false);
    if (onChange) onChange(item.name);
    if (onSelect) onSelect(item);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    if (onChange) onChange('');
    if (onSelect) onSelect(null);
  };

  const getItemIcon = (type) => {
    if (type === 'warehouse') return <WarehouseIcon size={14} style={{ color: '#059669' }} />;
    if (type === 'hub') return <Building2 size={14} style={{ color: '#2563eb' }} />;
    return <MapPin size={14} style={{ color: '#d97706' }} />;
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--text-muted)',
            pointerEvents: 'none'
          }}
        />

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            height: '40px',
            padding: '0 36px 0 36px',
            fontSize: '0.875rem',
            background: 'var(--surface, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '8px',
            color: 'var(--text-main, #0f172a)',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
        />

        <div style={{ position: 'absolute', right: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {loading && <Loader2 size={15} className="spinner" style={{ color: 'var(--text-muted)' }} />}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px'
              }}
              title="Clear location"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.08)',
            zIndex: 1050,
            maxHeight: '260px',
            overflowY: 'auto'
          }}
        >
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSuggestion(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid #f1f5f9',
                transition: 'background 0.12s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                {getItemIcon(item.type)}
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                    {item.name}
                  </div>
                  {item.displayName && item.displayName !== item.name && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.displayName}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {item.type && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: item.type === 'warehouse' ? '#ecfdf5' : item.type === 'hub' ? '#eff6ff' : '#fef3c7',
                      color: item.type === 'warehouse' ? '#047857' : item.type === 'hub' ? '#1d4ed8' : '#b45309'
                    }}
                  >
                    {item.type}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
