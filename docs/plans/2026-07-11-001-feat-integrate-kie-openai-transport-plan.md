---
title: KIE OpenAI Transport Integration - Plan
type: feat
date: 2026-07-11
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-plan-bootstrap
execution: code
---

# KIE OpenAI Transport Integration - Plan

## Goal Capsule

- **Objective:** Make KIE the server-side media generation engine for Infini's native image and video workflows without moving KIE provider logic or credentials into Infini.
- **Authority:** Confirmed user decisions and this Product Contract take precedence; current Infini request contracts and the KIE tool registry define implementation details.
- **Execution profile:** Cross-repository, contract-first work. KIE publishes the transport package first; Infini then pins and consumes that exact version.
- **Stop conditions:** Do not ship if the KIE key reaches browser storage, Infini duplicates KIE schemas/client logic, the package cannot be installed reproducibly, or generated media remains dependent on expiring remote URLs.
- **Tail ownership:** Every Infini release owns an exact tested `@felores/kie-ai-openai-server` version in the Canvas Agent manifest and lockfile. KIE releases never update an existing Infini release automatically.

---

## Product Contract

### Summary

Add a KIE-owned OpenAI-compatible HTTP transport that Infini mounts behind its local Canvas Agent, then expose it as a normal local image/video channel in Infini. Agent workflows continue to compose the existing KIE and Infini MCP servers as siblings; Sinapso receives no KIE dependency or credential.

### Problem Frame

Infini's native Generate pages already speak OpenAI-shaped image and asynchronous video contracts, but they call providers directly from the browser and persist channel keys locally. KIE explicitly requires a server-side credential and already owns model schemas, provider payloads, uploads, task tracking, polling, and result interpretation in its CLI/MCP monorepo.

A direct KIE implementation inside Infini would duplicate the most volatile provider logic and create two integration surfaces to maintain. A KIE-owned adapter lets Infini retain its existing workbench UX while the provider boundary stays in the KIE repository. Versioning must be release-managed: each Infini release selects and tests one exact KIE package version rather than executing `latest` at runtime.

### Requirements

#### Provider Ownership

- R1. The OpenAI-compatible transport, model adapters, validation, provider calls, uploads, task mapping, and response normalization live in the KIE monorepo.
- R2. Infini consumes only the published KIE transport contract and must not copy KIE schemas, model payload builders, or provider clients.
- R3. The transport reuses the KIE private core at build time and bundles it into the public package; `@felores/kie-ai-core` remains unpublished.

#### Infini Generation

- R4. Infini's native image generation and image editing flows work through OpenAI-compatible KIE routes.
- R5. Infini's native video creation, polling, restart recovery, and content download work through OpenAI-compatible KIE routes.
- R6. Model discovery returns only adapter models that Infini's existing image/video capability classification and request shapes can use faithfully.
- R7. Completed image and video bytes enter Infini's existing browser-local persistence before the UI reports a durable result.
- R8. Unsupported model settings or references fail before a paid KIE task is created whenever validation can determine the incompatibility locally.
- R19. A stable Infini request ID can claim at most one KIE submission; an ambiguous crash window blocks automatic resubmission instead of risking a duplicate paid task.

#### Security and Runtime

- R9. `KIE_AI_API_KEY` remains in the local Canvas Agent process environment and never appears in browser storage, URLs, HTTP/SSE responses, logs, exports, or agent transcripts.
- R10. Browser requests authenticate with the existing Canvas Agent token, not the KIE key.
- R11. The KIE transport is available only through the loopback Canvas Agent and inherits its token, Origin enrollment, CORS, request-size, and DNS-rebinding boundaries.
- R12. Codex and Claude subprocesses receive a sanitized environment with all `KIE_AI_*` and `KIE_MCP_*` variables removed.

#### Version and Release Management

- R13. `canvas-agent/package.json` pins `@felores/kie-ai-openai-server` to one exact version with no range, wildcard, tag, or runtime `npx @latest` resolution.
- R14. The Infini lockfile, release workflow, and compatibility tests verify the same exact package version.
- R15. Updating KIE for a later Infini release is an explicit dependency change followed by KIE contract tests and Infini consumer tests.
- R16. The KIE release workflow publishes the transport package with provenance only after its build, typecheck, tests, and package-content checks pass.
- R20. Infini records the root release version, exact KIE package version, and transport contract version in one compatibility manifest validated by pre-release CI.

#### Repository Boundaries

- R17. External agent hosts use KIE MCP for generation and Infini MCP for canvas/assets as sibling servers; the OpenAI transport does not replace either MCP surface.
- R18. Sinapso has no KIE package, URL, key, MCP registration, or direct KIE calls. Any Sinapso integration targets Infini only.

### Actors

- A1. A creator using Infini's image or video workbench.
- A2. The local Canvas Agent hosting the authenticated KIE transport.
- A3. An external agent host composing KIE MCP and Infini MCP tools.
- A4. KIE and Infini maintainers publishing and validating compatible releases.

### Key Flows

- F1. Local runtime startup
  - **Trigger:** The user starts Canvas Agent with `KIE_AI_API_KEY` configured.
  - **Actors:** A2.
  - **Steps:** Canvas Agent loads the pinned package, mounts its router after local authentication, and exposes readiness and package version without exposing secrets.
  - **Outcome:** Infini can discover KIE models through the existing loopback connection.
  - **Covered by:** R9-R16, R20.
- F2. Native image generation or editing
  - **Trigger:** A1 submits an image prompt, optionally with supported image references.
  - **Actors:** A1, A2.
  - **Steps:** Infini sends its existing OpenAI-shaped request, the KIE adapter validates and executes the matching KIE tool, waits for completion, downloads the outputs, and returns browser-safe image data.
  - **Outcome:** Infini persists the generated images locally and retains its existing workbench/canvas behavior.
  - **Covered by:** R1-R8, R19.
- F3. Native video generation
  - **Trigger:** A1 submits a video prompt with supported settings and references.
  - **Actors:** A1, A2.
  - **Steps:** The KIE adapter creates a task and returns a stable transport task ID; Infini polls that ID, resumes after reload when needed, and downloads completed bytes through the authenticated content route.
  - **Outcome:** Infini persists the video locally without retaining an expiring KIE result URL as the durable asset.
  - **Covered by:** R1-R8, R19.
- F4. Agent-generated media
  - **Trigger:** A3 needs media placed into Infini.
  - **Actors:** A3.
  - **Steps:** The host calls a filtered KIE MCP generation tool, waits through KIE MCP, then passes the result URL to an Infini MCP asset/canvas tool.
  - **Outcome:** Each repository remains behind its existing MCP boundary.
  - **Covered by:** R17-R18.

### Acceptance Examples

- AE1. Given Canvas Agent has no `KIE_AI_API_KEY`, when Infini checks KIE readiness, then the response reports KIE as unconfigured without returning environment details and existing non-KIE features remain available.
- AE2. Given a configured local KIE runtime, when Infini refreshes the channel models, then it receives only supported image/video adapter IDs and classifies each into the correct capability.
- AE3. Given a valid image prompt, when generation completes, then Infini receives image bytes or base64 data, saves them locally, and does not persist an expiring KIE URL as the sole copy.
- AE4. Given supported image references, when the creator requests an edit, then the transport uploads the files server-side and rejects unsupported masks or limits before submitting a KIE task.
- AE5. Given a video task is pending when the page reloads, when Infini resumes polling the saved transport task ID, then the same KIE task completes without a duplicate paid submission.
- AE6. Given a request with a missing or wrong Canvas Agent token, when it targets any KIE route, then it is rejected before KIE receives a request.
- AE7. Given Codex or Claude starts from a KIE-enabled Canvas Agent, when the child environment is inspected by a test double, then no KIE credential or KIE transport variable is present.
- AE8. Given an Infini release declares a tested KIE package version, when the release checks run, then manifest, lockfile, packed package, and runtime readiness all report that exact version.

### Success Criteria

- Image generation, supported image editing, and video generation use KIE through Infini's existing workbench request paths.
- Browser diagnostics and storage inspection show no KIE provider credential.
- Generated outputs survive provider URL expiry because Infini stores the media locally.
- The KIE transport is published independently, while each Infini release remains reproducible through an exact dependency pin.
- Existing OpenAI-compatible and Gemini channels continue to work unchanged.

### Confirmed Decisions

- Native Infini Generate-button integration is required; sibling MCP servers alone do not satisfy the requested UI scope.
- KIE package upgrades happen only through an Infini release change, never through runtime `latest` resolution.
- The first native transport release covers image and video workbenches; KIE MCP remains the complete agent-facing catalog.

### Scope Boundaries

#### Included

- KIE adapters for a small allowlist of native Infini-compatible image and video models.
- `GET /v1/models`, image generation/edit routes, video create/status/content routes, health/readiness, error normalization, uploads, and task persistence.
- A KIE-owned router/server package mounted by Canvas Agent under its existing loopback security boundary.
- First-class local KIE channel setup and status in Infini.
- Exact package pinning and cross-repository release verification.
- Documentation for sibling-MCP agent composition.

#### Deferred to Follow-Up Work

- Audio, music, and speech routes for Infini's canvas audio mode.
- Mask-based image editing until a selected KIE model can honor the mask contract.
- Reference video/audio and provider-specific first/last-frame controls in the generic video workbench.
- KIE task cancellation, cost dashboards, callbacks, cloud hosting, and cross-device task synchronization.
- Automatic KIE upgrades outside an Infini release.
- Embedded Codex/Claude KIE MCP registration; external hosts can already register sibling servers.

#### Outside This Product's Identity

- A direct browser-to-KIE provider connection.
- Direct Sinapso-to-KIE integration.
- A second Infini-owned provider client, schema registry, task queue, or compatibility layer.
- Server-side accounts, cloud synchronization, or a multi-tenant generation service.

---

## Planning Contract

### Key Technical Decisions

- KTD1. **Publish a dedicated KIE package.** Add initial release `@felores/kie-ai-openai-server@0.1.0` under the KIE monorepo. It exports `createKieOpenAiRouter({ apiKey, baseUrl, dataDir, packageVersion, contractVersion })` and a standalone binary from the same implementation; the embedded router never receives or evaluates the Canvas Agent token.
- KTD2. **Mount instead of proxy.** Canvas Agent mounts the KIE-owned router under `/kie` after its existing token, Origin, CORS, host, and outer request-limit middleware. Infini uses a base URL ending in `/kie`, and the existing URL builder adds `/v1`. The router owns multipart parsing, route validation, adapter execution, and normalized errors only.
- KTD3. **Keep outer security in Canvas Agent.** The browser authenticates with the existing Canvas Agent token. The KIE package's standalone binary adds its own loopback host and bearer-token wrapper, but the reusable router assumes the caller has already authorized the request.
- KTD4. **Keep the adapter contract narrow.** Expose only models that map cleanly to Infini's current image and generic video requests. Model IDs must contain `image` or `video`; video aliases must avoid `seedance` so Infini does not select its Ark-specific route.
- KTD5. **Return durable browser-safe results.** Image routes return base64 data after server-side result download. Video status leads Infini to the authenticated `/content` route, which streams validated media bytes. Provider URLs stay internal.
- KTD6. **Use a transport-owned atomic request journal, not SQLite.** Store one JSON record per hashed Infini request ID under `KIE_OPENAI_DATA_DIR`. The process acquires one exclusive data-directory writer lock at startup, and a per-request promise queue serializes updates inside that process. Initial claims use exclusive file creation; updates require the expected revision, increment it, write a unique temporary file, flush it, and atomically rename it. Stale revisions and backward state transitions are rejected.
- KTD7. **Prefer safety over automatic retry in the provider-acceptance crash window.** Legal states are `reserved -> submitted -> succeeded|failed`; terminal states never transition. Validation runs before `reserved`. The provider task ID is written in the `submitted` transition immediately after acceptance. A retry of `reserved` returns `409 ambiguous_submission` and never resubmits; `submitted` resumes the provider task. The transport binary provides a recovery command that validates a discovered provider task ID and performs the otherwise-forbidden `reserved -> submitted` repair without creating a task.
- KTD8. **Preserve MCP separation.** KIE MCP retains the complete agent-facing catalog and lifecycle utilities. Infini MCP retains canvas/assets. The HTTP adapter is only for native UI compatibility.
- KTD9. **Pin per Infini release.** The exact KIE transport version is source-controlled in `canvas-agent/package.json` and `canvas-agent/bun.lock`; a release does not query npm for a newer compatible version at startup.

### Initial Model Matrix

| Public model ID | KIE tool | Routes | Accepted Infini fields | Rejected in first release |
|---|---|---|---|---|
| `kie-nano-banana-image` | `nano_banana_image` | image generation/edit | prompt, `n`, quality-to-resolution, size-to-aspect-ratio, up to 14 image references | mask, unsupported ratios/formats |
| `kie-gpt-image-2` | `gpt_image_2` | image generation/edit | prompt, `n`, quality-to-resolution, size-to-aspect-ratio, up to 16 image references | mask, unsupported ratios/formats |
| `kie-bytedance-video` | `bytedance_seedance_video` standard mode | video create/status/content | prompt, 4-15 seconds, 480p/720p, supported aspect ratio, up to 7 image references | reference video/audio, provider-specific frame roles |
| `kie-bytedance-fast-video` | `bytedance_seedance_video` fast mode | video create/status/content | prompt, 4-15 seconds, 480p/720p, supported aspect ratio, up to 7 image references | reference video/audio, provider-specific frame roles |

The public video aliases intentionally omit `seedance` so Infini uses its generic OpenAI video route rather than the Ark-specific branch.

#### Image Field Mapping

| Infini field | Transport mapping |
|---|---|
| `quality=auto|low|standard` | KIE `resolution=1K` |
| `quality=medium|hd` | KIE `resolution=2K` |
| `quality=high` | KIE `resolution=4K` |
| `size=WxH` | Reduce to an aspect ratio and require an exact native-Infini subset: Nano Banana allows `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`; GPT Image 2 allows `1:1`, `9:16`, `16:9`, `4:3`, `3:4` |
| missing/`auto` size | KIE `aspect_ratio=auto` |
| `n` | Integer 1-15; create independent KIE tasks with concurrency 2 and preserve response order |
| `response_format` | Only `b64_json` is accepted; the transport downloads provider outputs and returns PNG base64 |
| multipart `image`/`image[]` | Upload and map to `image_input` for Nano Banana or `input_urls` for GPT Image 2 |
| multipart `mask` | Reject with `unsupported_setting` before reservation |

Unknown quality values, unsupported reduced ratios, invalid counts, and non-`b64_json` response formats fail with `422 unsupported_setting` before reservation.

#### Video Field Mapping

| Infini field | Transport mapping |
|---|---|
| `model` | Exact alias selects Seedance `standard` or `fast`; any other ID is rejected |
| `prompt` | KIE prompt, 3-20,000 characters |
| `seconds` | Integer 4-15; values outside the range are rejected rather than clamped again |
| `size=1280x720` | KIE `aspect_ratio=16:9` |
| `size=720x1280` | KIE `aspect_ratio=9:16` |
| any other size | Reject with `unsupported_setting` |
| `resolution_name=480p|720p` | Pass through; any other value is rejected |
| `preset=normal` | Accepted and omitted from KIE payload; any other value is rejected |
| `input_reference[]` | Upload 0-7 images and map to `reference_image_urls` |

Reference video/audio fields are rejected in the first release. The adapter sets no callback URL and uses polling.

### Error Contract

| HTTP | Code | Meaning |
|---|---|---|
| 401 | `invalid_local_token` | Canvas Agent rejected local authentication before the KIE router. |
| 403 | `origin_not_allowed` | Canvas Agent rejected the browser Origin before the KIE router. |
| 409 | `ambiguous_submission` | The request was reserved but provider acceptance cannot be resolved safely; do not auto-retry. |
| 409 | `task_not_ready` | Video content was requested before completion. |
| 422 | `unsupported_model` / `unsupported_setting` / `unsupported_reference` | Adapter validation rejected the request before submission. |
| 402 | `insufficient_credits` | KIE reported insufficient credits. |
| 429 | `kie_rate_limited` | KIE rate or concurrency limit. |
| 422 | `kie_request_rejected` | KIE returned another definite 4xx request rejection. |
| 502 | `kie_upstream_auth` | KIE rejected the server-side provider credential with 401/403. |
| 502 | `kie_upstream_error` | KIE failed or returned an invalid response. |
| 503 | `kie_unconfigured` | Canvas Agent has no server-side KIE key. |
| 504 | `kie_timeout` | Local waiting ended while the provider task remains resumable. |

Every error uses the OpenAI-shaped `{ error: { message, type, param, code } }` envelope. Messages are actionable but omit upstream headers, request bodies, paths, and credentials.

#### Client Error Behavior

| Code | Infini behavior |
|---|---|
| `invalid_local_token`, `origin_not_allowed`, `kie_unconfigured` | Stop and open local Agent/KIE configuration guidance. |
| `unsupported_*` | Keep user input and highlight the rejected field; a new submission requires a new request ID after correction. |
| `ambiguous_submission` | Never auto-retry; show the request ID and the documented recovery command. |
| `task_not_ready`, `kie_timeout` | Continue or resume polling the same request/task ID; never submit again. |
| `insufficient_credits` | Stop and direct the user to KIE billing; a later manual attempt uses a new request ID. |
| `kie_rate_limited`, `kie_upstream_error` | If the journal is `submitted`, resume that task; if it is terminal `failed`, expose a manual new-attempt action that creates a new request ID. |

Canvas Agent returns the same OpenAI error envelope for outer `/kie/*` token and Origin failures; non-KIE Agent routes retain their existing response shape.

#### Upstream Error Classification

Apply the same mapping to the upstream HTTP status and a numeric KIE response-body `code`; an HTTP failure wins when both exist.

| Upstream condition | Transport result | Journal result |
|---|---|---|
| HTTP/body code `401` or `403` | `502 kie_upstream_auth` | `failed` if no task ID; keep `submitted` when polling an existing task |
| HTTP/body code `402` | `402 insufficient_credits` | `failed` if no task ID; keep `submitted` when polling |
| HTTP/body code `429` | `429 kie_rate_limited` | `failed` if no task ID; keep `submitted` when polling |
| Other HTTP/body `4xx` | `422 kie_request_rejected` | `failed` if no task ID; keep `submitted` when polling |
| `AbortError` caused by the configured request timeout | `504 kie_timeout` | keep `submitted`; if acceptance is unknown and no task ID exists, keep `reserved` and return `ambiguous_submission` instead |
| Network failure, HTTP/body `5xx`, non-JSON/malformed success, or unknown exception | `502 kie_upstream_error` | keep `submitted`; if acceptance is unknown and no task ID exists, keep `reserved` and return `ambiguous_submission` instead |
| Valid HTTP/body code `200` with required task/result fields | Continue normal adapter flow | transition monotonically |

Raw message text is used only as a sanitized user-facing detail after the stable code is selected; message substring matching never chooses the classification.

### High-Level Technical Design

```mermaid
flowchart TB
  UI[Infini image and video workbenches] -->|OpenAI-shaped HTTP plus Canvas token| CA[Canvas Agent loopback server]
  CA -->|mounted /kie/v1 handler| KO[@felores/kie-ai-openai-server]
  KO --> KC[KIE private core: schemas, client, tasks, uploads]
  KC --> API[Kie.ai API]
  API --> KC
  KC -->|normalized image bytes or video task/content| UI

  Host[External agent host] --> KM[KIE MCP]
  Host --> IM[Infini MCP]
  KM -->|result URL| Host
  Host -->|asset or canvas operation| IM
```

The repositories remain independently publishable. Paths below are relative to the named repository: **KIE** means `kie-ai-mcp-server`; **Infini** means this repository.

### Implementation Constraints

- Preserve the current static SPA architecture; KIE features require the optional local Canvas Agent.
- Do not modify KIE provider payloads in Infini web code.
- Do not expose raw KIE errors, headers, temporary paths, callback values, database paths, or credentials.
- Keep the initial model allowlist small enough that each adapter can satisfy Infini's existing fields without silently dropping inputs.
- Validate MIME type, file count, per-file size, aggregate size, model capabilities, duration, ratio, and resolution before provider submission where possible.
- Validate result download hosts and redirects before server-side fetches.
- The embedded router contract is an Express-compatible router with no listener, signal handlers, CORS, host policy, or token logic. The standalone binary alone owns those outer concerns.
- Existing user changes in both worktrees must be preserved; implementation must not reformat or rewrite unrelated files.

### Sequencing

1. Define and test the KIE transport contract and security boundary.
2. Implement image and video adapters on the shared KIE core.
3. Publish and inspect the KIE package artifact.
4. Pin and mount that exact package in Canvas Agent.
5. Add Infini channel setup, request correlation, recovery, and browser verification.
6. Complete cross-repository release and documentation checks.

### Pre-Release and Publishing Ownership

- `.github/workflows/canvas-agent-compatibility.yml` is the pre-release owner. It runs on pull requests and pushes to `main` that touch Canvas Agent, KIE compatibility, or related web consumer files, plus manual dispatch.
- The compatibility workflow performs the frozen install, compatibility manifest check, Canvas Agent tests/build, focused web tests/typecheck, and package-content inspection. It creates the publishable Canvas Agent tarball and SHA-256 checksum, then uploads both as an artifact named for the commit SHA.
- `.github/workflows/publish-canvas-agent.yml` becomes a mechanical `workflow_run` consumer of a successful compatibility workflow on `main`. It downloads the artifact for that exact head SHA, verifies the checksum and unpublished package version, and publishes the tarball without installing, building, or testing.
- Branch protection or repository rules require the compatibility workflow before merge. A root Infini release consumes the already-passing commit and does not rerun builds or tests.

### Risks and Mitigations

- **Paid duplicate tasks:** Claim request IDs atomically before submission; resume submitted tasks; block ambiguous reservations rather than resubmit.
- **Journal corruption or concurrent writes:** Hold one data-directory writer lock, serialize per-request updates, require revision matches and monotonic states, use unique temporary names plus flush/rename, validate records on read, and retain terminal records for a bounded period. No shared mutable JSON index is introduced.
- **Unsupported generic fields:** Maintain a model allowlist and reject unsupported masks/references/settings before submission instead of dropping them.
- **Remote media expiry and CORS:** Download through the server and persist bytes in Infini before marking completion.
- **Secret inheritance:** Sanitize child-process environments and add deterministic tests that inspect passed environment keys.
- **Provider/API drift:** Update adapters and publish a new KIE package; existing Infini releases remain on their tested pin.
- **Package/core leakage:** Use pack-content tests to prove the public package contains its bundled runtime and no unpublished workspace dependency.

### Sources and Research

- Infini request contracts: `web/src/services/api/image.ts`, `web/src/services/api/video.ts`, and `web/src/stores/use-config-store.ts`.
- Infini loopback boundary: `canvas-agent/src/http-server.ts`, `canvas-agent/src/config.ts`, and `canvas-agent/src/agents.ts`.
- KIE registry and lifecycle: `packages/core/src/tools/index.ts`, `packages/core/src/context.ts`, `packages/core/src/tools/wait_for_task.ts`, and `packages/core/src/database.ts` in the KIE repository.
- KIE transport precedent: `packages/mcp/src/http-transport.ts` and `.github/workflows/release.yml` in the KIE repository.
- KIE Market API: https://docs.kie.ai/market-api/quickstart
- KIE File Upload API: https://docs.kie.ai/file-upload-api/quickstart
- Nano Banana 2 contract: https://docs.kie.ai/market/google/nano-banana-2
- Seedance 2 contract: https://docs.kie.ai/market/bytedance/seedance-2

---

## Implementation Units

### U1. KIE transport package and security contract

- **Goal:** Create the public KIE-owned package, mountable handler, standalone entrypoint, health contract, authentication, and common OpenAI error envelope.
- **Requirements:** R1-R3, R9-R12, R16.
- **Files:**
  - KIE add: `packages/openai/package.json`, `packages/openai/tsconfig.json`, `packages/openai/build.mjs`, `packages/openai/src/index.ts`, `packages/openai/src/http-server.ts`, `packages/openai/src/standalone.ts`, `packages/openai/README.md`.
  - KIE modify: `package.json`, `package-lock.json`, `packages/core/src/index.ts`.
  - Tests: KIE add `packages/openai/tests/http-security.test.ts`, `packages/openai/tests/package-contract.test.ts`.
- **Approach:** Export an authorization-agnostic router and a separately secured standalone binary; bundle private core code; support an outer mount path; keep the token-protected `/kie/health` payload limited to readiness, contract version, and package version; reuse the MCP transport's host/error-hardening patterns only in the standalone wrapper.
- **Dependencies:** None.
- **Test scenarios:**
  1. Health reveals readiness and versions but no environment values.
  2. Standalone missing/wrong tokens, disallowed hosts, and disallowed origins are rejected.
  3. Embedded router tests prove it delegates outer authorization and does not read a local token.
  4. Oversized JSON/multipart bodies fail before adapter execution.
  5. Packed output runs without resolving unpublished `@felores/kie-ai-core` from npm.
- **Verification:** KIE package tests, typecheck, bundle, and dry-run pack all pass.

### U2. KIE image generation and editing adapters

- **Goal:** Implement the native Infini image contract using selected KIE tools, server-side reference upload, result download, and idempotent task correlation.
- **Requirements:** R1-R8, R19.
- **Files:**
  - KIE add: `packages/openai/src/image-adapters.ts`, `packages/openai/src/uploads.ts`, `packages/openai/src/request-journal.ts`, `packages/openai/tests/image-contract.test.ts`, `packages/openai/tests/request-journal.test.ts`.
  - KIE modify: `packages/openai/src/http-server.ts`, `packages/core/src/kie-ai-client.ts`, `packages/core/src/types.ts` only where transport-neutral helpers are missing.
- **Approach:** Implement `/v1/images/generations` and multipart `/v1/images/edits`; map the exact Initial Model Matrix to registry-backed schemas; upload supported files through KIE; reject masks initially; fan out bounded `n` requests; atomically claim the request ID before provider submission; return OpenAI `data[].b64_json` results.
- **Dependencies:** U1.
- **Test scenarios:**
  1. Text-to-image maps prompt, count, quality, size, and model to the intended KIE adapter.
  2. One reference uses `image`; multiple references use repeated `image[]`; temporary files are cleaned after upload.
  3. Unsupported mask, MIME, count, size, ratio, or model option returns a normalized validation error before task creation.
  4. Concurrent identical request IDs create one journal reservation and at most one provider call.
  5. Concurrent updates serialize; stale revisions and backward/terminal transitions fail without overwriting the newer record.
  6. A `reserved` record without task ID returns `ambiguous_submission`; a `submitted` record resumes the existing task; neither path resubmits.
  7. Multiple provider outputs are downloaded and returned; failed/timeout states normalize without leaking upstream internals.
- **Verification:** KIE image contract tests cover each exposed image model and both generation/edit routes.

### U3. KIE video task, recovery, and content adapters

- **Goal:** Implement Infini's asynchronous video contract with persistent task mapping and durable authenticated content delivery.
- **Requirements:** R1-R8, R19.
- **Files:**
  - KIE add: `packages/openai/src/video-adapters.ts`, `packages/openai/src/result-download.ts`, `packages/openai/tests/video-contract.test.ts`.
  - KIE modify: `packages/openai/src/http-server.ts`, `packages/openai/src/request-journal.ts`, `packages/core/src/kie-ai-client.ts` only for transport-neutral task query helpers.
- **Approach:** Implement video creation, status, and content routes; map the two exact video aliases in the Initial Model Matrix to KIE Seedance standard/fast adapters; persist adapter version and provider task metadata in the request journal; normalize states to Infini's existing pending/completed/failed handling; stream validated completed bytes through `/content`.
- **Dependencies:** U1, U2 for the shared request journal.
- **Test scenarios:**
  1. Video creation maps model, prompt, seconds, size, resolution, and supported image references correctly.
  2. The returned task ID resumes after transport restart and never creates a replacement task during polling.
  3. Waiting/generating/success/failure provider states map to stable OpenAI-shaped states.
  4. `/content` refuses pending/failed tasks, rejects unsafe result hosts/redirects, and streams completed video bytes with the correct content type.
  5. Multi-output or missing-output success responses produce an explicit normalized result rather than persisting an invalid URL.
- **Verification:** KIE video contract tests pass against mocked provider transitions and a restarted task store.

### U4. KIE package release and compatibility surface

- **Goal:** Publish a reproducible transport package and make its version/contract observable to Infini release checks.
- **Requirements:** R13-R16, R20.
- **Files:**
  - KIE modify: `package.json`, `.github/workflows/release.yml`, `README.md`, `CHANGELOG.md`, `AGENTS.md`, `docs/ENDPOINTS.md`.
  - KIE tests: extend `packages/openai/tests/package-contract.test.ts`.
- **Approach:** Give the transport independent semantic versioning. Add it to root build/typecheck/test/bundle commands; publish with provenance and an idempotent version check; inspect packed files; document the route/model matrix, error contract, recovery command, and contract version. The recovery command accepts request ID, provider task ID, and model alias, verifies the provider task, then performs the audited journal repair without submission. A repository tag or manual dispatch checks every public workspace and publishes only package versions not already on npm, so transport-only releases leave unchanged MCP/CLI versions untouched.
- **Dependencies:** U1-U3.
- **Test scenarios:**
  1. Clean checkout build and typecheck succeed before any generated workspace artifacts exist.
  2. Dry-run publish contains the handler, binary, types, README, and license, with no source secrets or private workspace dependency.
  3. Re-running release or publishing a transport-only version skips unchanged MCP/CLI versions.
  4. Runtime health package version matches `packages/openai/package.json`.
  5. Recovery refuses unknown/terminal requests and invalid provider tasks, but repairs a matching ambiguous reservation without calling a generation endpoint.
- **Verification:** Root KIE checks and `npm publish -w @felores/kie-ai-openai-server --dry-run` pass.

### U5. Infini pins and mounts the KIE package securely

- **Goal:** Add the exact dependency, mount it behind Canvas Agent authentication, expose readiness, and prevent credential inheritance.
- **Requirements:** R9-R16, R20.
- **Files:**
  - Infini modify: `canvas-agent/package.json`, `canvas-agent/bun.lock`, `canvas-agent/src/http-server.ts`, `canvas-agent/src/config.ts`, `canvas-agent/src/agents.ts`, `canvas-agent/README.md`, `.github/workflows/publish-canvas-agent.yml`.
  - Infini add: `.github/workflows/canvas-agent-compatibility.yml`.
  - Infini add: `canvas-agent/src/kie-openai.ts`, `canvas-agent/tests/kie-openai.test.ts`.
- **Approach:** Pin the published version exactly; change the Canvas Agent test script to `tsx --test tests/*.test.ts`; instantiate the KIE router only when configured; mount it at `/kie` after the current security middleware; pass explicit KIE options; sanitize all KIE variables from Codex/Claude subprocess environments. The package has no `sqlite3` dependency or install script. Move install/build/test/pack into `canvas-agent-compatibility.yml`; make publishing consume its checksum-verified tarball for the same commit.
- **Dependencies:** U4 and a published package version.
- **Test scenarios:**
  1. Canvas Agent starts normally with KIE unconfigured and reports that state without failing other routes.
  2. Configured startup mounts `/kie/v1/models` and reports the exact pinned package version.
  3. KIE routes enforce the same token and Origin enrollment as other protected Agent routes.
  4. Test doubles for Codex and Claude receive no `KIE_AI_*` or `KIE_MCP_*` variables.
  5. Shutdown closes KIE resources and the Canvas Agent listener.
  6. Clean frozen install runs with scripts disabled and the KIE transport loads without a native dependency.
  7. A failed or missing compatibility artifact prevents publishing; the publish workflow performs no install, build, or test command.
- **Verification:** Canvas Agent tests and build pass from a clean dependency install.

### U6. Infini local KIE channel, recovery, and release checks

- **Goal:** Make the mounted transport usable from native Generate pages without exposing the KIE key or regressing other channels.
- **Requirements:** R4-R8, R10, R13-R20.
- **Files:**
  - Infini modify: `web/src/stores/use-config-store.ts`, `web/src/stores/use-agent-store.ts`, `web/src/components/layout/app-config-modal.tsx`, `web/src/services/api/image.ts`, `web/src/services/api/video.ts`, `web/src/pages/image/index.tsx`, `web/src/pages/video/index.tsx`.
  - Infini tests: extend `web/tests/api-request-shaping.test.ts`, `web/tests/browser-diagnostics.test.ts`, and `web/tests/e2e/smoke.spec.ts`.
  - Infini add: `canvas-agent/kie-compatibility.json`, `scripts/check-kie-compatibility.mjs`, `web/tests/kie-channel.test.ts`.
  - Infini release/docs: `VERSION`, `CHANGELOG.md`, `SECURITY.md`, `docs/content/docs/progress/pending-test.mdx`, `docs/content/docs/progress/todo.mdx`, and relevant Canvas Agent setup documentation.
- **Approach:** Offer a local KIE channel using the connected Agent URL plus `/kie` and the existing Agent token; fetch supported models; present the Error Contract states distinctly. For both media types, create and persist the generation log plus request ID before submission and send that ID as `Idempotency-Key`. After video creation, attach the returned transport task ID to the same `video_generation_logs` record; reload resumes that task. Save terminal media through existing image/media storage. Validate `VERSION`, exact package pin, lockfile resolution, runtime package version, and contract version against `canvas-agent/kie-compatibility.json` in pre-release CI.
- **Dependencies:** U5.
- **Test scenarios:**
  1. Connected/configured users can add or refresh the local KIE channel without entering `KIE_AI_API_KEY` in the browser.
  2. Model aliases classify into image/video lists and do not select the Ark Seedance request path.
  3. Image generation/edit requests include stable request correlation and preserve existing multipart field behavior.
  4. Image generation logs and request IDs are durably written before the first transport/provider call; a failed write prevents submission.
  5. Video logs and request IDs exist before the paid create call; the returned task ID updates the same record; reload resumes it without resubmission.
  6. Disconnected Agent plus every Error Contract code produces a distinct actionable state without raw upstream details.
  7. Existing OpenAI/Gemini image and non-KIE video request-shaping tests remain unchanged and pass.
  8. Browser diagnostics, localStorage, IndexedDB, request logs, and exports contain no KIE provider key.
  9. Pre-release compatibility checks fail on a version range, npm tag, root-version/manifest mismatch, lock mismatch, contract mismatch, or runtime version mismatch.
  10. The compatibility workflow uploads a checksum-paired tarball for the head SHA; mechanical publishing rejects any missing, mismatched, failed, or already-published artifact without rebuilding.
- **Verification:** Focused web unit tests, typecheck, and KIE E2E smoke coverage pass with browser diagnostics enabled.

---

## Verification Contract

| Scope | Command | Proves |
|---|---|---|
| KIE build | `npm run build` | Core, MCP, CLI, and OpenAI transport compile in dependency order. |
| KIE types | `npm run typecheck` | The clean workspace has no build-order-dependent type errors. |
| KIE tests | `npm test` | Root test script explicitly runs core and OpenAI transport tests. |
| KIE package | `npm publish -w @felores/kie-ai-openai-server --dry-run` | Published artifact is complete and self-contained. |
| Canvas Agent tests | `bun run --cwd canvas-agent test` | Mounting, auth, environment isolation, lifecycle, and exact version behavior pass. |
| Canvas Agent build | `bun run --cwd canvas-agent build` | The pinned public package integrates with the shipped Node target. |
| Web unit tests | `bun run --cwd web test:run` | Request shaping, classification, recovery, and diagnostics pass. |
| Web types | `bun run --cwd web typecheck` | Channel and transport changes remain type-safe. |
| Compatibility | `node scripts/check-kie-compatibility.mjs` | Infini `VERSION`, exact manifest pin, lockfile, compatibility manifest, and contract version agree before release. |
| Compatibility CI | `.github/workflows/canvas-agent-compatibility.yml` | The exact commit is installed, verified, tested, built, packed, checksummed, and made available to mechanical publishing. |
| Web E2E | `bun run --cwd web test:e2e --grep KIE` | Native image/video flows work through loopback with release-blocking browser diagnostics. |

Manual validation must use a low-cost KIE model and confirm image generation, multi-reference editing within supported limits, video reload recovery, local result persistence, and secret absence. All build/test/package evidence is produced before the mechanical Infini release workflow; the release workflow itself follows the repository rule and does not compile, test, or build unless the user explicitly requests it.

---

## Definition of Done

- U1-U4 are merged and the exact KIE transport package version is published with provenance.
- U5 pins that exact version in both manifest and lockfile and passes a clean install/load check.
- U6 proves native image and video flows against the pinned package without changing other provider behavior.
- Every requirement maps to at least one passing automated or manual acceptance scenario.
- KIE provider credentials are absent from browser persistence, traffic, logs, exports, and child-agent environments.
- Generated media is saved locally before being treated as durable.
- Sinapso remains an architectural non-change; a read-only final diff/search confirms no KIE dependency, URL, key, MCP registration, or direct call was added there.
- Infini's `CHANGELOG.md` has one `[Added]` Unreleased summary and concrete manual checks are recorded in `docs/content/docs/progress/pending-test.mdx`.
- Unsupported audio, masks, and advanced multimodal video references remain documented in `docs/content/docs/progress/todo.mdx` rather than partially implemented.
- Abandoned adapters, temporary compatibility branches, generated test artifacts, and dead experimental code are removed from both repository diffs.
