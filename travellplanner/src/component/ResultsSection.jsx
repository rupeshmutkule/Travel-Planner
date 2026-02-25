import { memo, forwardRef } from 'react';
import DayCard from './DayCard';
import HotelCard from './HotelCard';

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

const ResultsSection = forwardRef(function ResultsSection({ days, hotel, destination }, ref) {
  if (days.length === 0) return null;

  return (
    <section ref={ref} className="results-section" aria-label={`Travel plan for ${destination}`}>
      <div className="results-heading">
        <h2 className="results-title">Your Adventure in {destination}</h2>
      </div>

      <HotelCard hotel={hotel} />

      <div className="results-grid">
        {days.map((d, idx) => (
          <DayCard
            key={idx}
            day={d.day ?? idx + 1}
            date={d.date ? formatDate(d.date) : ""}
            title={d.title ?? ""}
            activities={d.activities ?? d.schedule ?? []}
          />
        ))}
      </div>
    </section>
  );
});

export default memo(ResultsSection);
