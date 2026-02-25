import { useReducer, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* ── Critical-path components (needed on first paint) ──────────────── */
import Navbar from "./Navbar";
import SearchCard from "./SearchCard";
import SuggestionPills from "./SuggestionPills";
import SuccessPopup from "./SuccessPopup";

/* ── Lazy-loaded components (not needed on first paint) ────────────── */
/* Code-splitting: Auth, Terms, ConfirmModal, HistorySidebar, and
   ResultsSection are only rendered conditionally. Loading them lazily
   removes their JS from the initial bundle and reduces Time-to-Interactive. */
const Auth = lazy(() => import("./Auth"));
const TermsAndConditions = lazy(() => import("./TermsAndConditions"));
const ConfirmModal = lazy(() => import("./ConfirmModal"));
const HistorySidebar = lazy(() => import("./HistorySidebar"));
const ResultsSection = lazy(() => import("./ResultsSection"));

/* ── Pre-computed stars (6 instead of 12 for mobile perf) ──────── */
const starsData = [...Array(6)].map(() => ({
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

export default function Home() {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...(typeof newState === 'function' ? newState(state) : newState) }),
    {
      destination: "", checkIn: "", checkOut: "",
      running: false, loading: false, error: "",
      days: [], hotel: null, rawText: "",
      user: null, history: [], activeHistoryId: null,
      isAuthOpen: false, showHistory: false, showDeleteConfirm: null,
      showDeleteModal: null, showLogoutModal: false, showSuccessPopup: false,
      successUser: "", isTermsOpen: false, isDeferredLoaded: false,
      authFormData: {
        name: '', email: '', mobileNumber: '', password: '', confirmPassword: '',
        otp: '', otpSent: false, termsAccepted: false, isLogin: true
      }
    }
  );

  const {
    destination, checkIn, checkOut, running, loading, error, days, hotel, rawText,
    user, history, activeHistoryId, isAuthOpen, showHistory, showDeleteConfirm,
    showDeleteModal, showLogoutModal, showSuccessPopup, successUser, isTermsOpen,
    authFormData, isDeferredLoaded
  } = state;

  const updateAuthData = useCallback((newData) => {
    setState(prev => ({ authFormData: { ...prev.authFormData, ...newData } }));
  }, []);

  const resultsRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setState({ user: JSON.parse(savedUser) });

    // Defer non-critical renders using requestIdleCallback
    const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 50));
    const id = schedule(() => setState({ isDeferredLoaded: true }));
    
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.accepted) {
      setState(prev => ({
        isAuthOpen: true,
        authFormData: { ...prev.authFormData, termsAccepted: true, isLogin: false }
      }));
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
        setState({ history: data });
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  }, [user]);

  /* Defer history fetch — use requestIdleCallback so it doesn't block
     first paint or LCP. Falls back to setTimeout on unsupported browsers. */
  useEffect(() => {
    if (!user) return;
    const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    const id = schedule(() => fetchHistory());
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [user, fetchHistory]);

  const handleGo = async (e) => {
    e.preventDefault();
    if (!destination || !checkIn || !checkOut) return;

    setState({ days: [], hotel: null, rawText: "", error: "", running: true, loading: true });
    setTimeout(() => setState({ running: false }), 2500);

    try {
      const headers = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${user.token}`;

      const res = await fetch("/api/plan", {
        method: "POST", headers,
        body: JSON.stringify({ place: destination, checkIn, checkOut, historyId: activeHistoryId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setState({ error: data.error || "Something went wrong. Please try again.", loading: false });
        return;
      }

      const { hotel: h, days: d } = normaliseResponse(data);
      if (d.length > 0) {
        setState({ days: d, hotel: h });
        if (user) fetchHistory();
      } else {
        const txt = data?.output ?? data?.text ?? data?.raw ?? JSON.stringify(data, null, 2);
        setState({ rawText: typeof txt === "string" ? txt : JSON.stringify(txt, null, 2) });
      }
    } catch (err) {
      setState({ error: "Network error: could not reach the server. Is the backend running?" });
      console.error(err);
    } finally {
      setState({ loading: false });
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
    setState({
      user: null, history: [], showHistory: false, destination: "", checkIn: "",
      checkOut: "", days: [], hotel: null, rawText: "", activeHistoryId: null
    });
  }, []);

  const handleNewChat = useCallback(() => {
    setState({
      destination: "", checkIn: "", checkOut: "", days: [], hotel: null,
      rawText: "", activeHistoryId: null, showHistory: false
    });
  }, []);

  const handleDeleteHistory = useCallback(async (id) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setState(prev => ({
          history: prev.history.filter((item) => item._id !== id),
          activeHistoryId: prev.activeHistoryId === id ? null : prev.activeHistoryId,
          showDeleteConfirm: null
        }));
      }
    } catch (err) {
      console.error("Failed to delete history", err);
    }
  }, [user]);

  const handleUpdateHistoryStatus = useCallback(async (id, updates) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedItem = await res.json();
        setState(prev => ({
          history: prev.history.map(item => item._id === id ? updatedItem : item)
        }));
      }
    } catch (err) {
      console.error("Failed to update history", err);
    }
  }, [user]);

  const loadFromHistory = useCallback((item) => {
    setState({
      activeHistoryId: item._id, destination: item.destination, checkIn: item.checkIn,
      checkOut: item.checkOut, days: item.plan.days, hotel: item.plan.hotel,
      rawText: "", showHistory: false
    });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  /* ── Computed flags for conditional lazy renders ────────────────── */
  const hasResults = days.length > 0;
  const needsModal = !!showDeleteModal || showLogoutModal;

  return (
    <div className="app-layout">
      {/* Decorative stars — deferred and reduced for mobile perf */}
      {isDeferredLoaded && starsData.map((star, i) => (
        <div key={i} className="star" aria-hidden="true" style={{
          top: star.top, left: star.left,
          width: star.size, height: star.size, opacity: star.opacity,
        }} />
      ))}

      {/* History Sidebar — lazy, only rendered when user is logged in */}
      {user && isDeferredLoaded && (
        <Suspense fallback={null}>
          <HistorySidebar
            showHistory={showHistory}
            history={history}
            activeHistoryId={activeHistoryId}
            user={user}
            showDeleteConfirm={showDeleteConfirm}
            setShowDeleteConfirm={(v) => setState({ showDeleteConfirm: v })}
            loadFromHistory={loadFromHistory}
            handleNewChat={handleNewChat}
            handleUpdateHistoryStatus={handleUpdateHistoryStatus}
            setShowHistory={(v) => setState({ showHistory: v })}
            setShowDeleteModal={(v) => setState({ showDeleteModal: v })}
            setShowLogoutModal={(v) => setState({ showLogoutModal: v })}
          />
        </Suspense>
      )}

      {/* Main scroll area */}
      <div className="main-scroll-area">
        <div className="ambient-glow" aria-hidden="true" />

        <Navbar
          user={user}
          showHistory={showHistory}
          setShowHistory={(v) => setState({ showHistory: v })}
          setAuthFormData={(v) => setState(prev => ({ authFormData: typeof v === 'function' ? v(prev.authFormData) : v }))}
          setIsAuthOpen={(v) => setState({ isAuthOpen: v })}
          setShowLogoutModal={(v) => setState({ showLogoutModal: v })}
        />

        <main className="main-content">
          {/* Headline — LCP element. No blocking JS before this. */}
          <div className="headline">
            <p className="headline-eyebrow">Your journey planning starts here</p>
            <h1 className="headline-title">
              Where to <em className="headline-accent">next?</em>
            </h1>
          </div>

          {/* Search — critical path, loaded eagerly */}
          <SearchCard
            destination={destination} setDestination={(v) => setState({ destination: v })}
            checkIn={checkIn} setCheckIn={(v) => setState({ checkIn: v })}
            checkOut={checkOut} setCheckOut={(v) => setState({ checkOut: v })}
            running={running} loading={loading}
            onSubmit={handleGo}
            activeHistoryId={activeHistoryId}
            onClear={handleNewChat}
          />

          {/* Suggestions — lightweight, but deferred to prioritize LCP */}
          {isDeferredLoaded && <SuggestionPills setDestination={(v) => setState({ destination: v })} />}

          {/* Loading spinner */}
          {loading && days.length === 0 && !error && (
            <div className="loading-section" role="status" aria-live="polite">
              <div className="spinner" aria-hidden="true" />
              <p className="loading-text">
                Planning your trip to <strong className="loading-dest">{destination}</strong>…
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error-box" role="alert">⚠️ {error}</div>
          )}

          {/* Results — lazy-loaded, only when data exists */}
          {hasResults && (
            <Suspense fallback={<div className="loading-section"><div className="spinner" /></div>}>
              <ResultsSection ref={resultsRef} days={days} hotel={hotel} destination={destination} />
            </Suspense>
          )}

          {/* Raw text fallback */}
          {rawText && !loading && (
            <div ref={resultsRef} className="raw-text-box">
              <p className="raw-text-label">AI Response</p>
              {rawText}
            </div>
          )}
        </main>

        {/* Modals — all lazy-loaded, only mounted when needed */}
        {needsModal && isDeferredLoaded && (
          <Suspense fallback={null}>
            {!!showDeleteModal && (
              <ConfirmModal
                isOpen
                icon="🗑️"
                title="Delete Trip?"
                description={`This will permanently remove your travel plan to ${history.find(h => h._id === showDeleteModal)?.destination || 'this destination'}.`}
                cancelLabel="Keep it"
                confirmLabel="Delete"
                confirmVariant="danger"
                onCancel={() => setState({ showDeleteModal: null })}
                onConfirm={() => { handleDeleteHistory(showDeleteModal); setState({ showDeleteModal: null }); }}
              />
            )}
            {showLogoutModal && (
              <ConfirmModal
                isOpen
                icon="👋"
                title="Signing out?"
                description="Are you sure you want to log out of your account?"
                cancelLabel="Stay logged in"
                confirmLabel="Logout"
                confirmVariant="primary"
                onCancel={() => setState({ showLogoutModal: false })}
                onConfirm={() => { handleLogout(); setState({ showLogoutModal: false }); }}
              />
            )}
          </Suspense>
        )}

        {/* Auth — lazy, only loaded when user clicks Login/Register */}
        {isAuthOpen && (
          <Suspense fallback={null}>
            <Auth
              isOpen={isAuthOpen}
              onClose={() => setState({ isAuthOpen: false })}
              onAuthSuccess={async (u) => {
                setState({ user: u, successUser: u.name, showSuccessPopup: true });

                if (days.length > 0) {
                  try {
                    await fetch("/api/history/save", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${u.token}` },
                      body: JSON.stringify({ destination, checkIn, checkOut, plan: { hotel, days } }),
                    });
                    fetchHistory();
                  } catch (err) {
                    console.error("Failed to save plan after login", err);
                  }
                }

                setTimeout(() => setState({ showSuccessPopup: false }), 3000);
                setState({
                  authFormData: {
                    name: '', email: '', mobileNumber: '', password: '', confirmPassword: '',
                    otp: '', otpSent: false, termsAccepted: false, isLogin: true
                  }
                });
              }}
              authFormData={authFormData}
              updateAuthData={updateAuthData}
              onOpenTerms={() => setState({ isAuthOpen: false, isTermsOpen: true })}
            />
          </Suspense>
        )}

        {/* Terms — lazy, only loaded when user clicks T&C link */}
        {isTermsOpen && (
          <Suspense fallback={null}>
            <TermsAndConditions
              isOpen={isTermsOpen}
              onClose={() => setState({ isTermsOpen: false, isAuthOpen: true })}
              onAccept={() => {
                setState(prev => ({
                  isTermsOpen: false,
                  authFormData: { ...prev.authFormData, termsAccepted: true },
                  isAuthOpen: true
                }));
              }}
            />
          </Suspense>
        )}

        {/* Success Toast — tiny, stays eager */}
        <SuccessPopup show={showSuccessPopup} userName={successUser} />
      </div>
    </div>
  );
}
