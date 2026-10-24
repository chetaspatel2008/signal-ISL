import React from 'react';

export default function BridgeLogo({ size = 24, color = '#ffffff', withText = true, fontSize = '20px' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', cursor: 'pointer' }}>
      {/* Bridge geometric architectural mark (2 uprights connected by smooth arch) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M4 19V9C4 6.23858 6.23858 4 9 4H15C17.7614 4 20 6.23858 20 9V19"
          stroke={color}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M9 19V11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11V19"
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>

      {withText && (
        <span style={{
          fontSize: fontSize,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: color,
          fontFamily: 'var(--font-sans)',
          lineHeight: 1
        }}>
          bridge
        </span>
      )}
    </div>
  );
}
