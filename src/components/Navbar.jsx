import React, { useState } from 'react';
import { ShieldCheck, Sliders, Home, LogOut, User } from 'lucide-react';
import BridgeLogo from './BridgeLogo';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenHistory,
  onOpenHowToSign,
  user,
  onNavigateToLanding,
  onLogout
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: '64px',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-main)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Logo & Home Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div onClick={onNavigateToLanding} style={{ cursor: 'pointer' }} title="Return to Landing Page">
          <BridgeLogo size={24} fontSize="20px" />
        </div>

        <button
          onClick={onNavigateToLanding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'color 0.2s, background-color 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Home size={14} />
          <span>Home</span>
        </button>
      </div>

      {/* Center Nav Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', height: '100%' }}>
        {[
          { id: 'translator', label: 'Translator' },
          { id: 'history', label: 'Session history' },
          { id: 'how-to-sign', label: 'How to sign' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'history') onOpenHistory();
                if (tab.id === 'how-to-sign') onOpenHowToSign();
              }}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                height: '100%',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s ease'
              }}
            >
              {tab.label}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: '#ffffff',
                  borderRadius: '2px 2px 0 0'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* On-device Engine Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '999px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#10b981',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)'
          }}
          title="Bridge Vision Engine running 100% on-device in WebAssembly"
        >
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981',
            display: 'inline-block'
          }} />
          <span>Bridge Engine Active</span>
        </div>

        {/* Private session badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: '999px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          <ShieldCheck size={14} color="var(--accent-green)" />
          <span>Private</span>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Session & Camera Settings"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s, background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <Sliders size={18} />
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            title={user ? `${user.name} (${user.email})` : 'Account profile'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: user ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 600,
              color: user ? '#ffffff' : 'var(--text-primary)',
              cursor: 'pointer',
              boxShadow: user ? '0 0 10px rgba(6, 182, 212, 0.3)' : 'none'
            }}
          >
            {user ? (user.avatar || user.name?.charAt(0).toUpperCase()) : 'G'}
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '42px',
              right: 0,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '8px',
              minWidth: '190px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)',
              zIndex: 110,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.name || 'Guest User'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'guest@bridge.live'}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigateToLanding();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Home size={14} color="var(--accent-cyan)" />
                <span>Landing Page</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  color: '#f87171',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
