import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check, Shield, Sparkles, AlertCircle } from 'lucide-react';
import BridgeLogo from './BridgeLogo';
import {
  loginWithEmail,
  registerWithEmail,
  isFirebaseConfigured
} from '../firebase';

export default function LoginPage({ onLoginSuccess, onBackToLanding }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getFriendlyErrorMessage = (err) => {
    const code = err.code || '';
    if (code === 'auth/operation-not-allowed') {
      return 'Google Sign-In is not enabled yet in your Firebase project. Please toggle it on in Firebase Console.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Google sign-in popup was blocked by your browser. Please allow popups for localhost or use Email & Password below.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email or password. Please verify and try again.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'This email is already registered. Please sign in instead.';
    }
    if (code === 'auth/weak-password') {
      return 'Password should be at least 6 characters.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in popup was closed before completion.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Domain not authorized in Firebase Console (Authentication > Settings > Authorized Domains).';
    }
    return err.message || 'An error occurred during sign in.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!isFirebaseConfigured()) {
        // Fallback demo account if keys are not pasted yet
        onLoginSuccess({
          email: email,
          name: name || email.split('@')[0],
          avatar: (name || email.charAt(0)).toUpperCase()
        });
        return;
      }

      let user;
      if (isSignUp) {
        user = await registerWithEmail(email, password, name);
      } else {
        user = await loginWithEmail(email, password);
      }

      onLoginSuccess({
        uid: user.uid,
        email: user.email,
        name: user.displayName || name || user.email.split('@')[0],
        avatar: (user.displayName || name || user.email).charAt(0).toUpperCase(),
        photoURL: user.photoURL || null
      });
    } catch (err) {
      console.error('Firebase Auth error:', err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        email: 'guest@bridge.live',
        name: 'Guest Signer',
        avatar: 'G'
      });
    }, 200);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'grid',
      gridTemplateColumns: 'minmax(420px, 1fr) minmax(460px, 1.15fr)',
      backgroundColor: '#0a0b0e',
      color: '#ffffff',
      overflow: 'hidden'
    }}>
      {/* Left Column: Dark Studio & 3D Sculpture */}
      <div style={{
        position: 'relative',
        backgroundColor: '#050608',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden'
      }}>
        {/* Subtle Ambient Radial Glow */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '30%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)'
        }} />

        {/* Top Logo */}
        <div style={{ zIndex: 10 }}>
          <div onClick={onBackToLanding} style={{ cursor: 'pointer', display: 'inline-block' }}>
            <BridgeLogo size={28} fontSize="24px" />
          </div>
        </div>

        {/* Center 3D Sculpture Image */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto 0',
          zIndex: 5
        }}>
          <img
            src="/hero-sculpture.jpg"
            alt="Bridge Liquid Chrome Knot"
            style={{
              width: '100%',
              maxWidth: '440px',
              height: 'auto',
              borderRadius: '24px',
              objectFit: 'contain',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 255, 255, 0.04)',
              transition: 'transform 0.4s ease'
            }}
          />
        </div>

        {/* Bottom Headline & Statement */}
        <div style={{ zIndex: 10, maxWidth: '440px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: '#f4f5f8',
            marginBottom: '12px'
          }}>
            Different ways.<br />Same connection.
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.65)',
            lineHeight: 1.5,
            fontWeight: 400
          }}>
            Bridge brings sign-to-text and speech-to-text into one shared space, so Deaf signers and people who don’t sign can find a way forward together.
          </p>
        </div>
      </div>

      {/* Right Column: Clean, Minimalist High-End White Surface */}
      <div style={{
        backgroundColor: '#ffffff',
        color: '#0f1115',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 64px',
        overflowY: 'auto'
      }}>
        {/* Top Navigation Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <button
            onClick={onBackToLanding}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#555b68',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '6px 0',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#000000'}
            onMouseLeave={e => e.currentTarget.style.color = '#555b68'}
          >
            <ArrowLeft size={16} />
            <span>Back to overview</span>
          </button>

          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            {isSignUp ? (
              <span>
                Already a member?{' '}
                <button
                  onClick={() => { setIsSignUp(false); setError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#000000',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Sign in
                </button>
              </span>
            ) : (
              <span>
                New here?{' '}
                <button
                  onClick={() => { setIsSignUp(true); setError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#000000',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Create account
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Center Form Container */}
        <div style={{
          maxWidth: '400px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Header */}
          <div>
            <h1 style={{
              fontSize: '34px',
              fontWeight: 600,
              letterSpacing: '-0.04em',
              color: '#0a0c10',
              marginBottom: '8px',
              lineHeight: 1.15
            }}>
              {isSignUp ? 'Create your account.' : 'Welcome back.'}
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              lineHeight: 1.45
            }}>
              {isSignUp
                ? 'Join Bridge to begin real-time sign and speech translation.'
                : 'Sign in to access your translation workspace and saved sessions.'}
            </p>
          </div>



          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '13px',
                lineHeight: 1.45
              }}>
                <div style={{ fontWeight: 500 }}>{error}</div>
              </div>
            )}

            {isSignUp && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#000000'}
                  onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                />
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px'
              }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#000000'}
                onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155'
                }}>
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    onClick={() => alert('Password reset link sent to registered email.')}
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#000000'}
                  onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#000000', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>
                Keep me signed in on this device
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '999px',
                backgroundColor: '#0a0c10',
                color: '#ffffff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.2s ease',
                marginTop: '4px'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e222b'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0a0c10'}
            >
              <span>{isLoading ? 'Connecting...' : (isSignUp ? 'Create account' : 'Sign in')}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Instant Guest Access Button */}
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
              Want to test the translator right away?
            </div>
            <button
              onClick={handleGuestSignIn}
              style={{
                width: '100%',
                padding: '9px 16px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#0a0c10';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#0a0c10';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <Sparkles size={14} color="#06b6d4" />
              <span>Launch Instant Guest Workspace</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div style={{
          textAlign: 'center',
          fontSize: '11px',
          color: '#94a3b8',
          marginTop: '24px'
        }}>
          By signing in, you agree to Bridge's{' '}
          <a href="#terms" style={{ color: '#64748b', textDecoration: 'underline' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="#privacy" style={{ color: '#64748b', textDecoration: 'underline' }}>Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}
