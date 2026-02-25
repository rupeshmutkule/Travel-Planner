import { memo, useState, useMemo } from 'react';

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
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(showDeleteConfirm === item._id ? null : item._id); }}
                aria-label={`Options for ${item.destination}`}
                aria-expanded={showDeleteConfirm === item._id}
                aria-haspopup="true"
              >⋮</button>
              {showDeleteConfirm === item._id && (
                <div className="sidebar-dropdown" role="menu">
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
            <div className="sidebar-user-name">{user.name}</div>
            <button className="sidebar-logout-link" onClick={() => setShowLogoutModal(true)}>
              Logout {user.name.split(' ')[0]}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default memo(HistorySidebar);
