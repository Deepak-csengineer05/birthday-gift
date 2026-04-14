/* ═══════════════════════════════════════════════════════
   🌙 LUNAR ANALYTICS — Firebase Realtime Database
   Dual-write: localStorage (instant) + Firebase (remote)
   ═══════════════════════════════════════════════════════ */

import { rtdb } from './firebase';
import {
  ref, set, get, update, push
} from 'firebase/database';

const LOCAL_KEY = 'lunar_analytics';
const FB_PATH   = 'lunar_analytics'; // Root path in Firebase RTDB

/* ── Local Helpers ──────────────────────────────────── */
function getLocalStore() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : createEmptyStore();
  } catch {
    return createEmptyStore();
  }
}

function saveLocalStore(store) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('[Analytics] localStorage save failed:', e);
  }
}

function createEmptyStore() {
  return {
    visitCount: 0,
    visits: [],
    totalTimeSpent: 0,
    sessionStart: null,
    lastActivity: null,
    events: [],
    section10Answers: {},
  };
}

/* ── Firebase Helpers ───────────────────────────────── */
async function fbGet(path) {
  try {
    const snap = await get(ref(rtdb, path));
    return snap.exists() ? snap.val() : null;
  } catch (e) {
    console.warn('[Analytics] Firebase read failed:', e);
    return null;
  }
}

async function fbSet(path, value) {
  try {
    await set(ref(rtdb, path), value);
  } catch (e) {
    console.warn('[Analytics] Firebase write failed:', e);
  }
}

async function fbUpdate(path, value) {
  try {
    await update(ref(rtdb, path), value);
  } catch (e) {
    console.warn('[Analytics] Firebase update failed:', e);
  }
}

/* ══════════════════════════════════════════════════════
   PUBLIC API
   ══════════════════════════════════════════════════════ */

/**
 * Heartbeat ping — updates lastActivity timestamp.
 * Called every 5s while user is active.
 */
export function ping() {
  const now = Date.now();

  // Local
  const store = getLocalStore();
  store.lastActivity = now;
  saveLocalStore(store);

  // Firebase (fire-and-forget)
  fbUpdate(FB_PATH, { lastActivity: now });
}

/**
 * Record a new site visit.
 */
export async function recordVisit() {
  const now = new Date().toISOString();

  // Local
  const store = getLocalStore();
  store.visitCount += 1;
  store.visits.push(now);
  store.sessionStart = Date.now();
  saveLocalStore(store);

  // Firebase
  const fbVisitCount = (await fbGet(`${FB_PATH}/visitCount`)) || 0;
  const updates = {
    [`${FB_PATH}/visitCount`]: fbVisitCount + 1,
    [`${FB_PATH}/sessionStart`]: Date.now(),
  };
  await update(ref(rtdb), updates);
  // Push visit timestamp to list
  await push(ref(rtdb, `${FB_PATH}/visits`), now);
}

/**
 * Update cumulative time spent.
 */
export function updateTimeSpent() {
  const store = getLocalStore();
  if (store.sessionStart) {
    const elapsed = Math.floor((Date.now() - store.sessionStart) / 1000);
    store.totalTimeSpent += elapsed;
    store.sessionStart = Date.now();
    saveLocalStore(store);

    // Firebase
    fbGet(`${FB_PATH}/totalTimeSpent`).then(current => {
      fbUpdate(FB_PATH, {
        totalTimeSpent: (current || 0) + elapsed,
        sessionStart: Date.now(),
      });
    });
  }
}

/**
 * Track an interaction event.
 */
export function trackEvent(category, action, data = {}) {
  const event = {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    category,
    action,
    data,
    timestamp: new Date().toISOString(),
  };

  // Local
  const store = getLocalStore();
  store.events.push(event);
  saveLocalStore(store);

  // Firebase — push to events list
  push(ref(rtdb, `${FB_PATH}/events`), event).catch(e =>
    console.warn('[Analytics] event push failed:', e)
  );
}

/**
 * Store a Section 9 text answer.
 */
export function trackSection10Answer(questionId, questionText, answer) {
  const entry = {
    question: questionText,
    answer,
    timestamp: new Date().toISOString(),
  };

  // Local
  const store = getLocalStore();
  store.section10Answers[questionId] = entry;
  saveLocalStore(store);

  // Firebase
  fbSet(`${FB_PATH}/section10Answers/${questionId}`, entry).catch(e =>
    console.warn('[Analytics] Section10 save failed:', e)
  );
}

/**
 * Get analytics (local, for legacy use).
 * Admin dashboard now uses Firebase listener directly.
 */
export function getAnalytics() {
  return getLocalStore();
}

/**
 * Get events by category (local).
 */
export function getEventsByCategory(category) {
  return getLocalStore().events.filter(e => e.category === category);
}

/**
 * Clear all analytics data from both local and Firebase.
 */
export async function clearAnalytics() {
  localStorage.removeItem(LOCAL_KEY);
  await fbSet(FB_PATH, null);
}

/**
 * Returns the Firebase RTDB path for the admin dashboard to listen on.
 */
export { FB_PATH };

