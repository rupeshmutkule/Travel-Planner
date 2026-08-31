import { memo } from 'react';

function HotelCard({ hotel }) {
  if (!hotel) return null;

  return (
    <div className="hotel-card" role="region" aria-label="Recommended hotel">
      <div className="hotel-icon" aria-hidden="true">🏨</div>
      <div style={{ flex: 1 }}>
        <h4 className="hotel-eyebrow">Recommended Stay</h4>
        <p className="hotel-name">{hotel.name}</p>
        <p className="hotel-details">{hotel.area} • ⭐ {hotel.rating}</p>
      </div>
      {hotel.website && (
        <a
          href={hotel.website}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "20px",
            color: "#38bdf8",
            background: "rgba(56,189,248,0.1)",
            border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(56,189,248,0.2)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(56,189,248,0.1)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          aria-label={`Visit website for ${hotel.name}`}
          title="Visit hotel website"
        >
          🌐
        </a>
      )}
    </div>
  );
}

export default memo(HotelCard);
