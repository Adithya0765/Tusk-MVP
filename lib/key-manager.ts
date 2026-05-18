interface KeyState {
  key: string;
  requestsThisMinute: number;
  requestsToday: number;
  lastResetMinute: number;
  lastResetDay: number;
  isBlocked: boolean;
  blockedUntil: number;
}

const GEMINI_LIMITS = { requestsPerMinute: 14, requestsPerDay: 1400 };
const GROK_LIMITS   = { requestsPerMinute: 25, requestsPerDay: 500  };

function buildKeyStates(keys: string[]): KeyState[] {
  return keys.filter(Boolean).map(key => ({
    key,
    requestsThisMinute: 0,
    requestsToday: 0,
    lastResetMinute: Date.now(),
    lastResetDay: Date.now(),
    isBlocked: false,
    blockedUntil: 0,
  }));
}

const geminiKeys: KeyState[] = buildKeyStates([
  process.env.GEMINI_KEY_1 ?? '',
  process.env.GEMINI_KEY_2 ?? '',
  process.env.GEMINI_KEY_3 ?? '',
  process.env.GEMINI_KEY_4 ?? '',
  process.env.GEMINI_KEY_5 ?? '',
]);

const grokKeys: KeyState[] = buildKeyStates([
  process.env.GROK_KEY_1 ?? '',
  process.env.GROK_KEY_2 ?? '',
  process.env.GROK_KEY_3 ?? '',
  process.env.GROK_KEY_4 ?? '',
  process.env.GROK_KEY_5 ?? '',
]);

function refreshCounters(state: KeyState) {
  const now = Date.now();
  if (now - state.lastResetMinute > 60_000) {
    state.requestsThisMinute = 0;
    state.lastResetMinute = now;
  }
  if (now - state.lastResetDay > 86_400_000) {
    state.requestsToday = 0;
    state.lastResetDay = now;
  }
  if (state.isBlocked && now > state.blockedUntil) {
    state.isBlocked = false;
  }
}

function getAvailableKey(
  keys: KeyState[],
  limits: { requestsPerMinute: number; requestsPerDay: number }
): KeyState | null {
  for (const state of keys) {
    refreshCounters(state);
    if (
      !state.isBlocked &&
      state.requestsThisMinute < limits.requestsPerMinute &&
      state.requestsToday < limits.requestsPerDay
    ) {
      return state;
    }
  }
  return null;
}

export function getGeminiKey(): string {
  const state = getAvailableKey(geminiKeys, GEMINI_LIMITS);
  if (!state) throw new Error('All Gemini keys are rate limited. Try again shortly.');
  state.requestsThisMinute++;
  state.requestsToday++;
  return state.key;
}

export function getGrokKey(): string {
  const state = getAvailableKey(grokKeys, GROK_LIMITS);
  if (!state) throw new Error('All Grok keys are rate limited. Try again shortly.');
  state.requestsThisMinute++;
  state.requestsToday++;
  return state.key;
}

export function markKeyRateLimited(key: string, provider: 'gemini' | 'grok') {
  const keys = provider === 'gemini' ? geminiKeys : grokKeys;
  const state = keys.find(k => k.key === key);
  if (state) {
    state.isBlocked = true;
    state.blockedUntil = Date.now() + 65_000;
  }
}
