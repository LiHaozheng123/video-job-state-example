// Synthetic educational reports only. No network calls or video generation.
import assert from 'node:assert/strict';
import { beginRequest, connectionLost, observe } from './job-state.mjs';

const requestId = 'example-request';
const report = (phase, version) => ({
  requestId,
  jobId: 'example-job',
  phase,
  version,
});
const show = (label, state) => console.log(`${label}: ${state.phase} (version ${state.version})`);

let state = beginRequest(requestId, 'example-quote');
show('start', state);

state = connectionLost(state);
assert.equal(state.phase, 'unknown');
show('connection lost', state);

state = observe(state, report('queued', 1));
show('server queued', state);

state = observe(state, report('running', 2));
show('server running', state);

const running = state;
state = observe(state, report('queued', 1));
assert.equal(state, running);
show('late queued report ignored', state);

state = observe(state, report('succeeded', 3));
assert.equal(state.phase, 'succeeded');
show('completed', state);

assert.throws(() => observe(state, report('running', 4)), /Unexpected job transition/);
console.log('newer terminal regression: rejected');
