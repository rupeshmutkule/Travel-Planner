import { memo } from 'react';

const suggestions = ["Paris", "Tokyo", "Bali", "New York", "London", "Dubai"];

function SuggestionPills({ setDestination }) {
  return (
    <div className="suggestions" role="group" aria-label="Popular destinations">
      {suggestions.map((city) => (
        <button
          key={city}
          className="suggestion-pill"
          onClick={() => setDestination(city)}
          aria-label={`Set destination to ${city}`}
        >✦ {city}</button>
      ))}
    </div>
  );
}

export default memo(SuggestionPills);
