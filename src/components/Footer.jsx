import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import BridgeLogo from './BridgeLogo';

export default function Footer({ onOpenHowToSign }) {
  return (
    <footer style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 0 16px 0',
      borderTop: '1px solid var(--border-subtle)',
      fontSize: '12px',
      color: 'var(--text-muted)',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BridgeLogo size={18} fontSize="14px" />
        <span style={{ color: 'var(--border-strong)' }}>/</span>
        <span style={{ color: 'var(--text-secondary)' }}>Connection, without the barrier.</span>
      </div>

      {/* Center */}
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        Private on-device inference • Indian Sign Language (ISL) & ASL
      </div>

      {/* Right */}
      <div>
        <button
          onClick={onOpenHowToSign}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <span>Gestures Guide</span>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </footer>
  );
}
