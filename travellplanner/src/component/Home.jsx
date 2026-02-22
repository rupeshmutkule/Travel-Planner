import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DayCard from "./DayCard";
import Auth from "./Auth";
import TermsAndConditions from "./TermsAndConditions";

const today = new Date().toISOString().split("T")[0];

const starsData = [...Array(30)].map(() => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: `${Math.random() * 2 + 1}px`,
  opacity: Math.random() * 0.5 + 0.1,
}));

function normaliseResponse(data) {
  let hotel = null;
  let days = [];

  if (data && data.hotel) hotel = data.hotel;

  if (Array.isArray(data)) {
    days = data;
  } else if (data && Array.isArray(data.days)) {
    days = data.days;
  } else if (data && Array.isArray(data.itinerary)) {
    days = data.itinerary;
  } else {
    const candidate = data?.output ?? data?.text ?? data?.raw ?? null;
    if (typeof candidate === "string") {
      try {
        const parsed = JSON.parse(candidate);
        if (Array.isArray(parsed)) days = parsed;
        else if (Array.isArray(parsed.days)) {
          days = parsed.days;
          if (parsed.hotel) hotel = parsed.hotel;
        } else if (Array.isArray(parsed.itinerary)) days = parsed.itinerary;
      } catch { /* not JSON */ }
    }
  }

  return { hotel, days };
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function Home() {
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successUser, setSuccessUser] = useState("");
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Lifted Auth State
  const [authFormData, setAuthFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    otp: '',
    otpSent: false,
    termsAccepted: false,
    isLogin: true
  });

  const updateAuthData = (newData) => {
    setAuthFormData(prev => ({ ...prev, ...newData }));
  };

  const resultsRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.accepted) {
      setIsAuthOpen(true);
      setAuthFormData(prev => ({ ...prev, termsAccepted: true, isLogin: false }));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/history", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user, fetchHistory]);

  // No JS glowPulse needed, will use CSS animation

  const handleGo = async (e) => {
    e.preventDefault();
    if (!destination || !checkIn || !checkOut) return;

    setDays([]);
    setHotel(null);
    setRawText("");
    setError("");
    setRunning(true);
    setLoading(true);

    setTimeout(() => setRunning(false), 2500);

    try {
      const headers = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${user.token}`;

      const res = await fetch("/api/plan", {
        method: "POST",
        headers,
        body: JSON.stringify({ place: destination, checkIn, checkOut, historyId: activeHistoryId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const { hotel: h, days: d } = normaliseResponse(data);

      if (d.length > 0) {
        setDays(d);
        setHotel(h);
        if (user) fetchHistory();
      } else {
        const txt = data?.output ?? data?.text ?? data?.raw ?? JSON.stringify(data, null, 2);
        setRawText(typeof txt === "string" ? txt : JSON.stringify(txt, null, 2));
      }
    } catch (err) {
      setError("Network error: could not reach the server. Is the backend running?");
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setHistory([]);
    setShowHistory(false);
    handleNewChat();
  };

  const handleNewChat = () => {
    setDestination("");
    setCheckIn("");
    setCheckOut("");
    setDays([]);
    setHotel(null);
    setRawText("");
    setActiveHistoryId(null);
    setShowHistory(false);
  };

  const handleDeleteHistory = async (id) => {
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setHistory(history.filter((item) => item._id !== id));
        if (activeHistoryId === id) {
          handleNewChat();
        }
        setShowDeleteConfirm(null);
      }
    } catch (err) {
      console.error("Failed to delete history", err);
    }
  };

  const loadFromHistory = (item) => {
    setActiveHistoryId(item._id);
    setDestination(item.destination);
    setCheckIn(item.checkIn);
    setCheckOut(item.checkOut);
    setDays(item.plan.days);
    setHotel(item.plan.hotel);
    setRawText("");
    setShowHistory(false);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const suggestions = ["Paris", "Tokyo", "Bali", "New York", "London", "Dubai"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0d0f1a 50%, #080c12 100%)",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      display: "flex",
      position: "relative",
      overflow: "hidden",
    }}>
      {starsData.map((star, i) => (
        <div key={i} style={{
          position: "fixed", top: star.top, left: star.left,
          width: star.size, height: star.size, background: "white",
          borderRadius: "50%", opacity: star.opacity, pointerEvents: "none",
        }} />
      ))}

      {/* History Sidebar */}
      <div style={{
        width: showHistory ? (isMobile ? "100vw" : "300px") : "0",
        minWidth: showHistory ? (isMobile ? "100vw" : "300px") : "0",
        height: "100vh",
        background: "rgba(10, 10, 15, 0.98)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 20,
        backdropFilter: "blur(20px)",
        position: isMobile && showHistory ? "fixed" : "relative",
        top: 0, left: 0,
      }}>
        <div style={{ padding: "30px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>Past Plans</h3>
          {isMobile && (
            <button onClick={() => setShowHistory(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "22px", cursor: "pointer" }}>✕</button>
          )}
        </div>

        <div style={{ padding: "15px 10px" }}>
          <button
            onClick={handleNewChat}
            style={{
              width: "100%", padding: "12px", borderRadius: "12px",
              background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.2)",
              color: "#38bdf8", cursor: "pointer", fontSize: "14px", fontWeight: "600",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "all 0.3s ease"
            }}
          >
            <span style={{ fontSize: "18px" }}>+</span> New Chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          {history.length > 0 ? history.map((item, idx) => (
            <div key={idx} style={{ width: "100%", padding: "5px", position: "relative", display: "flex", alignItems: "center", gap: "5px" }}>
              <button
                onClick={() => loadFromHistory(item)}
                style={{
                  flex: 1, padding: "12px 15px", textAlign: "left",
                  background: activeHistoryId === item._id ? "rgba(255,255,255,0.08)" : "transparent",
                  border: "none", color: "rgba(255,255,255,0.7)",
                  fontSize: "13px", cursor: "pointer", borderRadius: "10px",
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: "10px", overflow: "hidden",
                }}
              >
                <span style={{ fontSize: "16px" }}>📍</span>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <div style={{ fontWeight: "600", color: "#fff" }}>{item.destination}</div>
                  <div style={{ fontSize: "11px", opacity: 0.5 }}>{formatDate(item.checkIn)}</div>
                </div>
              </button>
              <div style={{ position: "relative" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(showDeleteConfirm === item._id ? null : item._id); }}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", padding: "10px", cursor: "pointer", fontSize: "18px" }}
                >⋮</button>
                {showDeleteConfirm === item._id && (
                  <div style={{ position: "absolute", right: "0", top: "40px", background: "#1a1b26", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "5px", zIndex: 100, width: "120px", boxShadow: "0 10px 20px rgba(0,0,0,0.5)" }}>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      style={{ width: "100%", padding: "8px", background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "13px", cursor: "pointer", textAlign: "left", borderRadius: "4px" }}
                    >Cancel</button>
                    <button
                      onClick={() => { setShowDeleteModal(item._id); setShowDeleteConfirm(null); }}
                      style={{ width: "100%", padding: "8px", background: "none", border: "none", color: "#ef4444", fontSize: "13px", cursor: "pointer", textAlign: "left", borderRadius: "4px" }}
                    >Remove</button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div style={{ padding: "20px", color: "rgba(255,255,255,0.3)", fontSize: "13px", textAlign: "center" }}>No history yet. Start planning!</div>
          )}
        </div>
        {user && (
          <div style={{ padding: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #38bdf8, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px" }}>{user.name[0]}</div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ color: "#fff", fontSize: "13px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <button onClick={() => setShowLogoutModal(true)} style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "11px", cursor: "pointer", padding: 0 }}>Logout {user.name.split(' ')[0]}</button>
            </div>
          </div>
        )}
      </div>

      {/* Main scroll area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "-20%", right: "-10%",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
          animation: "ambientPulse 6s ease-in-out infinite",
        }} />

        {/* Navbar */}
        <nav style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: isMobile ? "14px 16px" : "20px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(10, 10, 20, 0.95)",
          backdropFilter: "blur(20px)",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 4px 30px rgba(0,0,0,0.3)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {user && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "20px", padding: "5px", opacity: 0.7 }}
              >☰</button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "32px", height: "32px",
                background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: "900", color: "white",
                boxShadow: "0 0 20px rgba(56,189,248,0.3)",
              }}>✈</div>
              <span style={{
                fontSize: isMobile ? "15px" : "18px", fontWeight: "600",
                background: "linear-gradient(90deg, #e2e8f0, #94a3b8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "0.02em",
              }}>Travell Planner</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {!user ? (
              <>
                <button
                  onClick={() => {
                    setAuthFormData(prev => ({ ...prev, isLogin: true }));
                    setIsAuthOpen(true);
                  }}
                  style={navButtonStyle(isMobile)}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setAuthFormData(prev => ({ ...prev, isLogin: false }));
                    setIsAuthOpen(true);
                  }}
                  style={{
                    ...navButtonStyle(isMobile),
                    background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                    border: "none",
                    color: "white",
                  }}
                >
                  Register
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogoutModal(true)}
                style={navButtonStyle(isMobile)}
              >
                <span style={{ fontSize: "14px" }}>👤</span>
                Logout {user.name.split(' ')[0]}
              </button>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main style={{
          padding: isMobile ? "32px 16px 40px" : "60px 20px",
          display: "flex", flexDirection: "column", alignItems: "center",
          position: "relative", zIndex: 5,
        }}>
          {/* Headline */}
          <div style={{ textAlign: "center", marginBottom: isMobile ? "32px" : "50px" }}>
            <p style={{
              fontSize: "12px", letterSpacing: "0.25em", color: "#38bdf8",
              textTransform: "uppercase", marginBottom: "12px",
            }}>Your journey planning starts here</p>
            <h1 style={{
              fontSize: isMobile ? "2.2rem" : "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: "300", lineHeight: "1.1", margin: 0,
              background: "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}>
              Where to{" "}
              <em style={{
                fontStyle: "italic",
                background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>next?</em>
            </h1>
          </div>

          {/* Search Card — stacks vertically on mobile */}
          <div style={{
            width: "100%",
            maxWidth: isMobile ? "360px" : "860px",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: isMobile ? "12px" : "8px",
            boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}>
            <form onSubmit={handleGo} style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              flexWrap: isMobile ? "nowrap" : "wrap",
              gap: isMobile ? "0" : "4px",
            }}>
              {/* Destination */}
              <div style={{
                flex: "2 1 240px",
                display: "flex", alignItems: "center", gap: "10px",
                padding: isMobile ? "14px 16px" : "18px 20px",
                borderBottom: isMobile ? "1px solid rgba(255,255,255,0.06)" : "none",
                borderRight: !isMobile ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <span style={{ fontSize: "16px", opacity: 0.5 }}>🔍</span>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Destination name"
                  required
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    color: "#f1f5f9", fontSize: "15px", width: "100%",
                    fontFamily: "Georgia, serif", caretColor: "#38bdf8",
                  }}
                />
              </div>

              {/* Dates row: side-by-side on mobile too */}
              <div style={{
                display: "flex",
                flexDirection: "row",
                flex: isMobile ? "none" : "2 1 320px",
              }}>
                <MobileDateField
                  label="Check-in"
                  value={checkIn}
                  min={today}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (checkOut && e.target.value > checkOut) setCheckOut("");
                  }}
                  isMobile={isMobile}
                  isFirst
                />

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 4px", color: "rgba(255,255,255,0.2)", fontSize: "14px",
                }}>→</div>

                <MobileDateField
                  label="Check-out"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  isMobile={isMobile}
                />
              </div>

              {/* Go button */}
              <div style={{
                padding: isMobile ? "10px 0 0" : "4px",
                display: "flex", alignItems: "stretch",
                minWidth: isMobile ? "auto" : "90px",
              }}>
                <button
                  type="submit"
                  disabled={running || loading}
                  style={{
                    flex: 1,
                    width: isMobile ? "100%" : undefined,
                    background: running || loading
                      ? "linear-gradient(135deg, #0ea5e9, #6366f1)"
                      : "linear-gradient(135deg, #38bdf8, #6366f1)",
                    border: "none",
                    borderRadius: isMobile ? "12px" : "16px",
                    color: "white",
                    fontSize: isMobile ? "15px" : "15px",
                    fontWeight: "700",
                    cursor: running || loading ? "wait" : "pointer",
                    padding: isMobile ? "14px" : "16px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {running ? "🚗" : loading ? "Wait..." : "Go"}
                </button>
              </div>
            </form>
          </div>

          {/* Suggestion pills */}
          <div style={{
            marginTop: "28px", display: "flex", flexWrap: "wrap",
            justifyContent: "center", gap: "8px",
            maxWidth: isMobile ? "360px" : "700px", width: "100%",
          }}>
            {suggestions.map((city) => (
              <button
                key={city}
                onClick={() => setDestination(city)}
                style={{
                  padding: isMobile ? "7px 14px" : "8px 18px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "30px",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: isMobile ? "12px" : "13px",
                  cursor: "pointer",
                }}
              >✦ {city}</button>
            ))}
          </div>

          {/* Loading */}
          {loading && days.length === 0 && !error && (
            <div style={{ marginTop: "60px", textAlign: "center" }}>
              <div style={{ width: "40px", height: "40px", border: "3px solid #38bdf8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
              <p style={{ color: "rgba(148,163,184,0.7)" }}>Planning your trip to <strong style={{ color: "#38bdf8" }}>{destination}</strong>…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: "40px", background: "rgba(239,68,68,0.1)", color: "#fca5a5", padding: "20px", borderRadius: "16px", border: "1px solid rgba(239,68,68,0.2)", maxWidth: isMobile ? "360px" : "860px", width: "100%" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Results */}
          {days.length > 0 && (
            <div ref={resultsRef} style={{ marginTop: "70px", width: "100%", maxWidth: "960px" }}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h2 style={{ fontSize: isMobile ? "1.5rem" : "2rem", color: "#fff", fontWeight: "300" }}>
                  Your Adventure in {destination}
                </h2>
              </div>

              {hotel && (
                <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "20px", padding: "20px", marginBottom: "30px", display: "flex", gap: "16px", margin: isMobile ? "0 4px 30px" : "0 0 30px" }}>
                  <div style={{ fontSize: "28px" }}>🏨</div>
                  <div>
                    <h4 style={{ color: "#38bdf8", fontSize: "11px", textTransform: "uppercase" }}>Recommended Stay</h4>
                    <p style={{ color: "#fff", fontSize: isMobile ? "16px" : "18px", fontWeight: "600" }}>{hotel.name}</p>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>{hotel.area} • ⭐ {hotel.rating}</p>
                  </div>
                </div>
              )}

              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(420px, 1fr))",
                gap: "20px",
                padding: isMobile ? "0 4px" : "0",
              }}>
                {days.map((d, idx) => (
                  <DayCard
                    key={idx}
                    day={d.day ?? idx + 1}
                    date={d.date ? formatDate(d.date) : ""}
                    title={d.title ?? ""}
                    activities={d.activities ?? d.schedule ?? []}
                    isFirst={idx === 0}
                    hotel={idx === 0 ? hotel : null}
                  />
                ))}
              </div>
            </div>
          )}

          {rawText && !loading && (
            <div ref={resultsRef} style={{
              marginTop: "60px", maxWidth: "860px", width: "100%",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px", padding: isMobile ? "20px 18px" : "28px 32px",
              color: "rgba(226,232,240,0.8)", fontSize: "14px", lineHeight: "1.8",
              fontFamily: "Georgia, serif", whiteSpace: "pre-wrap",
            }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#38bdf8", textTransform: "uppercase", marginBottom: "14px" }}>AI Response</p>
              {rawText}
            </div>
          )}
        </main>

        {/* Custom Delete Confirmation Modal */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: '#1a1b26', border: '1px solid rgba(255,255,255,0.1)',
              padding: '30px', borderRadius: '24px', maxWidth: '340px', width: '90%',
              textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>🗑️</div>
              <h3 style={{ color: '#fff', marginBottom: '10px', fontSize: '20px' }}>Delete Trip?</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '30px' }}>
                This will permanently remove your travel plan to {history.find(h => h._id === showDeleteModal)?.destination}.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >Keep it</button>
                <button
                  onClick={() => { handleDeleteHistory(showDeleteModal); setShowDeleteModal(null); }}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Logout Confirmation Modal */}
        {showLogoutModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: '#1a1b26', border: '1px solid rgba(255,255,255,0.1)',
              padding: '30px', borderRadius: '24px', maxWidth: '340px', width: '90%',
              textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>👋</div>
              <h3 style={{ color: '#fff', marginBottom: '10px', fontSize: '20px' }}>Signing out?</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '30px' }}>
                Are you sure you want to log out of your account?
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >Stay logged in</button>
                <button
                  onClick={() => { handleLogout(); setShowLogoutModal(false); }}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#38bdf8', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >Logout</button>
              </div>
            </div>
          </div>
        )}

        <Auth
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={async (u) => {
            setUser(u);
            setSuccessUser(u.name);
            setShowSuccessPopup(true);

            // Save current plan to history if it exists
            if (days.length > 0) {
              try {
                await fetch("/api/history/save", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${u.token}`,
                  },
                  body: JSON.stringify({
                    destination,
                    checkIn,
                    checkOut,
                    plan: { hotel, days },
                  }),
                });
                fetchHistory();
              } catch (err) {
                console.error("Failed to save plan after login", err);
              }
            }

            setTimeout(() => setShowSuccessPopup(false), 3000);
            setAuthFormData({ // Clear state after success
              name: '', email: '', mobileNumber: '', password: '', confirmPassword: '', otp: '', otpSent: false, termsAccepted: false, isLogin: true
            });
          }}
          authFormData={authFormData}
          updateAuthData={updateAuthData}
          onOpenTerms={() => {
            setIsAuthOpen(false);
            setIsTermsOpen(true);
          }}
        />

        <TermsAndConditions
          isOpen={isTermsOpen}
          onClose={() => {
            setIsTermsOpen(false);
            setIsAuthOpen(true);
          }}
          onAccept={() => {
            setIsTermsOpen(false);
            setAuthFormData(prev => ({ ...prev, termsAccepted: true }));
            setIsAuthOpen(true);
          }}
        />

        {/* UPI Style Success Popup */}
        {showSuccessPopup && (
          <div style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(34, 197, 94, 0.3)',
            padding: '16px 24px', borderRadius: '16px', zIndex: 2000,
            display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            animation: 'slideDown 0.5s ease'
          }}>
            <div style={{
              width: '24px', height: '24px', background: '#22c55e', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>✓</div>
            <div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>Welcome, {successUser}!</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Registration Successful</div>
            </div>
          </div>
        )}

        <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ambientPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.4; cursor: pointer; }
        @media (max-width: 767px) {
          input[type="date"] { font-size: 13px; }
        }
      `}</style>
      </div>
    </div>
  );
}

const navButtonStyle = (isMobile) => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: isMobile ? "8px 14px" : "10px 22px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "40px",
  color: "#e2e8f0",
  fontSize: isMobile ? "12px" : "14px",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.3s ease",
  backdropFilter: "blur(10px)",
});

function MobileDateField({ label, value, min, onChange, isMobile, isFirst }) {
  return (
    <div style={{
      flex: 1,
      padding: isMobile ? "14px 10px" : "18px 16px",
      borderRight: isFirst ? "1px solid rgba(255,255,255,0.06)" : "none",
      borderBottom: isMobile ? "1px solid rgba(255,255,255,0.06)" : "none",
      display: "flex", alignItems: "center", gap: "8px",
    }}>
      <span style={{ opacity: 0.4, fontSize: "14px" }}>📅</span>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "9px", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
        <input
          type="date" value={value} min={min} onChange={onChange} required
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "#fff", fontSize: isMobile ? "12px" : "14px",
            cursor: "pointer", fontFamily: "inherit",
            maxWidth: isMobile ? "120px" : "none",
          }}
        />
      </div>
    </div>
  );
}
