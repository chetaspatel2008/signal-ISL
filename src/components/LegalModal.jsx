import React, { useState, useEffect } from 'react';
import { X, Shield, FileText, Lock, Eye, Database, Server, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'terms' | 'privacy'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 6, 8, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          backgroundColor: '#0c0d12',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255, 255, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f1f5f9'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0e1017'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: activeTab === 'terms' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${activeTab === 'terms' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {activeTab === 'terms' ? (
                <FileText size={20} color="#38bdf8" />
              ) : (
                <Shield size={20} color="#10b981" />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                {activeTab === 'terms' ? 'Terms & Conditions of Service' : 'Privacy Policy & Data Logging Disclosure'}
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Bridge ISL Translation Platform • Effective Date: October 2026
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Tabs Pill Switcher */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              padding: '3px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button
                onClick={() => setActiveTab('terms')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: activeTab === 'terms' ? '#ffffff' : 'transparent',
                  color: activeTab === 'terms' ? '#07080a' : '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <FileText size={13} />
                <span>Terms</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: activeTab === 'privacy' ? '#ffffff' : 'transparent',
                  color: activeTab === 'privacy' ? '#07080a' : '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Shield size={13} />
                <span>Privacy & Logs</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '32px 36px',
          overflowY: 'auto',
          fontSize: '14px',
          lineHeight: '1.7',
          color: '#cbd5e1'
        }}>
          {activeTab === 'terms' ? (
            /* ================= TERMS & CONDITIONS ================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <FileText size={18} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>
                    Summary of Terms
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                    By using Bridge ("the Application", "we", "us"), you agree to these Terms of Service. Bridge provides assistive real-time Indian Sign Language (ISL) fingerspelling and bidirectional speech-to-text translation for conversational inclusion.
                  </div>
                </div>
              </div>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  1. Acceptance of Terms
                </h3>
                <p>
                  These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you") and Bridge. By accessing our web application, creating an account via Firebase Authentication, or utilizing our computer vision translation system, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must discontinue using Bridge immediately.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  2. Description of the Bridge Service
                </h3>
                <p>
                  Bridge is an assistive communication technology designed to bridge the communication gap between Deaf or hard-of-hearing signers and non-signers. The system provides:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Real-Time ISL Fingerspelling Translation:</strong> Client-side computer vision detection of Indian Sign Language A–Z manual alphabet handshapes.</li>
                  <li><strong>Delimiter Control Gestures:</strong> Dedicated hold-to-confirm letter locking, 🖐️ High-Five gesture for letter commitment into words, and 🙌 Two-Hands gesture for word-boundary spacing.</li>
                  <li><strong>Speech-to-Text & Text-to-Speech:</strong> Voice recognition using browser Web Speech APIs and natural speech synthesis for auditory feedback.</li>
                  <li><strong>User Account Sync:</strong> Cloud profile sync and saved sessions via Google Cloud Firestore.</li>
                </ul>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  3. User Accounts & Security
                </h3>
                <p>
                  To unlock personalized workspaces and cloud session histories, you may create an account using a valid email address and password managed through Firebase Authentication. You are responsible for:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Maintaining the confidentiality of your login credentials.</li>
                  <li>All activities that occur under your account.</li>
                  <li>Promptly notifying us of any unauthorized use or security breach.</li>
                </ul>
                <p style={{ marginTop: '8px' }}>
                  We reserve the right to suspend or terminate accounts that violate these Terms or present security risks to our infrastructure.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  4. Camera Permissions & Edge Inference
                </h3>
                <p>
                  Bridge requires access to your device camera to detect hand gestures. By granting camera permissions, you acknowledge that:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Camera video streams are processed <strong>entirely in local client memory</strong> using WebGL and MediaPipe.</li>
                  <li>No raw camera feeds, video frames, or audio streams are transmitted to Bridge remote servers or third parties.</li>
                  <li>You must ensure you have appropriate authorization when using the camera in public or shared environments with third parties present.</li>
                </ul>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  5. Translation Disclaimer: Not for Emergency, Legal, or Certified Medical Use
                </h3>
                <p>
                  Bridge is an assistive machine learning communication tool and <strong>does not substitute for certified human interpreters</strong> (e.g., RID, ASL/ISL certified court or hospital interpreters).
                </p>
                <div style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginTop: '10px',
                  color: '#fbbf24',
                  fontSize: '13px'
                }}>
                  <strong>Important Notice:</strong> Do not rely exclusively on Bridge for life-critical, medical diagnoses, emergency 911/112 services, or legally binding depositions. Environmental lighting, camera occlusion, and hand speed can impact recognition accuracy.
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  6. Intellectual Property
                </h3>
                <p>
                  All proprietary code, user interface designs, the "Bridge" geometric arch brand mark, 3D assets, and custom gesture classification architectures are the exclusive intellectual property of Bridge and its licensors. You may not reverse engineer, decompile, redistribute, or create derivative commercial clones without express written authorization.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  7. Prohibited Uses
                </h3>
                <p>You agree not to use Bridge to:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Harass, abuse, defame, or violate the civil rights of any person.</li>
                  <li>Transmit harmful code, automated scraping bots, or perform denial-of-service attacks against our database endpoints.</li>
                  <li>Attempt to bypass Firestore database security rules or access another user's private translation records.</li>
                </ul>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  8. Limitation of Liability
                </h3>
                <p>
                  To the maximum extent permitted by applicable law, Bridge and its developers shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from translation inaccuracies, inability to access the service, or communication misunderstandings. The software is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  9. Modifications & Governing Law
                </h3>
                <p>
                  We may periodically revise these Terms to reflect architectural improvements or regulatory requirements. Continued use of Bridge following published updates constitutes acceptance. These Terms are governed by the laws of India and applicable international standards for digital accessibility.
                </p>
              </section>
            </div>
          ) : (
            /* ================= PRIVACY POLICY & PRIVACY LOGS ================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <Shield size={18} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>
                    Zero-Knowledge Camera Processing Architecture
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                    Bridge is built on the principle that your camera feed is sacred. All computer vision inference executes strictly on your device inside browser WebAssembly memory. We never see, record, or upload your video.
                  </div>
                </div>
              </div>

              {/* Comprehensive Data Logging Disclosure Matrix */}
              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '12px' }}>
                  1. Privacy & Telemetry Logs Transparency Matrix
                </h3>
                <p style={{ marginBottom: '14px' }}>
                  Below is an itemized breakdown of what data logs are generated, where they reside, and what data is strictly prohibited from collection:
                </p>

                <div style={{
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <th style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: 600 }}>Data Category</th>
                        <th style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: 600 }}>Location & Destination</th>
                        <th style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: 600 }}>Status / Retention</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: '#94a3b8' }}>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>
                          Webcam Video Frames
                        </td>
                        <td style={{ padding: '12px 16px' }}>Local GPU/Wasm only</td>
                        <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 600 }}>
                          ❌ NEVER LOGGED / NEVER STORED
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>
                          Audio & Microphone Stream
                        </td>
                        <td style={{ padding: '12px 16px' }}>Browser Web Speech API</td>
                        <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 600 }}>
                          ❌ NEVER SAVED AS AUDIO FILES
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>
                          Hand Landmark Coordinates
                        </td>
                        <td style={{ padding: '12px 16px' }}>Transient memory buffer (~280ms)</td>
                        <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 600 }}>
                          🗑️ Discarded immediately after letter lock
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>
                          Account Email & UID
                        </td>
                        <td style={{ padding: '12px 16px' }}>Firebase Auth & Firestore</td>
                        <td style={{ padding: '12px 16px', color: '#38bdf8', fontWeight: 500 }}>
                          🔒 Encrypted at rest until account deletion
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>
                          Sign & Message Counts
                        </td>
                        <td style={{ padding: '12px 16px' }}>Browser React component state</td>
                        <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                          🔄 Resets upon session refresh
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>
                          3rd Party Tracking / Ads
                        </td>
                        <td style={{ padding: '12px 16px' }}>None</td>
                        <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 600 }}>
                          ❌ ZERO AD NETWORKS OR COOKIE TRACKERS
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  2. Information We Collect When You Sign Up
                </h3>
                <p>When you create an account, we store minimal identity records in Firebase:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Account Metadata:</strong> Your email address, chosen display name, account creation date, and last authentication timestamp.</li>
                  <li><strong>Firestore Document:</strong> Saved securely under <code>users/{'{uid}'}</code> in the Google Cloud Datacenter, governed by rigorous Firestore security rules ensuring only your authenticated session can access your data.</li>
                  <li><strong>Passwords:</strong> Passwords are hashed using SCRYPT with project-specific salts by Google Identity Platform; Bridge administrators cannot access or view plain text passwords.</li>
                </ul>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  3. Real-Time Gesture Delimiters & Data Flow
                </h3>
                <p>
                  To form words and sentences, the vision classifier analyzes spatial finger curl ratios:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Hold-to-Confirm (~280ms):</strong> Mathematical joint vectors are calculated in frame-by-frame memory buffers. Once confirmed, the letter is locked and past frames are cleared.</li>
                  <li><strong>🖐️ High-Five Letter Separation:</strong> Triggered locally to join letters into complete words.</li>
                  <li><strong>🙌 Two-Hands Word Space:</strong> Multi-hand spatial detection inserts spaces between words. No biometric fingerprints or hand dimensions are ever saved to a profile database.</li>
                </ul>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  4. Data Rights: Access, Export, and Deletion
                </h3>
                <p>
                  In compliance with modern digital privacy frameworks (including GDPR, CCPA, and Indian Digital Personal Data Protection Act):
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Right to Erase:</strong> You can request immediate deletion of your Firebase user document and authentication account at any time.</li>
                  <li><strong>Local Reset:</strong> Clicking "Reset & Clear" in the workspace instantly flushes all translated text from browser memory.</li>
                  <li><strong>No Data Monetization:</strong> We never sell, rent, or trade your translation transcripts or usage statistics to data brokers or AI training conglomerates.</li>
                </ul>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  5. Security Infrastructure & Encryption
                </h3>
                <p>
                  All data in transit is encrypted using TLS 1.3 / HTTPS. Firestore documents are encrypted at rest using AES-256 standards. Our security rules mandate authentication tokens for any read/write operations against the <code>users</code> collection.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '10px' }}>
                  6. Contact & Data Officer
                </h3>
                <p>
                  If you have inquiries regarding this Privacy Policy, privacy logs, or wish to exercise your data rights, contact our engineering and compliance team at <code>privacy@bridge.live</code>.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '18px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0a0b10',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {activeTab === 'terms' ? 'Last modified: October 2026' : 'Audit status: 100% On-Device Verified'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setActiveTab(activeTab === 'terms' ? 'privacy' : 'terms')}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              <span>{activeTab === 'terms' ? 'Switch to Privacy & Logs' : 'Switch to Terms'}</span>
              <ArrowRight size={13} />
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '8px 22px',
                borderRadius: '999px',
                backgroundColor: '#ffffff',
                border: 'none',
                color: '#07080a',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(255, 255, 255, 0.15)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
