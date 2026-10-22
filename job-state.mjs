// Educational client-state example. No network requests or production integration.
const allowed = {
  submitting: ['queued', 'running', 'succeeded', 'failed'],
  unknown: ['queued', 'running', 'succeeded', 'failed'],
  queued: ['queued', 'running', 'succeeded', 'failed'],
  running: ['running', 'succeeded', 'failed'],
  succeeded: ['succeeded'],
  failed: ['failed'],
};

export function beginRequest(requestId, quoteId) {
  if (![requestId, quoteId].every(id => typeof id === 'string' && id.length > 0)) {
    throw new Error('Request and quote IDs are required');
  }
  return { requestId, quoteId, phase: 'submitting', jobId: null, version: -1 };
}

export function connectionLost(state) {
  return state.phase === 'submitting' ? { ...state, phase: 'unknown' } : state;
}

// Call only with a parsed response from your authenticated job-status API.
export function observe(state, report) {
  if (report.requestId !== state.requestId) return state;
  if (!Number.isSafeInteger(report.version) || report.version < 0) {
    throw new Error('Invalid report version');
  }
  if (report.version <= state.version) return state;
  if (typeof report.jobId !== 'string' || !report.jobId) {
    throw new Error('Missing job ID');
  }
  if (state.jobId && report.jobId !== state.jobId) {
    throw new Error('One request ID resolved to different jobs');
  }
  if (!allowed[state.phase]?.includes(report.phase)) {
    throw new Error('Unexpected job transition');
  }
  return { ...state, jobId: report.jobId, phase: report.phase, version: report.version };
}
