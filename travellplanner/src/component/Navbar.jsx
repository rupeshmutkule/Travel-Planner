import { memo } from 'react';

function Navbar({ user, showHistory, setShowHistory, setAuthFormData, setIsAuthOpen, setShowLogoutModal }) {
  return (
    <header>
      <nav className="navbar" aria-label="Main navigation">
        <div className="navbar-left">
          {user && (
            <button
              className="hamburger-btn"
              onClick={() => setShowHistory(!showHistory)}
              aria-label={showHistory ? "Close history sidebar" : "Open history sidebar"}
              aria-expanded={showHistory}
            >☰</button>
          )}
          <div className="navbar-logo">
            <div className="navbar-logo-icon" aria-hidden="true">✈</div>
            <span className="navbar-logo-text">Travell Planner</span>
          </div>
        </div>

        <div className="navbar-right">
          {!user ? (
            <>
              <button
                className="nav-btn"
                onClick={() => {
                  setAuthFormData(prev => ({ ...prev, isLogin: true }));
                  setIsAuthOpen(true);
                }}
              >Login</button>
              <button
                className="nav-btn nav-btn--primary"
                onClick={() => {
                  setAuthFormData(prev => ({ ...prev, isLogin: false }));
                  setIsAuthOpen(true);
                }}
              >Register</button>
            </>
          ) : (
            <button
              className="nav-btn"
              onClick={() => setShowLogoutModal(true)}
            >
              <span aria-hidden="true">👤</span>
              Logout {user.name.split(' ')[0]}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

export default memo(Navbar);
