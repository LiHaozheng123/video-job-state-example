import test from 'node:test';
import assert from 'node:assert/strict';
import { beginRequest, connectionLost, observe } from './job-state.mjs';

const start = () => beginRequest('request-1', 'quote-1');
const report = (phase, version, extra = {}) => ({ requestId: 'request-1', jobId: 'job-1', phase, version, ...extra });

test('lost submission response stays unknown and retains the operation identity', () => {
  const state = connectionLost(start());
  assert.deepEqual(state, { requestId: 'request-1', quoteId: 'quote-1', jobId: null, phase: 'unknown', version: -1 });
  assert.equal(observe(state, report('succeeded', 3)).phase, 'succeeded');
});
test('stale reports cannot regress a completed job', () => {
  const done = observe(start(), report('succeeded', 3));
  assert.equal(observe(done, report('running', 2)), done);
});
test('a different request cannot overwrite the current operation', () => {
  const state = start();
  assert.equal(observe(state, report('succeeded', 2, { requestId: 'request-2' })), state);
});
test('duplicate reports are harmless', () => {
  const running = observe(start(), report('running', 2));
  assert.equal(observe(running, report('running', 2)), running);
});
test('one request cannot silently change jobs', () => {
  const running = observe(start(), report('running', 2));
  assert.throws(() => observe(running, report('succeeded', 3, { jobId: 'job-2' })), /different jobs/);
});
test('terminal state cannot regress even with a newer version', () => {
  const done = observe(start(), report('succeeded', 3));
  assert.throws(() => observe(done, report('running', 4)), /Unexpected/);
});
test('polling failure does not erase known server progress', () => {
  const running = observe(start(), report('running', 2));
  assert.equal(connectionLost(running), running);
});
test('invalid server versions and missing identifiers are rejected', () => {
  assert.throws(() => observe(start(), report('running', NaN)), /version/);
  assert.throws(() => observe(start(), report('running', 0, { jobId: '' })), /Missing/);
  assert.throws(() => beginRequest('', 'quote-1'), /required/);
});
