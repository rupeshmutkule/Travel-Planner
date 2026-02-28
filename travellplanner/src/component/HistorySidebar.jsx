import { memo, useState, useMemo, useEffect, useRef } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function HistorySidebar({
  showHistory, history, activeHistoryId, user,
  showDeleteConfirm, setShowDeleteConfirm,
  loadFromHistory, handleNewChat, handleUpdateHistoryStatus,
  setShowHistory, setShowDeleteModal, setShowLogoutModal
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'archived'
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside on mobile and prevent body scroll
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDeleteConfirm(null);
      }
    }

    function handleScroll() {
      setShowDeleteConfirm(null);
    }

    // Position dropdown with smart positioning for both desktop and mobile
    function positionDropdown() {
      if (dropdownRef.current) {
        const dropdown = dropdownRef.current;
        const button = dropdown.parentElement.querySelector('.sidebar-menu-btn');
        
        if (button) {
          const buttonRect = button.getBoundingClientRect();
          const dropdownHeight = dropdown.offsetHeight;
          const viewportHeight = window.innerHeight;
          
          if (window.innerWidth > 767) {
            // Desktop positioning (existing logic)
            const spaceAbove = buttonRect.top;
            
            if (spaceAbove >= dropdownHeight + 10) {
              // Position above
              dropdown.style.position = 'fixed';
              dropdown.style.top = `${buttonRect.top - dropdownHeight - 5}px`;
              dropdown.style.right = `${window.innerWidth - buttonRect.right}px`;
              dropdown.style.left = 'auto';
              dropdown.style.bottom = 'auto';
            } else {
              // Position below
              dropdown.style.position = 'fixed';
              dropdown.style.top = `${buttonRect.bottom + 5}px`;
              dropdown.style.right = `${window.innerWidth - buttonRect.right}px`;
              dropdown.style.left = 'auto';
              dropdown.style.bottom = 'auto';
            }
          } else {
            // Mobile positioning with smart up/down detection
            const spaceBelow = viewportHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;
            
            // Reset any previous inline styles
            dropdown.style.position = 'absolute';
            dropdown.style.right = '0';
            dropdown.style.left = 'auto';
            
            // Check if there's enough space below (need at least dropdown height + 20px buffer)
            if (spaceBelow >= dropdownHeight + 20) {
              // Position below (normal)
              dropdown.style.top = '100%';
              dropdown.style.bottom = 'auto';
              dropdown.style.marginTop = '5px';
              dropdown.style.marginBottom = '0';
              dropdown.classList.remove('dropdown-above');
              dropdown.classList.add('dropdown-below');
            } else if (spaceAbove >= dropdownHeight + 20) {
              // Position above
              dropdown.style.top = 'auto';
              dropdown.style.bottom = '100%';
              dropdown.style.marginTop = '0';
              dropdown.style.marginBottom = '5px';
              dropdown.classList.remove('dropdown-below');
              dropdown.classList.add('dropdown-above');
            } else {
              // Fallback: position above if both spaces are tight
              dropdown.style.top = 'auto';
              dropdown.style.bottom = '100%';
              dropdown.style.marginTop = '0';
              dropdown.style.marginBottom = '5px';
              dropdown.classList.remove('dropdown-below');
              dropdown.classList.add('dropdown-above');
            }
          }
        }
      }
    }

    if (showDeleteConfirm) {
      // Position dropdown for both desktop and mobile
      setTimeout(positionDropdown, 0);
      
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', positionDropdown);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', positionDropdown);
      };
    }
  }, [showDeleteConfirm, setShowDeleteConfirm]);

  const filteredHistory = useMemo(() => {
    let filtered = history || [];

    // Filter by Tab (Active vs Archived)
    if (activeTab === "archived") {
      filtered = filtered.filter(item => item.isArchived);
    } else {
      filtered = filtered.filter(item => !item.isArchived);
    }

    // Filter by Search Term
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.destination.toLowerCase().includes(lowerTerm)
      );
    }

    // Sort: Pinned first, then by date (assuming newest first from backend)
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0; // retain original backend sort for secondary
    });
  }, [history, activeTab, searchTerm]);
  return (
    <aside
      className={`sidebar ${showHistory ? 'sidebar--open' : ''}`}
      aria-label="Travel history"
      aria-hidden={!showHistory}
    >
      <div className="sidebar-header">
        <h2 className="sidebar-title">Past Plans</h2>
        <button
          className="sidebar-close"
          onClick={() => setShowHistory(false)}
          aria-label="Close sidebar"
        >✕</button>
      </div>

      <div className="sidebar-new-wrap">
        <input
          type="text"
          className="sidebar-search-input"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search travel plans"
        />
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab ${activeTab === 'active' ? 'sidebar-tab--active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'archived' ? 'sidebar-tab--active' : ''}`}
            onClick={() => setActiveTab('archived')}
          >
            Archived
          </button>
        </div>
        <button className="new-chat-btn" onClick={handleNewChat}>
          <span aria-hidden="true" style={{ fontSize: '18px' }}>+</span> New Chat
        </button>
      </div>

      <div className="sidebar-list" role="list" aria-label="Past travel plans">
        {filteredHistory.length > 0 ? filteredHistory.map((item) => (
          <div key={item._id} className="sidebar-item" role="listitem">
            <button
              className={`sidebar-item-btn ${activeHistoryId === item._id ? 'sidebar-item-btn--active' : ''}`}
              onClick={() => loadFromHistory(item)}
              aria-label={`Load plan for ${item.destination}`}
              aria-current={activeHistoryId === item._id ? 'true' : undefined}
            >
              <span aria-hidden="true">{item.isPinned ? '📌' : '📍'}</span>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div className="sidebar-item-dest">{item.destination}</div>
                <div className="sidebar-item-date">{formatDate(item.checkIn)}</div>
              </div>
            </button>
            <div style={{ position: 'relative' }}>
              <button
                className="sidebar-menu-btn"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setShowDeleteConfirm(showDeleteConfirm === item._id ? null : item._id); 
                }}
                aria-label={`Options for ${item.destination}`}
                aria-expanded={showDeleteConfirm === item._id}
                aria-haspopup="true"
              >⋮</button>
              {showDeleteConfirm === item._id && (
                <div 
                  ref={dropdownRef}
                  className="sidebar-dropdown" 
                  role="menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="sidebar-dropdown-btn"
                    role="menuitem"
                    onClick={() => { handleUpdateHistoryStatus(item._id, { isPinned: !item.isPinned }); setShowDeleteConfirm(null); }}
                  >
                    {item.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    className="sidebar-dropdown-btn"
                    role="menuitem"
                    onClick={() => { handleUpdateHistoryStatus(item._id, { isArchived: !item.isArchived }); setShowDeleteConfirm(null); }}
                  >
                    {item.isArchived ? 'Restore' : 'Archive'}
                  </button>
                  <button className="sidebar-dropdown-btn" role="menuitem" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                  <button className="sidebar-dropdown-btn sidebar-dropdown-btn--danger" role="menuitem" onClick={() => { setShowDeleteModal(item._id); setShowDeleteConfirm(null); }}>Remove</button>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="sidebar-empty">
            {searchTerm ? "No plans match your search." : activeTab === "archived" ? "No archived chats." : "No history yet. Start planning!"}
          </div>
        )}
      </div>

      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-avatar" aria-hidden="true">{user.name[0]}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name" title={user.name}>{user.name}</div>
            <button className="sidebar-logout-link" onClick={() => setShowLogoutModal(true)}>
              Logout
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default memo(HistorySidebar);
