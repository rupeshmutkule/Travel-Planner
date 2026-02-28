export default function DayCard({ day, date, title, activities = [] }) {
  // Normalize activities so UI always receives objects
  const normalizedActivities = activities.map((act) => {
    if (typeof act === "string") {
      return { emoji: "📍", title: act, time: "", description: "", website: "" };
    }
    return {
      emoji: act.emoji || "📍",
      title: act.title || act.name || "Activity",
      time: act.time || "",
      description: act.description || act.details || "",
      website: act.website || "",
    };
  });

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "20px",
        padding: "28px 30px",
        backdropFilter: "blur(30px)",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 30px 80px rgba(0,0,0,0.5), 0 0 30px rgba(56,189,248,0.08) inset";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset";
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, #38bdf8, #6366f1)",
          borderRadius: "20px 20px 0 0",
        }}
      />

      {/* Day header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "16px",
        }}
      >
        {/* Day number badge */}
        <div
          style={{
            width: "46px",
            height: "46px",
            background: "linear-gradient(135deg, #38bdf8, #6366f1)",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            fontSize: "15px",
            color: "white",
            boxShadow: "0 0 20px rgba(56,189,248,0.35)",
            flexShrink: 0,
          }}
        >
          {day}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#38bdf8",
              marginBottom: "1px",
              fontFamily: "Georgia, serif",
            }}
          >
            Day {day}
            {date && (
              <span style={{
                marginLeft: "10px",
                fontSize: "10px",
                color: "rgba(148,163,184,0.7)",
                textTransform: "none",
                letterSpacing: "0.05em",
              }}>
                · {date}
              </span>
            )}
          </div>
          {title && (
            <div
              style={{
                fontSize: "15px",
                color: "#e2e8f0",
                fontWeight: "600",
                fontFamily: "Georgia, serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: "rgba(255,255,255,0.06)",
          marginBottom: "18px",
        }}
      />

      {/* Activities */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {normalizedActivities.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
            No activities listed.
          </p>
        ) : (
          normalizedActivities.map((act, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                padding: "12px 14px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(56,189,248,0.06)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
              }
            >
              {/* Emoji */}
              <div
                style={{
                  fontSize: "20px",
                  minWidth: "28px",
                  textAlign: "center",
                  marginTop: "2px",
                }}
              >
                {act.emoji}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Title row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: act.description ? "5px" : 0,
                    flexWrap: "wrap",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      color: "#f1f5f9",
                      fontSize: "13.5px",
                      fontWeight: "600",
                      fontFamily: "Georgia, serif",
                      lineHeight: "1.4",
                      flex: 1,
                    }}
                  >
                    {act.title}
                  </span>

                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {act.time && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#38bdf8",
                          background: "rgba(56,189,248,0.1)",
                          border: "1px solid rgba(56,189,248,0.2)",
                          borderRadius: "20px",
                          padding: "2px 9px",
                          letterSpacing: "0.04em",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {act.time}
                      </span>
                    )}
                    
                    {act.website && (
                      <a
                        href={act.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "16px",
                          color: "#38bdf8",
                          background: "rgba(56,189,248,0.1)",
                          border: "1px solid rgba(56,189,248,0.2)",
                          borderRadius: "50%",
                          width: "26px",
                          height: "26px",
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
                        aria-label={`Visit website for ${act.title}`}
                        title="Visit website"
                      >
                        🌐
                      </a>
                    )}
                  </div>
                </div>

                {act.description && (
                  <p
                    style={{
                      color: "rgba(148,163,184,0.75)",
                      fontSize: "12.5px",
                      lineHeight: "1.55",
                      margin: 0,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {act.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}