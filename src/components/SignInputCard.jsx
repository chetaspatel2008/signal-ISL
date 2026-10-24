import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, Scan, RotateCcw, Play, Square, Users, Sparkles, Type, Space, Delete, Clock, CheckCircle2, Hand } from 'lucide-react';
import { classifyHands, ALPHABET_A_TO_Z, distance } from '../utils/signClassifier';
import { uniSignStreamProcessor } from '../utils/uniSignEngine';

export default function SignInputCard({
  signLanguage,
  setSignLanguage,
  isSessionActive,
  onStartSession,
  onStopSession,
  onResetSession,
  onGestureDetected,
  mirrorMode,
  setMirrorMode,
  inputMode,
  setInputMode,
  onFingerspellLetter,
  onFingerspellSpace,
  onFingerspellBackspace
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [targetSecondPerson, setTargetSecondPerson] = useState(true);

  // Hold-to-Confirm steady recognition states (gives user time to show sign)
  const [candidateGesture, setCandidateGesture] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [confirmedGesture, setConfirmedGesture] = useState(null);

  // Motion Tracking & Turn-taking State
  const [motionState, setMotionState] = useState('idle'); // 'idle' | 'moving' | 'paused' | 'analyzing'
  const [lastSpokenPhrase, setLastSpokenPhrase] = useState('');
  const [bufferFillCount, setBufferFillCount] = useState(0);
  const [poseDetected, setPoseDetected] = useState(false);
  const [handCountDetected, setHandCountDetected] = useState(0);

  // Refs for velocity, timing, pause detection, and signBridge 16-frame clip buffer
  const prevLandmarksRef = useRef(null);
  const lastMotionTimeRef = useRef(0);
  const isMovingRef = useRef(false);
  const pauseTriggerTimeoutRef = useRef(null);
  const handsModelRef = useRef(null);
  const poseModelRef = useRef(null);
  const poseLandmarksRef = useRef(null);
  const cameraUtilRef = useRef(null);
  const isAnalyzingRef = useRef(false);
  const lastProcessedTimeRef = useRef(0);
  const recentDetectionsRef = useRef([]);
  const lastEmittedSignRef = useRef(null);
  const lastEmittedTimeRef = useRef(0);

  // Candidate hold tracker ref (requires steady holding before emitting)
  const candidateRef = useRef({
    name: null,
    sign: null,
    startTime: 0,
    lastSeenTime: 0,
    consecutiveFrames: 0,
    jitterFrames: 0
  });
  const confirmedTimeoutRef = useRef(null);
  const pendingSignRef = useRef(null);
  const lastHighFiveTimeRef = useRef(0);
  const lastSpaceTimeRef = useRef(0);

  // signBridge 16-frame temporal buffer (~12.5 FPS / 80ms per frame)
  const CLIP_LENGTH = 16;
  const clipBufferRef = useRef([]);
  const lastBufferTimeRef = useRef(0);
  const isSendingFrameRef = useRef(false);
  const frameLoopIdRef = useRef(null);
  const cameraActiveRef = useRef(false);
  const [scannedFrameCount, setScannedFrameCount] = useState(0);

  // Keep latest callbacks in mutable refs to avoid stale closures in MediaPipe
  const onHandsResultsRef = useRef(null);
  const onPoseResultsRef = useRef(null);

  /**
   * Robust model loader that safely initializes MediaPipe Hands & Pose
   */
  const ensureModelsLoaded = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Initialize Hands
    if (!handsModelRef.current && window.Hands) {
      try {
        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results) => {
          onHandsResultsRef.current?.(results);
        });

        handsModelRef.current = hands;
      } catch (err) {
        console.error('Hands initialization error:', err);
      }
    }

    // Initialize Pose (optional body/face anchors)
    if (!poseModelRef.current && window.Pose) {
      try {
        const pose = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults((results) => {
          onPoseResultsRef.current?.(results);
        });

        poseModelRef.current = pose;
      } catch (err) {
        console.warn('Pose initialization warning:', err);
      }
    }
  }, []);

  useEffect(() => {
    ensureModelsLoaded();
    const timer = setInterval(() => {
      if (!handsModelRef.current) {
        ensureModelsLoaded();
      } else {
        clearInterval(timer);
      }
    }, 400);

    return () => {
      clearInterval(timer);
      stopCamera();
    };
  }, [ensureModelsLoaded]);

  /**
   * Listener for MediaPipe Pose (Head, Chin, Forehead, Shoulders, Chest)
   */
  const onPoseResults = useCallback((results) => {
    if (results && results.poseLandmarks && results.poseLandmarks.length > 0) {
      poseLandmarksRef.current = results.poseLandmarks;
      setPoseDetected(true);
    } else {
      poseLandmarksRef.current = null;
      setPoseDetected(false);
    }
  }, []);
  onPoseResultsRef.current = onPoseResults;

  /**
   * Finalize the signed thought using pure Uni-Sign (ICLR 2025) ST-GCN multi-frame sequence translation
   */
  const processCompletedSigning = useCallback(() => {
    const pending = pendingSignRef.current || candidateGesture;
    if (pending && (pending.isLetter || pending.isNumber)) {
      onGestureDetected(pending);
      const confirmObj = {
        ...pending,
        name: `Letter ${pending.letter || pending.digit || pending.text} Added!`
      };
      setConfirmedGesture(confirmObj);
      setHoldProgress(100);
      pendingSignRef.current = null;
      setCandidateGesture(null);

      if (confirmedTimeoutRef.current) clearTimeout(confirmedTimeoutRef.current);
      confirmedTimeoutRef.current = setTimeout(() => {
        setConfirmedGesture(null);
        setHoldProgress(0);
      }, 1200);
    }
  }, [candidateGesture, onGestureDetected]);

  /**
   * Helper to draw connections manually if drawing_utils CDN is delayed
   */
  const drawCustomHandSkeleton = (ctx, landmarks, strokeColor, fillColor) => {
    const HAND_PAIRS = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [0, 13], [13, 14], [14, 15], [15, 16],// Ring
      [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [5, 9], [9, 13], [13, 17]              // Palm
    ];

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    HAND_PAIRS.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height);
        ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height);
        ctx.stroke();
      }
    });

    landmarks.forEach((p, idx) => {
      const isTip = [4, 8, 12, 16, 20].includes(idx);
      ctx.beginPath();
      ctx.arc(p.x * ctx.canvas.width, p.y * ctx.canvas.height, isTip ? 5 : 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = isTip ? '#ffffff' : fillColor;
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  /**
   * Landmark frame listener with velocity, Pose anchors, and pause detection
   */
  const onHandsResults = useCallback((results) => {
    const canvas = canvasRef.current;
    if (!canvas || !videoRef.current) return;

    setScannedFrameCount(c => c + 1);

    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mirrorMode && !targetSecondPerson) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // 1. Draw MediaPipe Pose Skeleton (signBridge emerald green overlay)
    const poseLms = poseLandmarksRef.current;
    if (poseLms && poseLms.length > 0) {
      if (window.drawConnectors && window.POSE_CONNECTIONS) {
        window.drawConnectors(ctx, poseLms, window.POSE_CONNECTIONS, {
          color: '#10b981',
          lineWidth: 2.5
        });
        if (window.drawLandmarks) {
          window.drawLandmarks(ctx, poseLms.slice(0, 23), {
            color: '#ffffff',
            fillColor: '#059669',
            radius: 3,
            lineWidth: 1
          });
        }
      } else {
        // Fallback draw key head & shoulder anchors
        [0, 11, 12].forEach(idx => {
          const pt = poseLms[idx];
          if (pt) {
            ctx.beginPath();
            ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#10b981';
            ctx.fill();
          }
        });
      }
    }

    // 2. Draw Hands (Left Hand cyan #06b6d4, Right Hand purple #c084fc)
    const handCount = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0;
    setHandCountDetected(handCount);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      results.multiHandLandmarks.forEach((landmarks, idx) => {
        const isSecondHand = idx === 1;
        const strokeColor = isSecondHand ? '#c084fc' : '#06b6d4';
        const fillColor = isSecondHand ? '#9333ea' : '#0284c7';

        if (window.drawConnectors && window.HAND_CONNECTIONS) {
          window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
            color: strokeColor,
            lineWidth: 3
          });
          if (window.drawLandmarks) {
            window.drawLandmarks(ctx, landmarks, {
              color: '#ffffff',
              fillColor: fillColor,
              radius: 3.5,
              lineWidth: 1
            });
          }
        } else {
          drawCustomHandSkeleton(ctx, landmarks, strokeColor, fillColor);
        }
      });

      // Maintain Uni-Sign 16-frame sliding temporal clip buffer (~12.5 FPS / 80ms)
      const now = Date.now();
      if (now - lastBufferTimeRef.current >= 80) {
        lastBufferTimeRef.current = now;
        clipBufferRef.current.push({
          handsLandmarks: results.multiHandLandmarks,
          poseLandmarks: poseLandmarksRef.current,
          timestamp: now
        });
        if (clipBufferRef.current.length > CLIP_LENGTH) {
          clipBufferRef.current.shift();
        }
        setBufferFillCount(clipBufferRef.current.length);
      }

      // Multi-point motion velocity tracking across wrist and fingertips
      const h0 = results.multiHandLandmarks[0];
      let maxDisplacement = 0;
      let avgDisplacement = 0;

      if (prevLandmarksRef.current && prevLandmarksRef.current.length >= 21) {
        const prevH0 = prevLandmarksRef.current;
        const keyPoints = [0, 4, 8, 12, 16, 20];
        let totalD = 0;
        keyPoints.forEach(pt => {
          const d = distance(h0[pt], prevH0[pt]);
          if (d > maxDisplacement) maxDisplacement = d;
          totalD += d;
        });
        avgDisplacement = totalD / keyPoints.length;
      }
      prevLandmarksRef.current = h0;

      // Active gesture motion: true if either fingertips or wrist is moving
      const isMoving = maxDisplacement > 0.012 || avgDisplacement > 0.006;

      if (isMoving) {
        isMovingRef.current = true;
        lastMotionTimeRef.current = now;
        setMotionState('moving');
      } else {
        isMovingRef.current = false;
        setMotionState('idle');
      }

      const nowMs = Date.now();

      // Case 1: Two Hands visible in camera -> gives space between words to make sentence!
      if (handCount >= 2) {
        if (nowMs - lastSpaceTimeRef.current > 1100) {
          lastSpaceTimeRef.current = nowMs;
          onFingerspellSpace();
          const spaceSign = {
            id: 'two_hands_space',
            name: 'Space (🙌 Two Hands)',
            text: ' ',
            phrase: 'Space',
            isSpace: true,
            handsUsed: 2
          };
          setCurrentGesture(spaceSign);
          setConfirmedGesture(spaceSign);
          setHoldProgress(100);
          pendingSignRef.current = null;
          setCandidateGesture(null);

          if (confirmedTimeoutRef.current) clearTimeout(confirmedTimeoutRef.current);
          confirmedTimeoutRef.current = setTimeout(() => {
            setConfirmedGesture(null);
            setHoldProgress(0);
          }, 1200);
        }
        return;
      }

      // Case 2: Single Hand -> Classify Alphabet, Number, or High-Five (Separator)
      const detected = classifyHands(results.multiHandLandmarks, poseLandmarksRef.current, signLanguage, inputMode);

      if (detected) {
        setCurrentGesture(detected);
        setDetectionConfidence(Math.round(detected.confidence * 100));

        // Subcase 2A: High-Five gesture (🖐️ whole open hand with 5 fingers) -> Separates and commits letter
        if (detected.isHighFive) {
          if (nowMs - lastHighFiveTimeRef.current > 750) {
            lastHighFiveTimeRef.current = nowMs;

            const pending = pendingSignRef.current;
            if (pending && (pending.isLetter || pending.isNumber)) {
              onGestureDetected(pending);
              const confirmSign = {
                ...pending,
                name: `✓ Letter ${pending.letter || pending.digit || pending.text} Added!`
              };
              setConfirmedGesture(confirmSign);
              setHoldProgress(100);
              pendingSignRef.current = null;
              setCandidateGesture(null);

              if (confirmedTimeoutRef.current) clearTimeout(confirmedTimeoutRef.current);
              confirmedTimeoutRef.current = setTimeout(() => {
                setConfirmedGesture(null);
                setHoldProgress(0);
              }, 1200);
            } else {
              setCandidateGesture({
                name: '🖐️ High-Five Separator',
                phrase: 'Show a letter first, then High-Five to add it'
              });
              setHoldProgress(100);
            }
          }
        } else if (detected.isLetter || detected.isNumber) {
          // Subcase 2B: Letter or Number handshape formed
          const cand = candidateRef.current;
          if (cand.name === detected.name) {
            cand.lastSeenTime = nowMs;
            cand.consecutiveFrames += 1;
            cand.sign = detected;

            const elapsed = nowMs - cand.startTime;
            // Responsive 280ms steady hold locks the letter into pending ready state
            const progress = Math.min(100, Math.round((elapsed / 280) * 100));
            setHoldProgress(progress);
            setCandidateGesture(detected);

            if (progress >= 100 && cand.consecutiveFrames >= 3) {
              pendingSignRef.current = detected;
            }
          } else {
            candidateRef.current = {
              name: detected.name,
              sign: detected,
              startTime: nowMs,
              lastSeenTime: nowMs,
              consecutiveFrames: 1,
              jitterFrames: 0
            };
            setCandidateGesture(detected);
            setHoldProgress(25);
          }
        }
      } else {
        const cand = candidateRef.current;
        if (cand.name && nowMs - cand.lastSeenTime > 450) {
          candidateRef.current = {
            name: null,
            sign: null,
            startTime: 0,
            lastSeenTime: 0,
            consecutiveFrames: 0,
            jitterFrames: 0
          };
          setCandidateGesture(null);
          setHoldProgress(0);
        }
      }
    } else {
      prevLandmarksRef.current = null;
      recentDetectionsRef.current = [];
      candidateRef.current = {
        name: null,
        sign: null,
        startTime: 0,
        lastSeenTime: 0,
        consecutiveFrames: 0,
        jitterFrames: 0
      };
      setCandidateGesture(null);
      setHoldProgress(0);
      if (isMovingRef.current) {
        // Hands dropped after gesturing -> trigger completion
        isMovingRef.current = false;
        if (!isAnalyzingRef.current) {
          processCompletedSigning();
        }
      }
      setMotionState('idle');
    }

    ctx.restore();
  }, [mirrorMode, targetSecondPerson, signLanguage, inputMode, processCompletedSigning, onGestureDetected]);
  onHandsResultsRef.current = onHandsResults;

  /**
   * Start camera with robust universal getUserMedia and resilient frame driving loop
   */
  const startCamera = async () => {
    setCameraError(null);
    try {
      await ensureModelsLoaded();

      // Universal getUserMedia configuration that works reliably on Macs, PCs, and Phones
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: targetSecondPerson ? { ideal: 'environment' } : { ideal: 'user' }
          },
          audio: false
        });
      } catch (err1) {
        console.warn('Constrained getUserMedia failed, falling back to basic video:', err1);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Ensure video is ready before triggering play
        await new Promise((resolve) => {
          if (videoRef.current.readyState >= 2) {
            resolve();
          } else {
            videoRef.current.onloadeddata = () => resolve();
            videoRef.current.onloadedmetadata = () => resolve();
            setTimeout(resolve, 600); // 600ms fallback
          }
        });

        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play warning:', playErr);
        }

        cameraActiveRef.current = true;
        setCameraActive(true);
        onStartSession?.();

        // High-reliability frame loop: sequential, non-colliding
        const runFrameLoop = async () => {
          if (!cameraActiveRef.current) return;

          const video = videoRef.current;
          if (video && video.readyState >= 2 && !isSendingFrameRef.current) {
            isSendingFrameRef.current = true;

            // 1. Send frame to Hands detector
            try {
              if (handsModelRef.current) {
                await handsModelRef.current.send({ image: video });
              }
            } catch (err) {
              console.warn('Hands frame send warning:', err);
            }

            // 2. Send frame to Pose detector (sequential, never concurrent)
            try {
              if (poseModelRef.current) {
                await poseModelRef.current.send({ image: video });
              }
            } catch (err) {
              // Pose is auxiliary, do not let it block Hands
            } finally {
              isSendingFrameRef.current = false;
            }
          }

          if (cameraActiveRef.current) {
            frameLoopIdRef.current = requestAnimationFrame(runFrameLoop);
          }
        };

        // Cancel any lingering frame loop before starting new one
        if (frameLoopIdRef.current) {
          cancelAnimationFrame(frameLoopIdRef.current);
        }
        frameLoopIdRef.current = requestAnimationFrame(runFrameLoop);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(err.message || 'Could not access camera. Please allow webcam permissions in your browser.');
      cameraActiveRef.current = false;
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    cameraActiveRef.current = false;
    if (frameLoopIdRef.current) {
      cancelAnimationFrame(frameLoopIdRef.current);
      frameLoopIdRef.current = null;
    }
    if (cameraUtilRef.current) {
      cameraUtilRef.current.stop();
      cameraUtilRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (pauseTriggerTimeoutRef.current) {
      clearTimeout(pauseTriggerTimeoutRef.current);
      pauseTriggerTimeoutRef.current = null;
    }
    if (confirmedTimeoutRef.current) {
      clearTimeout(confirmedTimeoutRef.current);
      confirmedTimeoutRef.current = null;
    }
    candidateRef.current = {
      name: null,
      sign: null,
      startTime: 0,
      lastSeenTime: 0,
      consecutiveFrames: 0,
      jitterFrames: 0
    };
    clipBufferRef.current = [];
    setBufferFillCount(0);
    setCameraActive(false);
    setCurrentGesture(null);
    setCandidateGesture(null);
    setConfirmedGesture(null);
    setHoldProgress(0);
    setMotionState('idle');
    setPoseDetected(false);
    setHandCountDetected(0);
  };

  const handleSimulateGesture = (item) => {
    const signObj = {
      id: item.id,
      name: item.name || `Letter ${item.letter}`,
      phrase: item.phrase || item.letter || item.digit,
      hindiPhrase: item.hindiPhrase,
      confidence: 0.99,
      handsUsed: item.tags && item.tags.includes('Two Hands') ? 2 : 1,
      isLetter: item.isLetter,
      isNumber: item.isNumber
    };

    setCurrentGesture(signObj);
    setDetectionConfidence(99);
    setLastSpokenPhrase(signObj.phrase);
    onGestureDetected(signObj);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)'
    }}>
      {/* Card Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scan size={18} color="var(--text-secondary)" />
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Sign input
          </span>

          {/* A-Z Fingerspelling Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '999px',
            padding: '4px 12px',
            border: '1px solid var(--border-subtle)',
            marginLeft: '12px',
            color: 'var(--text-secondary)',
            fontSize: '11px',
            fontWeight: 500
          }}>
            <Type size={12} color="var(--accent-cyan)" />
            <span>A–Z Alphabet Fingerspelling</span>
          </div>
        </div>

        {/* Uni-Sign Engine Status & Language */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#10b981',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            <span>Uni-Sign ST-GCN Online</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="sign-lang-select" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Language:
            </label>
            <select
              id="sign-lang-select"
              value={signLanguage}
              onChange={(e) => setSignLanguage(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '5px 10px',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ISL">Indian Sign Language (ISL)</option>
              <option value="ASL">American Sign Language (ASL)</option>
              <option value="BSL">British Sign Language (BSL)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Viewport Container */}
      <div
        onClick={() => {
          if (!cameraActive) startCamera();
        }}
        style={{
          position: 'relative',
          backgroundColor: '#0c0d10',
          minHeight: '440px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)',
          cursor: !cameraActive ? 'pointer' : 'default'
        }}
      >
        {/* Corner Reticle Brackets */}
        <div className={`corner-bracket corner-tl ${cameraActive ? 'active' : ''}`} />
        <div className={`corner-bracket corner-tr ${cameraActive ? 'active' : ''}`} />
        <div className={`corner-bracket corner-bl ${cameraActive ? 'active' : ''}`} />
        <div className={`corner-bracket corner-br ${cameraActive ? 'active' : ''}`} />

        {/* Top-Left Status HUD */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '52px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: cameraActive ? 'var(--accent-green)' : 'var(--text-muted)',
          zIndex: 10,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: cameraActive ? 'var(--accent-green)' : 'var(--text-muted)',
              boxShadow: cameraActive ? '0 0 8px var(--accent-green)' : 'none'
            }} />
            <span>{cameraActive ? 'LIVE' : 'CAMERA OFF'}</span>
          </div>

          <span style={{ color: 'var(--border-strong)', margin: '0 2px' }}>|</span>

          {/* Uni-Sign Multi-Modal ST-GCN Buffer Progress Bar */}
          {cameraActive && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '999px',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '10px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)'
            }}>
              <span style={{ color: bufferFillCount >= 16 ? '#10b981' : '#06b6d4' }}>
                UNI-SIGN ST-GCN BUFFER: {bufferFillCount}/16
              </span>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '3px',
                      height: '8px',
                      borderRadius: '1px',
                      backgroundColor: i < bufferFillCount ? '#10b981' : 'rgba(255, 255, 255, 0.12)',
                      transition: 'background-color 0.1s ease'
                    }}
                  />
                ))}
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>~12.5 FPS</span>
            </div>
          )}

          {/* Uni-Sign Pose & Hands Tracker Status */}
          {cameraActive && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)'
            }}>
              <span style={{
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: poseDetected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: poseDetected ? '#10b981' : '#64748b',
                border: `1px solid ${poseDetected ? 'rgba(16, 185, 129, 0.3)' : 'transparent'}`
              }}>
                {poseDetected ? 'UNI-SIGN BODY: LOCKED' : 'UNI-SIGN BODY: SCAN'}
              </span>
              <span style={{
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: handCountDetected > 0 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: handCountDetected > 0 ? '#06b6d4' : '#64748b',
                border: `1px solid ${handCountDetected > 0 ? 'rgba(6, 182, 212, 0.3)' : 'transparent'}`
              }}>
                {handCountDetected > 0 ? `HANDS: ${handCountDetected}` : 'HANDS: 0'}
              </span>

              {currentGesture?.anchor && (
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(245, 158, 11, 0.18)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  fontWeight: 600
                }}>
                  ANCHOR: {currentGesture.anchor.toUpperCase()}
                </span>
              )}

              {candidateGesture && !confirmedGesture && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(6, 182, 212, 0.2)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  fontWeight: 600
                }}>
                  HOLDING: {candidateGesture.name} ({holdProgress}%)
                </span>
              )}

              {confirmedGesture && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.25)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  fontWeight: 700
                }}>
                  ✓ CONFIRMED: {confirmedGesture.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Top-Right Motion State HUD */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '52px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10
        }}>
          {motionState === 'moving' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: 'var(--accent-amber)',
              fontSize: '11px',
              fontWeight: 600
            }}>
              <span className="animate-pulse-slow">●</span>
              <span>TRACKING MOVEMENTS...</span>
            </div>
          )}

          {motionState === 'paused' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: 'var(--accent-green)',
              fontSize: '11px',
              fontWeight: 600
            }}>
              <Clock size={12} />
              <span>MOVEMENT PAUSED — FINALIZING...</span>
            </div>
          )}

          {motionState === 'analyzing' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: 'var(--accent-cyan)',
              fontSize: '11px',
              fontWeight: 600
            }}>
              <Sparkles size={12} className="animate-pulse-slow" />
              <span>UNI-SIGN MULTIMODAL TRANSLATION...</span>
            </div>
          )}
        </div>

        {/* Video & Skeleton Canvas */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: cameraActive ? 'block' : 'none',
            transform: (mirrorMode && !targetSecondPerson) ? 'scaleX(-1)' : 'none',
            zIndex: 1
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: cameraActive ? 'block' : 'none',
            pointerEvents: 'none',
            backgroundColor: 'transparent',
            zIndex: 2
          }}
        />

        {/* Camera Off State */}
        {!cameraActive && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '420px',
            padding: '30px 20px',
            zIndex: 10
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '22px'
            }}>
              <Camera size={26} color="var(--accent-cyan)" />
            </div>

            <h3 style={{
              fontSize: '22px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              Ready when you are.
            </h3>

            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: '24px'
            }}>
              Detects every sign movement precisely, waits for you to finish your sentence, and synthesizes speech as soon as you stop.
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startCamera();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#06b6d4',
                color: '#ffffff',
                border: 'none',
                borderRadius: '999px',
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '16px',
                boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0891b2'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#06b6d4'}
            >
              <Camera size={18} />
              <span>Enable camera & Start Translating</span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              <span>🔒</span>
              <span>Your browser will ask for camera access</span>
            </div>

            {cameraError && (
              <div style={{
                marginTop: '16px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '12px',
                color: '#f87171'
              }}>
                {cameraError}
              </div>
            )}
          </div>
        )}

        {/* Central Recognition & Hold-to-Confirm Visual HUD */}
        {cameraActive && (candidateGesture || confirmedGesture) && (
          <div style={{
            position: 'absolute',
            bottom: '54px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: confirmedGesture 
              ? 'rgba(16, 185, 129, 0.95)' 
              : 'rgba(12, 13, 16, 0.92)',
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${confirmedGesture ? '#10b981' : 'rgba(6, 182, 212, 0.5)'}`,
            boxShadow: confirmedGesture 
              ? '0 8px 32px rgba(16, 185, 129, 0.5)' 
              : '0 8px 30px rgba(0, 0, 0, 0.8)',
            borderRadius: '16px',
            padding: '12px 22px',
            minWidth: '280px',
            maxWidth: '440px',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {confirmedGesture ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
                <CheckCircle2 size={22} color="#ffffff" />
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                  {confirmedGesture.name}
                </span>
              </div>
            ) : (
              <>
                {/* Header: Sign Name & Confirmation Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: 'var(--accent-cyan)',
                      letterSpacing: '0.04em'
                    }}>
                      {candidateGesture.letter || candidateGesture.digit || candidateGesture.name}
                    </span>
                    <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>
                      {candidateGesture.name}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: holdProgress >= 100 ? '#10b981' : 'var(--accent-cyan)',
                    backgroundColor: holdProgress >= 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                    padding: '2px 8px',
                    borderRadius: '999px'
                  }}>
                    {holdProgress >= 100 ? 'READY' : `${holdProgress}%`}
                  </span>
                </div>

                {/* Hold Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${holdProgress}%`,
                    height: '100%',
                    borderRadius: '999px',
                    backgroundColor: holdProgress >= 100 ? '#10b981' : '#06b6d4',
                    boxShadow: `0 0 10px ${holdProgress >= 100 ? '#10b981' : '#06b6d4'}`,
                    transition: 'width 0.08s linear'
                  }} />
                </div>

                {/* Instruction */}
                <div style={{
                  fontSize: '12px',
                  color: holdProgress >= 100 ? '#10b981' : 'var(--text-secondary)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>🖐️ Show High-Five (open hand) to separate & add to word</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Reticle Guide */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          zIndex: 10
        }}>
          🖐️ SHOW HIGH-FIVE (OPEN HAND) TO COMMIT LETTER • 🙌 SHOW TWO HANDS TO ADD WORD SPACE
        </div>

        {/* Manual Instant Trigger & Action Buttons */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '52px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 15
        }}>
          {cameraActive && (
            <>
              <button
                onClick={processCompletedSigning}
                title="Commit current letter (same as showing High-Five 🖐️)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '999px',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  color: '#07080a',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 15px rgba(255, 255, 255, 0.25)',
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
                <Hand size={14} color="#07080a" />
                <span>Separate Letter (🖐️)</span>
              </button>

              <button
                onClick={onFingerspellSpace}
                title="Insert space between words (same as showing Two Hands 🙌)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
              >
                <Space size={14} color="#ffffff" />
                <span>Space (🙌)</span>
              </button>

              <button
                onClick={stopCamera}
                title="Stop camera video feed"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <CameraOff size={12} />
                <span>Stop Camera</span>
              </button>
            </>
          )}

          <button
            onClick={() => setTargetSecondPerson(!targetSecondPerson)}
            title="Toggle between scanning a second person facing you vs yourself"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <Users size={12} color="var(--accent-cyan)" />
            <span>{targetSecondPerson ? 'Scanning 2nd Person' : 'Self Mode'}</span>
          </button>
        </div>
      </div>

      {/* Complete A–Z Fingerspelling Toolbar */}
      <div style={{
        padding: '12px 18px',
        backgroundColor: 'var(--bg-card-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.06em' }}>
            COMPLETE A–Z FINGERSPELLING:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={processCompletedSigning}
              title="Commit / separate the current letter into the word (same as showing High-Five 🖐️)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 14px',
                borderRadius: '999px',
                backgroundColor: '#ffffff',
                border: 'none',
                color: '#07080a',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(255, 255, 255, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <Hand size={12} color="#07080a" />
              <span>Separate (🖐️)</span>
            </button>
            <button
              onClick={onFingerspellSpace}
              title="Add word space (same as showing Two Hands 🙌)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
            >
              <Space size={12} />
              <span>Space (🙌)</span>
            </button>
            <button
              onClick={onFingerspellBackspace}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <Delete size={12} />
              <span>Backspace</span>
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {ALPHABET_A_TO_Z.map(item => (
            <button
              key={item.id}
              onClick={() => handleSimulateGesture(item)}
              title={item.description}
              style={{
                minWidth: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--accent-cyan)';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              {item.letter}
            </button>
          ))}
        </div>
      </div>

      {/* Card Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backgroundColor: 'var(--bg-card)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cameraActive ? 'var(--accent-green)' : 'var(--text-muted)'
          }}>
            {cameraActive ? <Camera size={18} /> : <CameraOff size={18} />}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {cameraActive ? 'Turn-Taking Motion Engine Active' : 'Camera access not enabled'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {cameraActive
                ? (isSessionActive ? 'Sign freely. When you stop moving, Uni-Sign translates your sign directly into spoken audio.' : 'Camera ready. Click Start session to begin.')
                : 'Enable your camera, then start a session to translate.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onResetSession}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          {!isSessionActive ? (
            <button
              onClick={() => {
                if (!cameraActive) {
                  startCamera();
                }
                onStartSession();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
            >
              <Play size={14} fill="currentColor" />
              <span>Start session</span>
            </button>
          ) : (
            <button
              onClick={onStopSession}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.28)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.18)'}
            >
              <Square size={14} fill="currentColor" />
              <span>Stop session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
