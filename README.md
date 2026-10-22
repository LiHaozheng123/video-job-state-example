# Video job state example

A small JavaScript teaching example for tracking what a client knows about an asynchronous video job. It separates a lost submission response from an authoritative job result. The reducer and demonstration work without a video service, account, browser, or network connection.

## Run locally

Requires Node.js 20 or newer. The package was tested locally with Node.js 22.22.2. There are no packages to install.

```sh
node --test job-state.test.mjs
node demo.mjs
```

The eight tests cover lost responses, stale and duplicate reports, unrelated requests, conflicting job identities, terminal-state regressions, polling interruptions, and invalid identifiers or report versions. They exercise this local reducer only.

## Follow the demonstration

`demo.mjs` uses synthetic identifiers and reports. It starts in `submitting`, moves to `unknown` when the initial response is lost, then observes `queued`, `running`, and `succeeded`. An older queued report cannot overwrite running progress. A newer report that tries to regress a completed job is rejected.

No request is submitted to a real service. The printed states are examples, not observations of a generated video.

## Model and assumptions

`beginRequest(requestId, quoteId)` creates the client state. `connectionLost(state)` preserves known progress and marks an unconfirmed initial submission as unknown. `observe(state, report)` accepts matching-request reports with increasing integer versions, preserves one job identity, and restricts state transitions.

The caller must supply valid state objects and parsed, authenticated reports. The example assumes a server contract with monotonically increasing versions. It does not implement authentication or establish that every service provides that contract.

`requestId` and `quoteId` are references. They do not enforce backend idempotency, validate a price, reserve credits, prevent duplicate charges, or provide a security boundary. Real billing, cancellation, persistence, retries, and reconciliation need explicit server contracts and integration tests.

## Scope

The implementation is intentionally small: a reducer, eight tests, and a runnable demonstration. It makes no network calls, reads no credentials, and performs no video generation. No production system or video quality was tested. This is not a production SDK, generator, or extract from a private backend.

## Context

Prepared with AI assistance for [AI Pop Video](https://aipopvideo.com/), whose photo-to-video workflow supplied the teaching topic. The example remains usable independently of that product.
