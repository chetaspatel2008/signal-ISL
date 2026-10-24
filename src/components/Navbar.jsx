import React from 'react';
import { Hand, ShieldCheck, Sliders, Sparkles, Key } from 'lucide-react';
import { aiVisionService } from '../utils/aiVisionService';

export default function Navbar({ activeTab, setActiveTab, onOpenSettings, onOpenHistory, onOpenHowToSign, onOpenApiKeyModal }) {
  const isAiActive = aiVisionService.hasApiKey();

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
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(255, 255, 255, 0.15)'
        }}>
          <Hand size={18} strokeWidth={2.5} />
        </div>
        <span style={{
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'var(--text-primary)'
        }}>
          SIGNVOICE
        </span>
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
        {/* Gemini Vision API Key Button */}
        <button
          onClick={onOpenApiKeyModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '999px',
            backgroundColor: isAiActive ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${isAiActive ? 'rgba(6, 182, 212, 0.4)' : 'var(--border-subtle)'}`,
            color: isAiActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={isAiActive ? "Gemini Multimodal Vision AI is Active" : "Connect Gemini API Key for Father, Mother, and total Sign Language"}
        >
          {isAiActive ? <Sparkles size={14} color="var(--accent-cyan)" /> : <Key size={14} />}
          <span>{isAiActive ? 'Vision AI Active' : 'Connect Vision API'}</span>
        </button>

        {/* Private session badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '999px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          <ShieldCheck size={14} color="var(--accent-green)" />
          <span>Private session</span>
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

        {/* User Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-primary)'
        }}>
          G
        </div>
      </div>
    </nav>
  );
}
