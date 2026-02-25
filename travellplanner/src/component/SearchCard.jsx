import { memo } from 'react';

const today = new Date().toISOString().split("T")[0];

function MobileDateField({ id, label, value, min, onChange }) {
  return (
    <div className={`date-field ${id === 'checkIn' ? 'date-field--first' : ''}`}>
      <span className="date-field-icon" aria-hidden="true">📅</span>
      <div className="date-field-inner">
        <label className="date-field-label" htmlFor={id}>{label}</label>
        <input
          id={id}
          type="date"
          value={value}
          min={min}
          onChange={onChange}
          required
          className="date-input"
          aria-label={label}
        />
      </div>
    </div>
  );
}

function SearchCard({ destination, setDestination, checkIn, setCheckIn, checkOut, setCheckOut, running, loading, onSubmit, activeHistoryId, onClear }) {
  return (
    <div className="search-card">
      <form onSubmit={onSubmit} className="search-form" role="search" aria-label="Plan a trip">
        {/* Destination */}
        <div className="search-dest">
          <span className="search-dest-icon" aria-hidden="true">🔍</span>
          <label htmlFor="destination" className="sr-only">Destination</label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination name"
            required
            className="search-input"
            aria-required="true"
          />
        </div>

        {/* Dates */}
        <div className="search-dates">
          <MobileDateField
            id="checkIn"
            label="Check-in"
            value={checkIn}
            min={today}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut && e.target.value > checkOut) setCheckOut("");
            }}
          />
          <div className="search-dates-arrow" aria-hidden="true">→</div>
          <MobileDateField
            id="checkOut"
            label="Check-out"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="search-submit-wrap">
          {activeHistoryId && (
            <button
              type="button"
              className="clear-chat-btn"
              onClick={onClear}
              aria-label="Start new plan"
              title="New Plan"
            >
              +
            </button>
          )}
          <button
            type="submit"
            disabled={running || loading}
            className="go-btn"
            aria-label={running ? "Animating" : loading ? "Planning your trip" : "Generate travel plan"}
          >
            {running ? "🚗" : loading ? "Wait..." : "Go"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default memo(SearchCard);
