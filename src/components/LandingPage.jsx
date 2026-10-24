import React, { useState } from 'react';
import {
  ArrowRight,
  Hand,
  Sparkles,
  Volume2,
  Shield,
  Eye,
  CheckCircle2,
  ChevronDown,
  Layers,
  Zap,
  Play,
  Sliders,
  Users
} from 'lucide-react';
import BridgeLogo from './BridgeLogo';

export default function LandingPage({ onGetStarted, onLogin }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTabLocation, setActiveTabLocation] = useState('cafe');
  const [demoSpelledText, setDemoSpelledText] = useState('HELLO WORLD');
  const [isDemoSpeaking, setIsDemoSpeaking] = useState(false);

  const handleTestSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(demoSpelledText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      setIsDemoSpeaking(true);
      utterance.onend = () => setIsDemoSpeaking(false);
      utterance.onerror = () => setIsDemoSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const faqItems = [
    {
      q: 'How does Bridge work without guessing whole words?',
      a: 'Bridge uses precise 21-point hand landmark tracking for Indian Sign Language (ISL) and ASL fingerspelling (A–Z) and numbers (0–10). You spell each letter deliberately. When you show a High-Five (🖐️ open hand), it separates and commits the letter. When you raise both hands (🙌), it inserts a space between words to form sentences.'
    },
    {
      q: 'Do I need any special gloves or depth sensors?',
      a: 'No special hardware is required. Any built-in laptop camera, standard webcam, or smartphone camera works seamlessly at 30+ frames per second.'
    },
    {
      q: 'Is my camera video stream stored or sent to the cloud?',
      a: 'Never. All vision inference runs 100% locally on your computer inside your browser via client-side MediaPipe WebAssembly. Your raw camera frames never leave your device.'
    },
    {
      q: 'Can Bridge read signs from a second person facing me?',
      a: 'Yes! Bridge includes a one-click "Scanning 2nd Person" toggle that automatically mirrors coordinates so you can point your device at a conversational partner facing you.'
    },
    {
      q: 'Is Bridge free to use for Deaf and hearing communicators?',
      a: 'Yes, Bridge is completely free and accessible without mandatory subscriptions. You can start instantly as a guest or create an account to save custom session history.'
    }
  ];

  const locationContent = {
    cafe: {
      title: 'At a café',
      subtitle: 'Order your drink, laugh with friends, and catch up with casual ease.',
      desc: 'No more typing back and forth on note apps or pointing awkwardly at menus. Bridge gives signers an immediate voice through natural speech synthesis and displays speech back in high-contrast text.'
    },
    campus: {
      title: 'On campus',
      subtitle: 'Study groups, lectures, lab sessions, and faculty office hours.',
      desc: 'Participate actively in spontaneous group discussions and clarify questions with classmates in real time without waiting days for institutional interpreter scheduling.'
    },
    work: {
      title: 'At work',
      subtitle: 'Daily standups, quick 1:1 check-ins, and collaborative brainstorms.',
      desc: 'Bridge bridges the gap between Deaf employees and hearing colleagues in hybrid or in-person work environments, fostering genuine inclusion and equal conversation space.'
    }
  };

  return (
    <div style={{
      backgroundColor: '#07080a',
      color: '#f3f4f6',
      fontFamily: 'var(--font-sans)',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      {/* 1. Global Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(7, 8, 10, 0.85)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 40px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <BridgeLogo size={26} fontSize="22px" />

        {/* Center Nav Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px'
        }}>
          <a href="#how-it-works" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Product</a>
          <a href="#features" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Gestures</a>
          <a href="#stories" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>Stories</a>
          <a href="#faq" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>FAQ</a>
        </nav>

        {/* Right CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '8px 14px',
              borderRadius: '999px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'}
          >
            Login
          </button>

          <button
            onClick={onGetStarted}
            style={{
              backgroundColor: '#ffffff',
              color: '#07080a',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              padding: '9px 20px',
              borderRadius: '999px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 14px rgba(255, 255, 255, 0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>Get started</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={{
        position: 'relative',
        padding: '80px 48px 100px 48px',
        maxWidth: '1360px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'minmax(480px, 1.1fr) minmax(440px, 0.9fr)',
        gap: '64px',
        alignItems: 'center'
      }}>
        {/* Left Column: Headlines & CTAs */}
        <div>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            fontSize: '12px',
            fontWeight: 500,
            color: '#a1a1aa',
            marginBottom: '28px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>AI Real-Time Sign to Speech System</span>
          </div>

          <h1 style={{
            fontSize: '68px',
            fontWeight: 500,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: '#ffffff',
            marginBottom: '24px'
          }}>
            Connection,<br />
            without the barrier.
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#94a3b8',
            lineHeight: 1.6,
            maxWidth: '520px',
            marginBottom: '36px',
            fontWeight: 400
          }}>
            Real-time sign language and spoken conversation bridging Deaf, hard-of-hearing, and hearing communicators in one shared, intuitive space.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={onGetStarted}
              style={{
                backgroundColor: '#ffffff',
                color: '#07080a',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Open workspace</span>
              <ArrowRight size={16} />
            </button>

            <a
              href="#how-it-works"
              style={{
                padding: '14px 24px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                fontSize: '15px',
                fontWeight: 500,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
            >
              <span>See how it works</span>
              <ChevronDown size={16} />
            </a>
          </div>

          {/* Quick Pillars */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginTop: '44px',
            paddingTop: '28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '13px',
            color: '#64748b'
          }}>
            <div>🖐️ High-Five Letter Separation</div>
            <div>•</div>
            <div>🙌 Two-Hands Word Spacing</div>
            <div>•</div>
            <div>🔒 100% On-Device Privacy</div>
          </div>
        </div>

        {/* Right Column: 3D Chrome Liquid Sculpture */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Subtle Ambient Radial Glow */}
          <div style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.09) 0%, rgba(6, 182, 212, 0.04) 40%, rgba(0, 0, 0, 0) 70%)',
            pointerEvents: 'none',
            filter: 'blur(40px)'
          }} />

          <img
            src="/hero-sculpture.jpg"
            alt="Bridge Liquid Chrome Sculpture"
            style={{
              width: '100%',
              maxWidth: '520px',
              height: 'auto',
              borderRadius: '28px',
              objectFit: 'contain',
              boxShadow: '0 30px 100px rgba(0, 0, 0, 0.9), 0 0 50px rgba(255, 255, 255, 0.03)',
              position: 'relative',
              zIndex: 2
            }}
          />
        </div>
      </section>

      {/* 3. Transition Statement Banner */}
      <section style={{
        backgroundColor: '#030405',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '70px 48px'
      }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '28px',
            fontWeight: 400,
            lineHeight: 1.45,
            color: '#e2e8f0',
            letterSpacing: '-0.02em'
          }}>
            “Bridge brings sign-to-text and speech-to-text into one shared space, so Deaf signers, non-speaking signers and people who don’t sign can find a way forward together.”
          </p>
        </div>
      </section>

      {/* 4. Product Workspace Section: "Your words. Your way. One conversation." */}
      <section id="how-it-works" style={{
        padding: '110px 48px',
        maxWidth: '1320px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{
            fontSize: '44px',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            marginBottom: '12px'
          }}>
            Your words. Your way.<br />One conversation.
          </h2>
          <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
            Spell letters and numbers without restrictive vocabulary lists. Control punctuation naturally through high-fives and two-hand gestures.
          </p>
        </div>

        {/* Live Interactive Workspace Card Mockup */}
        <div style={{
          backgroundColor: '#0e1015',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.7)'
        }}>
          {/* Mockup Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            backgroundColor: '#090a0d',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '12px', fontFamily: 'var(--font-mono)' }}>
                bridge-workspace://session-active • 30fps
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontWeight: 600
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span>ISL & ASL Engine Online</span>
            </div>
          </div>

          {/* Mockup Body: 2 Columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 1.1fr) minmax(340px, 1fr)',
            gap: '24px',
            padding: '28px'
          }}>
            {/* Left: Signer Video Interface */}
            <div style={{
              position: 'relative',
              backgroundColor: '#050608',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              minHeight: '340px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '20px'
            }}>
              {/* Top overlay */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#22d3ee',
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}>
                  ● LIVE TRACKING (21 LANDMARKS)
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Confidence: 99.4%</span>
              </div>

              {/* Center graphic preview */}
              <div style={{
                margin: 'auto 0',
                textAlign: 'center',
                padding: '24px 0'
              }}>
                <div style={{
                  fontSize: '54px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: '#ffffff',
                  marginBottom: '8px'
                }}>
                  'W'
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={13} />
                  <span>Held steady for 280ms • Ready to separate</span>
                </div>
              </div>

              {/* Bottom Gesture Prompts */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '10px',
                padding: '10px 14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  🖐️ <strong>High-Five</strong> = Commit Letter
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  🙌 <strong>Two Hands</strong> = Space
                </span>
              </div>
            </div>

            {/* Right: Spelled Text & Natural Speech Output */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Text Card */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                flex: 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em' }}>
                    DETECTED TEXT
                  </span>
                  <span style={{ fontSize: '11px', color: '#06b6d4' }}>Auto-updating</span>
                </div>

                <div style={{
                  fontSize: '28px',
                  fontWeight: 500,
                  color: '#ffffff',
                  minHeight: '70px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {demoSpelledText}
                  <span className="animate-pulse" style={{ color: '#06b6d4', marginLeft: '2px' }}>|</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['H', 'E', 'L', 'L', 'O', ' ', 'W', 'O', 'R', 'L', 'D'].map((char, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: char === ' ' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(6, 182, 212, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: char === ' ' ? '#94a3b8' : '#22d3ee'
                      }}
                    >
                      {char === ' ' ? '␣ Space' : char}
                    </span>
                  ))}
                </div>
              </div>

              {/* Natural Speech Card */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: isDemoSpeaking ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    transition: 'all 0.2s'
                  }}>
                    <Volume2 size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                      Natural Voice Output
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {isDemoSpeaking ? 'Synthesizing voice in real time...' : 'Auto-speaks words on space & pause'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleTestSpeech}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#07080a',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Play size={12} fill="#07080a" />
                  <span>Test audio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Feature Highlights: "Less setup. More hello." */}
      <section id="features" style={{
        padding: '90px 48px',
        backgroundColor: '#0a0c10',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              marginBottom: '10px'
            }}>
              Less setup. More hello.
            </h2>
            <p style={{ fontSize: '16px', color: '#94a3b8' }}>
              Built from the ground up for instantaneous, expressive, and reliable two-way conversation.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {/* Card 1 */}
            <div style={{
              backgroundColor: '#111318',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
              transition: 'border-color 0.2s ease, transform 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div>
                <div style={{ color: '#06b6d4', marginBottom: '16px' }}>
                  <Sliders size={24} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
                  Make it yours.
                </h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Choose between A–Z Alphabet, Numbers 0–10, or Combined modes. Toggle between scanning yourself or a second person facing you with automatic coordinate flipping.
                </p>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginTop: '20px' }}>
                CUSTOMIZABLE WORKSPACE
              </div>
            </div>

            {/* Card 2 */}
            <div style={{
              backgroundColor: '#111318',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
              transition: 'border-color 0.2s ease, transform 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div>
                <div style={{ color: '#10b981', marginBottom: '16px' }}>
                  <Hand size={24} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
                  Say it your way.
                </h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Fingerspell your exact words letter-by-letter without restrictive word lists. Open hand (🖐️) acts as letter separator; two hands (🙌) inserts natural spaces between words.
                </p>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginTop: '20px' }}>
                INTUITIVE GESTURE GRAMMAR
              </div>
            </div>

            {/* Card 3 */}
            <div style={{
              backgroundColor: '#111318',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
              transition: 'border-color 0.2s ease, transform 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div>
                <div style={{ color: '#a855f7', marginBottom: '16px' }}>
                  <Zap size={24} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
                  Keep it flowing.
                </h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Runs 100% on-device in WebAssembly. Zero upload lag, zero cloud privacy exposure, and instant text-to-speech feedback so listeners never have to look down at screens.
                </p>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginTop: '20px' }}>
                ON-DEVICE WEBASSEMBLY
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Deep Dark Section: "Different ways to express. Equal space." */}
      <section style={{
        padding: '110px 48px',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 0.9fr) minmax(460px, 1.3fr)',
          gap: '64px',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '44px',
              fontWeight: 500,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              marginBottom: '20px'
            }}>
              Different ways<br />to express.<br />Equal space.
            </h2>
            <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '28px' }}>
              Communication shouldn’t demand that one person bend to another’s medium. Bridge creates a neutral, frictionless threshold where sign and voice coexist equally.
            </p>
            <button
              onClick={onGetStarted}
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '11px 22px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              <span>Explore the translator</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            {[
              {
                title: 'Both sides included',
                desc: 'Two-way interaction designed so signers and non-signers share the exact same conversational rhythm.'
              },
              {
                title: 'A voice in both ears',
                desc: 'Crystal-clear speech synthesis articulates every sentence aloud naturally without robot monotone.'
              },
              {
                title: 'At your own pace',
                desc: 'Steady 280ms hold ensures you can relax between fingerspelling letters without accidental errors.'
              },
              {
                title: 'Uncapped expression',
                desc: 'No dictionary boundaries. Spell proper names, medical terms, numbers, and slang effortlessly.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#0d0f14',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f5f8' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Lifestyle & Human Connection: "Life happens between hellos." */}
      <section id="stories" style={{
        padding: '100px 48px',
        backgroundColor: '#0a0c10',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(420px, 1.1fr) minmax(380px, 1fr)',
            gap: '64px',
            alignItems: 'center'
          }}>
            {/* Left Column: Photo */}
            <div style={{ position: 'relative' }}>
              <img
                src="/cafe-conversation.jpg"
                alt="Friends having a joyful conversation at an outdoor cafe"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '24px',
                  boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#06b6d4' }} />
                <span>Real everyday connections</span>
              </div>
            </div>

            {/* Right Column: Accordion Locations */}
            <div>
              <h2 style={{
                fontSize: '42px',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                marginBottom: '16px'
              }}>
                Life happens<br />between hellos.
              </h2>
              <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
                Whether meeting an old friend or ordering your morning coffee, Bridge transforms everyday encounters from hesitant pauses into fluid, comfortable conversations.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['cafe', 'campus', 'work'].map(key => {
                  const item = locationContent[key];
                  const isActive = activeTabLocation === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setActiveTabLocation(key)}
                      style={{
                        padding: '18px 22px',
                        borderRadius: '14px',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                        border: isActive ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '17px',
                        fontWeight: 600,
                        color: isActive ? '#ffffff' : '#94a3b8'
                      }}>
                        <span>{item.title}</span>
                        <span style={{ fontSize: '18px' }}>{isActive ? '—' : '+'}</span>
                      </div>

                      {isActive && (
                        <div style={{ marginTop: '10px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0', marginBottom: '4px' }}>
                            {item.subtitle}
                          </p>
                          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                            {item.desc}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section: "A little clarity goes a long way." */}
      <section id="faq" style={{
        padding: '110px 48px',
        maxWidth: '980px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            marginBottom: '12px'
          }}>
            A little clarity<br />goes a long way.
          </h2>
          <p style={{ fontSize: '16px', color: '#94a3b8' }}>
            Frequently asked questions about the Bridge translation technology and workflow.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqItems.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#0d0f14',
                  borderRadius: '16px',
                  border: isOpen ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s'
                }}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '22px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: '#f8fafc',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: '#94a3b8'
                    }}
                  />
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 28px 24px 28px',
                    fontSize: '14px',
                    color: '#94a3b8',
                    lineHeight: 1.6
                  }}>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Final Call to Action: "Less distance. More connection." */}
      <section style={{
        backgroundColor: '#020304',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '120px 48px 100px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Ambient Radial Glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, rgba(6, 182, 212, 0.03) 40%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)'
        }} />

        <div style={{ position: 'relative', zIndex: 5, maxWidth: '820px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '56px',
            fontWeight: 500,
            letterSpacing: '-0.04em',
            marginBottom: '20px',
            lineHeight: 1.05
          }}>
            Less distance.<br />More connection.
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#94a3b8',
            maxWidth: '560px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6
          }}>
            Experience sign language translation that respects the nuance of every letter and empowers natural two-way conversation.
          </p>

          <button
            onClick={onGetStarted}
            style={{
              backgroundColor: '#ffffff',
              color: '#07080a',
              border: 'none',
              padding: '15px 36px',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 25px rgba(255, 255, 255, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>Start now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 10. Massive Footer with "bridge" Typography */}
      <footer style={{
        backgroundColor: '#000000',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '80px 48px 40px 48px',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1.2fr) 1fr 1fr',
          gap: '48px',
          marginBottom: '80px'
        }}>
          <div>
            <BridgeLogo size={32} fontSize="26px" />
            <p style={{
              fontSize: '13px',
              color: '#64748b',
              marginTop: '16px',
              maxWidth: '300px',
              lineHeight: 1.55
            }}>
              Bridging the gap between Deaf signers, non-speakers, and speakers in real time through computer vision and natural synthesis.
            </p>
          </div>

          <div>
            <h5 style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '14px', letterSpacing: '0.04em' }}>
              PRODUCT
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#94a3b8' }}>
              <li><a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>Fingerspelling Engine</a></li>
              <li><a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Delimiter Gestures</a></li>
              <li><a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>Speech Synthesis</a></li>
              <li><a href="#stories" style={{ color: 'inherit', textDecoration: 'none' }}>Community Stories</a></li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '14px', letterSpacing: '0.04em' }}>
              PRIVACY & SPECS
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#94a3b8' }}>
              <li>100% On-Device WebAssembly</li>
              <li>Zero Raw Video Telemetry</li>
              <li>MediaPipe 21-Landmark Topology</li>
              <li>Indian Sign Language (ISL) & ASL</li>
            </ul>
          </div>
        </div>

        {/* Giant Architectural Wordmark */}
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: 'clamp(72px, 16vw, 190px)',
            fontWeight: 800,
            letterSpacing: '-0.06em',
            color: 'rgba(255, 255, 255, 0.08)',
            userSelect: 'none',
            lineHeight: 0.9,
            marginBottom: '20px'
          }}>
            bridge
          </div>

          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#475569',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>© {new Date().getFullYear()} Bridge Systems. Designed for inclusive communication.</div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                All Systems Operational
              </span>
              <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
              <a href="#terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
