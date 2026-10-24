import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertCircle, Eye, EyeOff, Sparkles, ExternalLink } from 'lucide-react';
import { aiVisionService } from '../utils/aiVisionService';

export default function ApiKeyModal({ isOpen, onClose, onApiKeySaved }) {
  const [apiKeyInput, setApiKeyInput] = useState(aiVisionService.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!apiKeyInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid API key.' });
      return;
    }

    setTesting(true);
    setStatusMessage(null);

    try {
      await aiVisionService.testConnection(apiKeyInput.trim());
      aiVisionService.setApiKey(apiKeyInput.trim());
      setStatusMessage({
        type: 'success',
        text: 'API Key verified successfully! Multimodal Vision AI is now active.'
      });
      if (onApiKeySaved) onApiKeySaved(apiKeyInput.trim());
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Verification failed. Please check your key and try again.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRemoveKey = () => {
    aiVisionService.setApiKey('');
    setApiKeyInput('');
    setStatusMessage({ type: 'success', text: 'API Key removed. Switched to on-device gesture classifier.' });
    if (onApiKeySaved) onApiKeySaved('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-strong)',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}>
              <Key size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Gemini Vision AI Engine
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Unlock 100% total sign language recognition (Father, Mother, Sentences)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            color: 'var(--text-primary)',
            lineHeight: 1.4
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
              <Sparkles size={15} />
              <span>Full Multimodal Sign Language Interpreter</span>
            </div>
            With Gemini 2.0 Flash Vision, the camera directly detects complex signs like <strong>Father</strong> (forehead gesture), <strong>Mother</strong> (chin gesture), <strong>Brother</strong>, <strong>Sister</strong>, <strong>Doctor</strong>, <strong>Family</strong>, and conversational Indian Sign Language (ISL) sentences.
          </div>

          {/* API Key Input */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Google Gemini API Key
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 42px 10px 14px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--accent-cyan)',
                  textDecoration: 'none'
                }}
              >
                <span>Get a free Gemini API key</span>
                <ExternalLink size={12} />
              </a>

              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Stored locally on your device
              </span>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              backgroundColor: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: statusMessage.type === 'success' ? '#6ee7b7' : '#fca5a5'
            }}>
              {statusMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)'
        }}>
          {aiVisionService.hasApiKey() ? (
            <button
              onClick={handleRemoveKey}
              style={{
                background: 'none',
                border: 'none',
                color: '#f87171',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Disconnect Key
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleTestAndSave}
              disabled={testing || !apiKeyInput.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: testing ? 'wait' : 'pointer',
                opacity: testing ? 0.7 : 1
              }}
            >
              {testing ? 'Verifying...' : 'Save & Enable AI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
