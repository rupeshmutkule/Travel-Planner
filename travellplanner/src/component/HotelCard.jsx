import { memo } from 'react';

function HotelCard({ hotel }) {
  if (!hotel) return null;

  return (
    <div className="hotel-card" role="region" aria-label="Recommended hotel">
      <div className="hotel-icon" aria-hidden="true">🏨</div>
      <div>
        <h4 className="hotel-eyebrow">Recommended Stay</h4>
        <p className="hotel-name">{hotel.name}</p>
        <p className="hotel-details">{hotel.area} • ⭐ {hotel.rating}</p>
      </div>
    </div>
  );
}

export default memo(HotelCard);
