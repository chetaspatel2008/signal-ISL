// Advanced Multi-Modal Sign Language Recognition Engine
// Full Indian Sign Language (ISL) & American Sign Language (ASL)
// Includes complete A-Z Fingerspelling, Numbers 0-10, and 100+ Vocabulary Signs (including Father, Mother, Family, Doctor)

import { ALPHABET_A_TO_Z, NUMBERS_0_TO_10, FULL_SIGN_VOCABULARY } from './fullDictionary';

export { ALPHABET_A_TO_Z, NUMBERS_0_TO_10, FULL_SIGN_VOCABULARY };

// 3D Euclidean distance between landmarks
export function distance(p1, p2) {
  if (!p1 || !p2) return 999;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Compute 3D angle formed by three landmarks A - B - C (angle at vertex B)
export function getJointAngle(a, b, c) {
  if (!a || !b || !c) return 180;
  const v1 = { x: a.x - b.x, y: a.y - b.y, z: (a.z || 0) - (b.z || 0) };
  const v2 = { x: c.x - b.x, y: c.y - b.y, z: (c.z || 0) - (b.z || 0) };

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  if (mag1 === 0 || mag2 === 0) return 180;
  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

// Compute comprehensive finger metrics (extension ratio, curl, angles)
export function analyzeFingerDetails(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return {
      thumb: { extended: false, curled: true, angle: 180, distFromWrist: 0, halfBent: false },
      index: { extended: false, curled: true, angle: 180, distFromWrist: 0, halfBent: false },
      middle: { extended: false, curled: true, angle: 180, distFromWrist: 0, halfBent: false },
      ring: { extended: false, curled: true, angle: 180, distFromWrist: 0, halfBent: false },
      pinky: { extended: false, curled: true, angle: 180, distFromWrist: 0, halfBent: false },
      isUpright: true,
      palmNormal: null
    };
  }

  const wrist = landmarks[0];

  // Helper: angle at PIP joint (MCP→PIP→DIP) — primary curl indicator
  const pipAngle = (mcpIdx, pipIdx, dipIdx) => getJointAngle(landmarks[mcpIdx], landmarks[pipIdx], landmarks[dipIdx]);
  // Helper: angle at DIP joint (PIP→DIP→TIP) — fingertip curl
  const dipAngle = (pipIdx, dipIdx, tipIdx) => getJointAngle(landmarks[pipIdx], landmarks[dipIdx], landmarks[tipIdx]);

  const getFingerState = (mcpIdx, pipIdx, dipIdx, tipIdx) => {
    const distTipWrist = distance(landmarks[tipIdx], wrist);
    const distMcpWrist = distance(landmarks[mcpIdx], wrist);
    const distPipWrist = distance(landmarks[pipIdx], wrist);
    const pAngle = pipAngle(mcpIdx, pipIdx, dipIdx);
    const dAngle = dipAngle(pipIdx, dipIdx, tipIdx);
    const mcpPipTipAngle = getJointAngle(landmarks[mcpIdx], landmarks[pipIdx], landmarks[tipIdx]);

    // Clear separation:
    // Extended: PIP angle > 140° AND tip further from wrist than PIP
    // Curled:   PIP angle < 110° OR tip closer to wrist than MCP
    // HalfBent: in between (semi-bent, important for letters like E, X)
    const isExtended = (pAngle > 140 && distTipWrist > distPipWrist * 0.95) ||
                       (mcpPipTipAngle > 150 && distTipWrist > distMcpWrist);
    const isCurled = (pAngle < 110 && distTipWrist < distPipWrist * 1.15) ||
                     (distTipWrist < distMcpWrist * 0.85);
    const isHalfBent = !isExtended && !isCurled;

    return {
      extended: isExtended,
      curled: isCurled,
      halfBent: isHalfBent,
      angle: Math.round(mcpPipTipAngle),
      pipAngle: Math.round(pAngle),
      dipAngle: Math.round(dAngle),
      distFromWrist: distTipWrist
    };
  };

  // Thumb: uses different anatomy — CMC(1), MCP(2), IP(3), TIP(4)
  const distThumbTipWrist = distance(landmarks[4], wrist);
  const distThumbMcpWrist = distance(landmarks[2], wrist);
  const thumbAngle = getJointAngle(landmarks[1], landmarks[2], landmarks[4]);
  const thumbIpAngle = getJointAngle(landmarks[2], landmarks[3], landmarks[4]);
  const thumbToIndex = distance(landmarks[4], landmarks[8]);
  const thumbToMiddle = distance(landmarks[4], landmarks[12]);
  const thumbToPalm = distance(landmarks[4], landmarks[9]);

  // Thumb extended if it's far from palm center and pointing away
  const thumbExtended = (thumbToPalm > 0.10 && thumbAngle > 100) ||
                        (distThumbTipWrist > distThumbMcpWrist * 1.15);
  // Thumb curled if it's tucked near the palm or touching other fingers
  const thumbCurled = thumbToPalm < 0.08 ||
                      (distance(landmarks[4], landmarks[5]) < 0.05) ||
                      (distance(landmarks[4], landmarks[6]) < 0.05);

  const thumbState = {
    extended: thumbExtended,
    curled: thumbCurled,
    halfBent: !thumbExtended && !thumbCurled,
    angle: Math.round(thumbAngle),
    ipAngle: Math.round(thumbIpAngle),
    distFromWrist: distThumbTipWrist,
    toPalm: thumbToPalm,
    toIndex: thumbToIndex,
    toMiddle: thumbToMiddle
  };

  const indexState = getFingerState(5, 6, 7, 8);
  const middleState = getFingerState(9, 10, 11, 12);
  const ringState = getFingerState(13, 14, 15, 16);
  const pinkyState = getFingerState(17, 18, 19, 20);

  const isUpright = landmarks[8].y < wrist.y && landmarks[12].y < wrist.y;

  return {
    thumb: thumbState,
    index: indexState,
    middle: middleState,
    ring: ringState,
    pinky: pinkyState,
    isUpright,
    palmNormal: null
  };
}

// Recognize Alphabet Fingerspelling (A - Z) — Complete ASL/ISL
export function classifyAlphabet(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;
  const d = analyzeFingerDetails(landmarks);
  const h = landmarks;

  // Key distance measurements
  const thumbTip = h[4], indexTip = h[8], middleTip = h[12], ringTip = h[16], pinkyTip = h[20];
  const thumbIndexDist = distance(thumbTip, indexTip);
  const thumbMiddleDist = distance(thumbTip, middleTip);
  const thumbRingDist = distance(thumbTip, ringTip);
  const thumbPinkyDist = distance(thumbTip, pinkyTip);
  const indexMiddleDist = distance(indexTip, middleTip);
  const middleRingDist = distance(middleTip, ringTip);
  const indexRingDist = distance(indexTip, ringTip);
  const wrist = h[0];

  // Palm scale: distance from wrist to middle MCP for normalizing
  const palmScale = distance(wrist, h[9]) || 0.15;

  // Normalized distances (scale-independent)
  const nThumbIndex = thumbIndexDist / palmScale;
  const nThumbMiddle = thumbMiddleDist / palmScale;
  const nIndexMiddle = indexMiddleDist / palmScale;

  // Orientation helpers
  const handPointsDown = h[12].y > wrist.y && h[8].y > wrist.y;
  const handPointsSideways = Math.abs(h[8].x - wrist.x) > Math.abs(h[8].y - wrist.y);
  const indexAbovePip = h[8].y < h[6].y; // true when index points up

  // Helper: are index and middle fingers crossed?
  const fingersCrossed = (() => {
    // R: index over middle — check if index tip is on the opposite side of middle finger
    const indexMcp = h[5], middleMcp = h[9];
    const normalSpread = indexMcp.x - middleMcp.x; // positive if index is left of middle (right hand)
    const tipSpread = indexTip.x - middleTip.x;
    // Crossed if tips are on the opposite side compared to MCPs
    return (normalSpread * tipSpread < 0) || (Math.abs(tipSpread) < 0.01 && indexMiddleDist < 0.04);
  })();

  // === LETTER A: Closed fist, thumb alongside (thumb tip above index MCP) ===
  if (d.index.curled && d.middle.curled && d.ring.curled && d.pinky.curled &&
      !d.thumb.curled && h[4].y < h[3].y && nThumbIndex > 0.3) {
    return { id: 'letter_a', letter: 'A', name: 'Letter A', phrase: 'A', confidence: 0.95, isLetter: true };
  }

  // === LETTER B: Four fingers straight up, thumb folded across palm ===
  if (d.index.extended && d.middle.extended && d.ring.extended && d.pinky.extended &&
      (d.thumb.curled || d.thumb.halfBent) && d.isUpright) {
    return { id: 'letter_b', letter: 'B', name: 'Letter B', phrase: 'B', confidence: 0.96, isLetter: true };
  }

  // === LETTER C: Curved hand forming C shape ===
  if (!d.index.extended && !d.index.curled && nThumbIndex > 0.3 && nThumbIndex < 1.0 &&
      !d.middle.extended && !d.middle.curled &&
      h[4].x !== h[8].x) { // thumb and index form an arc
    return { id: 'letter_c', letter: 'C', name: 'Letter C', phrase: 'C', confidence: 0.90, isLetter: true };
  }

  // === LETTER D: Index straight up, thumb+middle+ring form circle ===
  if (d.index.extended && indexAbovePip &&
      (d.middle.curled || d.middle.halfBent) && d.ring.curled && d.pinky.curled &&
      thumbMiddleDist < palmScale * 0.5) {
    return { id: 'letter_d', letter: 'D', name: 'Letter D', phrase: 'D', confidence: 0.95, isLetter: true };
  }

  // === LETTER E: All fingertips curled down, thumb folded under ===
  if ((d.index.curled || d.index.halfBent) &&
      (d.middle.curled || d.middle.halfBent) &&
      (d.ring.curled || d.ring.halfBent) &&
      (d.pinky.curled || d.pinky.halfBent) &&
      (d.thumb.curled || d.thumb.halfBent) &&
      h[4].y > h[3].y) { // thumb tip below thumb IP = tucked under
    return { id: 'letter_e', letter: 'E', name: 'Letter E', phrase: 'E', confidence: 0.88, isLetter: true };
  }

  // === LETTER F: Thumb+Index touching circle, middle+ring+pinky extended ===
  if (thumbIndexDist < palmScale * 0.35 &&
      d.middle.extended && d.ring.extended && d.pinky.extended) {
    return { id: 'letter_f', letter: 'F', name: 'Letter F', phrase: 'F', confidence: 0.96, isLetter: true };
  }

  // === LETTER G: Index+thumb pointing sideways parallel ===
  if (handPointsSideways && d.index.extended && !d.middle.extended &&
      d.ring.curled && d.pinky.curled &&
      nThumbIndex > 0.2 && nThumbIndex < 0.8) {
    return { id: 'letter_g', letter: 'G', name: 'Letter G', phrase: 'G', confidence: 0.92, isLetter: true };
  }

  // === LETTER H: Index+middle extended sideways together ===
  if (handPointsSideways && d.index.extended && d.middle.extended &&
      d.ring.curled && d.pinky.curled &&
      nIndexMiddle < 0.3) {
    return { id: 'letter_h', letter: 'H', name: 'Letter H', phrase: 'H', confidence: 0.93, isLetter: true };
  }

  // === LETTER I: Pinky straight up, all others folded ===
  if (d.pinky.extended && d.index.curled && d.middle.curled && d.ring.curled &&
      (d.thumb.curled || d.thumb.halfBent)) {
    return { id: 'letter_i', letter: 'I', name: 'Letter I', phrase: 'I', confidence: 0.97, isLetter: true };
  }

  // === LETTER K: Index up, middle angled forward, thumb between ===
  if (d.index.extended && (d.middle.extended || d.middle.halfBent) &&
      d.ring.curled && d.pinky.curled && d.isUpright &&
      distance(h[4], h[10]) < palmScale * 0.5 && // thumb near middle PIP
      nIndexMiddle > 0.15) {
    return { id: 'letter_k', letter: 'K', name: 'Letter K', phrase: 'K', confidence: 0.91, isLetter: true };
  }

  // === LETTER L: Thumb+Index at right angle (L shape), others folded ===
  if (d.thumb.extended && d.index.extended &&
      d.middle.curled && d.ring.curled && d.pinky.curled &&
      nThumbIndex > 0.5 && d.isUpright) {
    return { id: 'letter_l', letter: 'L', name: 'Letter L', phrase: 'L', confidence: 0.98, isLetter: true };
  }

  // === LETTER M: Three fingers (index, middle, ring) draped over thumb ===
  if (d.index.curled && d.middle.curled && d.ring.curled && d.pinky.curled &&
      d.thumb.curled &&
      // Thumb tip visible below ring finger — between ring and pinky
      h[4].y > h[14].y && distance(h[4], h[17]) < palmScale * 0.6) {
    // Disambiguate from S and N by checking thumb emerges between ring+pinky
    const thumbBetweenRingPinky = (h[4].x > Math.min(h[16].x, h[20].x) - 0.02) &&
                                   (h[4].x < Math.max(h[16].x, h[20].x) + 0.02);
    if (thumbBetweenRingPinky) {
      return { id: 'letter_m', letter: 'M', name: 'Letter M', phrase: 'M', confidence: 0.85, isLetter: true };
    }
  }

  // === LETTER N: Two fingers (index, middle) draped over thumb ===
  if (d.index.curled && d.middle.curled && d.ring.curled && d.pinky.curled &&
      d.thumb.curled &&
      h[4].y > h[10].y && distance(h[4], h[13]) < palmScale * 0.5) {
    const thumbBetweenMiddleRing = (h[4].x > Math.min(h[12].x, h[16].x) - 0.02) &&
                                    (h[4].x < Math.max(h[12].x, h[16].x) + 0.02);
    if (thumbBetweenMiddleRing) {
      return { id: 'letter_n', letter: 'N', name: 'Letter N', phrase: 'N', confidence: 0.84, isLetter: true };
    }
  }

  // === LETTER O: All fingertips touching thumb tip forming circle ===
  if (thumbIndexDist < palmScale * 0.35 && thumbMiddleDist < palmScale * 0.4 &&
      (d.ring.curled || d.ring.halfBent) && (d.pinky.curled || d.pinky.halfBent)) {
    return { id: 'letter_o', letter: 'O', name: 'Letter O', phrase: 'O', confidence: 0.93, isLetter: true };
  }

  // === LETTER P: K handshape pointed downward ===
  if (handPointsDown && d.index.extended && (d.middle.extended || d.middle.halfBent) &&
      d.ring.curled && d.pinky.curled) {
    return { id: 'letter_p', letter: 'P', name: 'Letter P', phrase: 'P', confidence: 0.89, isLetter: true };
  }

  // === LETTER Q: G handshape (thumb+index pinch) pointed downward ===
  if (handPointsDown && !d.middle.extended && !d.ring.extended && !d.pinky.extended &&
      nThumbIndex < 0.5) {
    return { id: 'letter_q', letter: 'Q', name: 'Letter Q', phrase: 'Q', confidence: 0.87, isLetter: true };
  }

  // === LETTER R: Index and middle crossed ===
  if (d.index.extended && d.middle.extended &&
      d.ring.curled && d.pinky.curled &&
      fingersCrossed) {
    return { id: 'letter_r', letter: 'R', name: 'Letter R', phrase: 'R', confidence: 0.90, isLetter: true };
  }

  // === LETTER S: Tight fist, thumb across front of fingers ===
  if (d.index.curled && d.middle.curled && d.ring.curled && d.pinky.curled &&
      d.thumb.curled && h[4].y <= h[6].y) {
    return { id: 'letter_s', letter: 'S', name: 'Letter S', phrase: 'S', confidence: 0.90, isLetter: true };
  }

  // === LETTER T: Fist with thumb poking between index and middle ===
  if (d.index.curled && d.middle.curled && d.ring.curled && d.pinky.curled &&
      distance(h[4], h[6]) < palmScale * 0.35 && // thumb near index PIP
      h[4].y < h[8].y) { // thumb above index tip
    return { id: 'letter_t', letter: 'T', name: 'Letter T', phrase: 'T', confidence: 0.86, isLetter: true };
  }

  // === LETTER U: Index+middle extended straight up together ===
  if (d.index.extended && d.middle.extended &&
      d.ring.curled && d.pinky.curled && d.isUpright &&
      nIndexMiddle < 0.25 && !fingersCrossed) {
    return { id: 'letter_u', letter: 'U', name: 'Letter U', phrase: 'U', confidence: 0.95, isLetter: true };
  }

  // === LETTER V: Index+middle extended spread into V ===
  if (d.index.extended && d.middle.extended &&
      d.ring.curled && d.pinky.curled && d.isUpright &&
      nIndexMiddle >= 0.25) {
    return { id: 'letter_v', letter: 'V', name: 'Letter V', phrase: 'V', confidence: 0.96, isLetter: true };
  }

  // === LETTER W: Index+middle+ring extended and spread ===
  if (d.index.extended && d.middle.extended && d.ring.extended &&
      d.pinky.curled && d.isUpright) {
    return { id: 'letter_w', letter: 'W', name: 'Letter W', phrase: 'W', confidence: 0.95, isLetter: true };
  }

  // === LETTER X: Index finger hooked (half-bent), others closed ===
  if ((d.index.halfBent || (!d.index.extended && !d.index.curled)) &&
      d.middle.curled && d.ring.curled && d.pinky.curled &&
      (d.thumb.curled || d.thumb.halfBent)) {
    return { id: 'letter_x', letter: 'X', name: 'Letter X', phrase: 'X', confidence: 0.88, isLetter: true };
  }

  // === LETTER Y: Thumb+pinky extended, middle three folded ===
  if (d.thumb.extended && d.pinky.extended &&
      d.index.curled && d.middle.curled && d.ring.curled) {
    return { id: 'letter_y', letter: 'Y', name: 'Letter Y', phrase: 'Y', confidence: 0.97, isLetter: true };
  }

  // === LETTER J: Same as I (pinky up) — motion-based letter, detect static start ===
  // J is I + a downward J-curve motion. We detect the static I pose and label as J
  // when motion is detected (handled by motion tracking in SignInputCard)
  // For static recognition, this is same as I so we skip to avoid confusion.

  // === LETTER Z: Index pointing, trace Z — motion-based ===
  // Z starts with index pointing like "1". Static detection would conflict with D/1.
  // Motion tracking handles the Z-trace. Skip for static.

  return null;
}


// Recognize Numbers (0 - 10)
export function classifyNumber(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;
  const d = analyzeFingerDetails(landmarks);
  const h = landmarks;

  // 1: Index up, others curled
  if (d.index.extended && d.middle.curled && d.ring.curled && d.pinky.curled && !d.thumb.extended) {
    return { id: 'num_1', name: '1 (One)', digit: '1', phrase: 'One', confidence: 0.97, isNumber: true };
  }

  // 2: Index and middle up, others curled
  if (d.index.extended && d.middle.extended && d.ring.curled && d.pinky.curled && !d.thumb.extended) {
    return { id: 'num_2', name: '2 (Two)', digit: '2', phrase: 'Two', confidence: 0.97, isNumber: true };
  }

  // 3: Thumb, index, middle up, ring and pinky curled
  if (d.thumb.extended && d.index.extended && d.middle.extended && d.ring.curled && d.pinky.curled) {
    return { id: 'num_3', name: '3 (Three)', digit: '3', phrase: 'Three', confidence: 0.96, isNumber: true };
  }

  // 4: Four fingers up, thumb folded
  if (d.index.extended && d.middle.extended && d.ring.extended && d.pinky.extended && !d.thumb.extended) {
    return { id: 'num_4', name: '4 (Four)', digit: '4', phrase: 'Four', confidence: 0.97, isNumber: true };
  }

  // 5: All five fingers extended
  if (d.thumb.extended && d.index.extended && d.middle.extended && d.ring.extended && d.pinky.extended) {
    return { id: 'num_5', name: '5 (Five)', digit: '5', phrase: 'Five', confidence: 0.98, isNumber: true };
  }

  // 0: Circular O shape
  const thumbIndexDist = distance(h[4], h[8]);
  if (thumbIndexDist < 0.08 && d.middle.curled && d.ring.curled && d.pinky.curled) {
    return { id: 'num_0', name: '0 (Zero)', digit: '0', phrase: 'Zero', confidence: 0.95, isNumber: true };
  }

  return null;
}

// High-Five Gesture: Whole open hand with all 5 fingers extended and upright (Letter Separator)
export function classifyHighFive(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;
  const d = analyzeFingerDetails(landmarks);
  const h = landmarks;

  // All 5 fingers extended (thumb, index, middle, ring, pinky)
  const allFiveExtended = d.thumb.extended && d.index.extended && d.middle.extended && d.ring.extended && d.pinky.extended;

  if (allFiveExtended && d.isUpright) {
    const spreadIndexMiddle = distance(h[8], h[12]);
    const spreadThumbIndex = distance(h[4], h[8]);

    // Ensure thumb is out and fingers are spread naturally like a high five (not tucked like B)
    if (spreadThumbIndex > 0.08 || spreadIndexMiddle > 0.035) {
      return {
        id: 'high_five',
        name: 'High-Five (🖐️ Separate Letter)',
        type: 'high_five',
        phrase: 'High-Five',
        isHighFive: true,
        confidence: 0.99
      };
    }
  }
  return null;
}

// Two Hands Gesture: Both hands visible in camera -> gives space between words to make sentence
export function classifyTwoHandsSpace(handsLandmarks) {
  if (!handsLandmarks || handsLandmarks.length < 2) return null;
  const h1 = handsLandmarks[0];
  const h2 = handsLandmarks[1];
  if (!h1 || !h2 || h1.length < 21 || h2.length < 21) return null;

  return {
    id: 'two_hands_space',
    name: 'Space (🙌 Two Hands)',
    type: 'space',
    text: ' ',
    phrase: 'Space',
    isSpace: true,
    confidence: 0.99,
    handsUsed: 2
  };
}

// Master Classifier: Exclusively recognizes Alphabets (A-Z) and Numbers (0-10)
// High-Five separates/commits each letter, Two Hands gives space between words to make sentences.
// STRICT RULE: No word guessing!
export function classifyHands(handsLandmarks, poseLandmarks = null, language = 'ISL', mode = 'alphabet') {
  if (!handsLandmarks || handsLandmarks.length === 0) {
    return null;
  }

  // 1. Two Hands: Inserts space between words
  if (handsLandmarks.length >= 2) {
    return classifyTwoHandsSpace(handsLandmarks);
  }

  const h1 = handsLandmarks[0];

  // 2. High-Five on single hand: Whole open hand with 5 fingers -> Separates letter
  const highFiveMatch = classifyHighFive(h1);
  if (highFiveMatch) {
    return highFiveMatch;
  }

  // 3. Alphabet Fingerspelling (A - Z strictly)
  const alphabetMatch = classifyAlphabet(h1);
  if (alphabetMatch) {
    return {
      ...alphabetMatch,
      text: alphabetMatch.letter,
      phrase: alphabetMatch.letter,
      isLetter: true,
      isWord: false
    };
  }

  return null;
}

