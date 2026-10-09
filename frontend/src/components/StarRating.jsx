import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ value = 0, onChange, readOnly = false, size = 20 }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const displayRating = hoverValue || value || 0;

  const handleClick = (rating) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= displayRating;
        return (
          <button
            key={starIndex}
            type="button"
            disabled={readOnly}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => !readOnly && setHoverValue(starIndex)}
            onMouseLeave={() => !readOnly && setHoverValue(0)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: readOnly ? 'default' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFilled ? '#f59e0b' : '#374151',
              transition: 'all 0.15s ease',
              transform: !readOnly && hoverValue >= starIndex ? 'scale(1.2)' : 'scale(1)',
            }}
            title={readOnly ? `Rating: ${value}` : `Rate ${starIndex} out of 5 stars`}
          >
            <Star
              size={size}
              fill={isFilled ? '#f59e0b' : 'none'}
              strokeWidth={isFilled ? 0 : 1.5}
            />
          </button>
        );
      })}
    </div>
  );
};
