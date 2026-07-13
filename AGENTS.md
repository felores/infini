# AGENTS.md

Local repository: `/Users/felo/Documents/GitHub/infini`
Remote repository: `https://github.com/felores/infini`
Upstream repository: `https://github.com/basketikun/infinite-canvas`

These instructions govern AI and automated development in this repository. Follow this file first, then the user's current request.

## Core Principles

- Read the existing code before editing and follow the project's current structure and patterns.
- Keep code changes minimal. Do not introduce complex abstractions when a direct implementation works.
- Prefer mature libraries for standard formats, protocols, parsing, compression, encryption, dates, and similar general-purpose capabilities. Do not reimplement them unless explicitly requested or required by existing project code.
- Do not add branches for speculative compatibility. Implement only the currently defined requirement.
- This project is not yet released. Local persistence formats may change directly without backward-compatible fields or migrations unless explicitly requested.
- Harness policy: after code changes, run the narrowest relevant automated checks. Do not run full production builds unless the user explicitly asks.
- Do not modify unrelated files or perform opportunistic refactors.
- Preserve existing user changes in the worktree. Do not revert or overwrite them; add only the changes required for the task.

## Recurring Feedback

- Add recurring problems or repeated user reminders to this file as durable guidance.
- Write new guidance as explicit, executable rules rather than vague advice.
- Place new rules in the most relevant section; use Project Notes only when no better section exists.

## Frontend Conventions

- The frontend uses Vite, React, React Router, TypeScript, Ant Design, Tailwind, and Zustand.
- For Ant Design work, consult https://ant.design/llms-full.txt for component APIs, examples, and design guidance, then follow the installed antd version and existing project patterns.
- Put external service requests in `web/src/services/api/`. The browser calls these services directly; do not assume a project backend exists.
- Put global or cross-page state in `web/src/stores/`.
- Components should consume existing global stores and hooks directly. Do not thread global state or actions through multiple prop layers merely to keep components pure, and avoid excessive prop counts.
- Global components, constants, and configuration should be imported from their canonical global entry points instead of passed through props or function arguments.
- Repeated UI side effects such as copying or downloading with notifications and shared confirmation dialogs belong in reusable hooks under `web/src/hooks/`. Do not put them in stores unless they are genuinely shared, subscribable state.
- Route pages belong in `web/src/pages/`, layouts in `web/src/layouts/`, and route configuration in `web/src/router.tsx`.
- Canvas pages belong in `web/src/pages/canvas/`, canvas components in `web/src/components/canvas/`, canvas state in `web/src/stores/canvas/`, and canvas utilities in `web/src/lib/canvas/`.
- Organize pages by directory, for example `web/src/pages/image/index.tsx`. When a page has one primary business component, keep it in the page entry instead of adding a separate Manager component with many props.
- Do not add components that only forward children or rename and pass through props. Use the underlying component directly or keep the logic in the current file.
- Page-private hooks belong in their page directory, for example `admin/assets/use-admin-assets.ts`. Move hooks to the shared `hooks/` directory only after multiple pages actually reuse them.
- Admin page-private components belong under each page's `components/` directory, for example `admin/assets/components/` or `admin/prompts/components/`. Do not put single-page components in `admin/components/`.
- Configure admin themes, backgrounds, card shadows, and table colors centrally in `web/src/lib/app-theme.ts`, `AppProviders`, or a necessary global CSS scope. Page-private components should not implement their own `dark ? ...` theme branches.
- Prefer function components and existing hooks. Do not add another large state-management system.
- Prefer `lucide-react` or the Ant Design icons already used by the project.
- Keep user-facing page copy in English.
- Do not accumulate unrelated logic in components. Move genuinely complex logic into a same-directory utility or small component.
- Let components own their styles. Prefer Tailwind classes or small inline styles for private styling; do not add large global CSS blocks for one component.
- Reserve global CSS for foundational variables, resets, cross-page styles, and necessary third-party overrides. Do not accumulate page-private styles in `globals.css`.
- Keep code short and direct. Avoid unnecessary component splitting, deep prop chains, and abstraction that adds more code than it removes.
- Use `localforage` for browser-persisted business data. Reserve `localStorage` for tiny configuration values; do not store business lists, generation history, images, base64 data, or large JSON in it.

## Canvas UI Conventions

- Canvas UI work must follow the current canvas theme.
- Prefer `canvasThemes`, `useThemeStore`, or Ant Design `ConfigProvider` tokens.
- Do not hardcode black, white, stone, slate, or similar colors in ways that break light and dark themes.
- Reuse the existing toolbar, node panel, and Modal visual language for new canvas buttons, dialogs, and overlays.
- Keep top canvas controls and status information minimal and flat: no borders, shadows, or pill backgrounds; blend them into the canvas, keep visual weight low, and use only subtle hover feedback.
- Preserve image aspect ratios unless the feature explicitly requires freeform distortion.
- Keep batch generation, multi-image displays, and assistant panels compact so they do not consume unnecessary canvas space.

## Documentation Conventions

- Keep README concise: project overview, core features, quick start, and documentation links only.
- Keep the AI-facing documentation index at `docs/index.md`, not under `docs/content/docs/`.
- Put detailed feature documentation in `docs/content/docs/overview/features.mdx`.
- Put future work in `docs/content/docs/progress/todo.mdx`.
- Put implemented changes that still require user validation in `docs/content/docs/progress/pending-test.mdx`.
- Use `docs/content/docs/progress/pending-test.mdx` for the concrete, testable changes in the current version. Keep `CHANGELOG.md` Unreleased entries as version-level summaries rather than duplicating implementation details.
- After a major user-visible feature, interface, or tool change, add one English summary line under `CHANGELOG.md` Unreleased with the appropriate literal prefix: `[Added]`, `[Changed]`, `[Fixed]`, or `[Optimized]`. Internal refactors, formatting, and invisible changes do not need entries.
- When a todo is implemented, move it from `docs/content/docs/progress/todo.mdx` to `docs/content/docs/progress/pending-test.mdx`. Update `docs/content/docs/overview/features.mdx` only after the user confirms testing passed.
- Before completing a task, check whether `docs/content/docs/progress/todo.mdx` and `docs/content/docs/progress/pending-test.mdx` need updates. Confirm no update is needed when functionality and planned work are unchanged.
- Do not add expiration dates to documentation unless the user explicitly requests a specific date.

## Release Workflow

- Move the current `CHANGELOG.md` Unreleased entries into a new version section and leave an empty Unreleased heading.
- Increment the current version and update the root `VERSION` file.
- Commit all current uncommitted code.
- Tag that commit with the corresponding version, for example `v0.0.5`.
- Do not compile, test, or build during the release workflow unless the user explicitly asks.

## Project Notes

- Canvas projects and My Assets are stored primarily in the browser. Do not claim that cloud synchronization is supported.
- The AI API key is stored in the browser and used for direct frontend requests to OpenAI-compatible endpoints. State this clearly in security documentation.
- Docker static asset paths remain unverified work. Do not overstate production deployment readiness.

## What Infinite Canvas Is

Infinite Canvas is an open-source workbench for image creation. It unifies infinite-canvas orchestration, AI image generation, reference-image editing, a conversation assistant, a prompt library, and material accumulation in one browser interface. Product branding is "Infinite Canvas"; the fork is `felores/infini`, based on `basketikun/infinite-canvas`.

## Strategic Context

- **Why**: let a single person explore visual directions and iterate image results continuously without juggling separate tools.
- **Target user**: individual creators doing AI image generation and visual exploration; local/personal deployment, not multi-tenant public use.
- **Functional success**: user can create canvas projects, arrange nodes, generate/edit images via their own OpenAI-compatible API, converse with an assistant around selected nodes, and persist everything locally.
- **No quantitative metric** is tracked.
- **Anti-scope**: no server-side database, no user accounts/auth, no cloud sync of canvas/materials, no backward-compatible data migration (pre-launch; formats may change).
- **Constraints**: the AI API key lives in the browser; the local Canvas Agent is optional and loopback-only.

## Tech Stack

- **web/**: Vite 7, React 19, React Router 7, TypeScript 5, Ant Design 6, Tailwind 4, Zustand, localforage, Bun (package manager).
- **canvas-agent/**: Node + Express 5, TypeScript, `@modelcontextprotocol/sdk`, `@openai/codex`; runs as a local loopback HTTP/MCP server.
- **docs/**: Next.js + Fumadocs MDX.
- **Root**: Docker, Render (`render.yaml`), Vercel config, Nginx.

## Infrastructure

- No server database and no authentication. The web app is a static SPA; canvas projects, materials, generation history, and the AI API key persist in the browser (localforage / IndexedDB).
- The browser frontend calls OpenAI-compatible endpoints directly using a user-supplied key held in-browser.
- The optional local Canvas Agent binds to `127.0.0.1` only and is token-gated; it is not part of the deployed static site.
- Deployment: static build of `web/` (Vite) served via Docker/Nginx, Render, or Vercel.

## Database Schema

Browser persistence only. Canvas projects, image/media blobs, prompt caches, and generation records are stored via localforage (IndexedDB). Small config values use `localStorage`. There is no server-side schema; local storage formats may change between versions without migration.

## API Routes

The web app has no server routes. The optional local Canvas Agent (`canvas-agent/src/http-server.ts`) exposes loopback-only HTTP routes:

- **Health/config**: `GET /health`, `GET /config`
- **Events**: `GET /events` (SSE)
- **Canvas sync**: `POST /canvas/state`, `POST /canvas/result`
- **Tools**: `POST /api/tools`
- **Codex agent**: `GET /agent/codex/workspace`, `GET /agent/codex/threads`, `POST /agent/codex/threads/new`, `GET /agent/codex/threads/:threadId`, `POST /agent/codex/threads/:threadId/resume`, `POST /agent/codex/threads/:threadId/delete`, `POST /agent/codex/turn`, `POST /agent/codex/interrupt`
- **Claude agent**: `POST /agent/claude/turn`

All routes except `/health` and `/config` require a valid `x-canvas-agent-token` header.

## File Organization

- `web/` - Vite SPA (the product).
  - `src/pages/` route pages; `src/pages/canvas/` canvas pages.
  - `src/components/canvas/` canvas components.
  - `src/stores/` global state (Zustand); `src/stores/canvas/` canvas state.
  - `src/lib/canvas/` canvas utilities; `src/lib/agent/` agent URL guards.
  - `src/services/api/` external service calls (browser-direct).
  - `tests/` Vitest unit tests; `tests/e2e/` Playwright E2E.
- `canvas-agent/` - local loopback agent (Express + MCP).
- `docs/` - Fumadocs documentation site.
- `plugins/infinite-canvas/` - Codex app plugin + MCP skill.
- `.harness/` - harness bootstrap (`init.sh`).
- `docs/brainstorms`, `docs/plans`, `docs/designs`, `docs/solutions` - planning artifacts.

## Key Architecture Decisions

- **Browser-first persistence**: no server DB keeps the deploy a static SPA; trade-off is no cross-device sync.
- **API key in browser**: user owns their key; trade-off is the key is exposed to the browser context (documented in SECURITY.md).
- **Loopback-only agent**: the local Canvas Agent binds `127.0.0.1` and uses a token to prevent remote abuse.
- **No backward-compatible migration**: pre-launch, local storage formats change freely.
- **Bun as web package manager**: faster installs; the stale `package-lock.json` was removed to avoid drift.

## Development Commands

Run these commands from the repository root. The three packages are independent.

```bash
# Web app
bun install --cwd web
bun run --cwd web dev       # Vite development server on port 51309
bun run --cwd web build
bun run --cwd web start     # Preview the production build on port 51309
bun run --cwd web typecheck
bun run --cwd web test:run  # Vitest
bun run --cwd web test:e2e  # Playwright

# Local Canvas Agent
bun install --cwd canvas-agent
bun run --cwd canvas-agent dev
bun run --cwd canvas-agent build
bun run --cwd canvas-agent start

# Documentation site
bun install --cwd docs
bun run --cwd docs dev
bun run --cwd docs build
```

## Testing Strategy

- **Vitest** (node environment) for pure TypeScript logic under `tests/**/*.test.ts` (excludes `tests/e2e/**`).
- **Playwright E2E** for rendered UI under `tests/e2e/**` (Chromium only, dev server on `127.0.0.1:51309`).
- No jsdom component runner by default; `.tsx` component tests are opt-in (add `@testing-library/react` only when needed).
- **Browser diagnostics** (`console.error`, `pageerror`, `requestfailed`, HTTP >=500 with up to 4 KB of response body) are captured in every E2E test and fail the run unless explicitly allowlisted. This is release-blocking.
- `.harness/init.sh` installs locked dependencies for both the web app and Canvas Agent, then stores private service logs and PID files under `.harness/`.

## Development Harness

| Skill | Trigger |
|-------|---------|
| `harness-init` | new/unconfigured repo; "bootstrap", "audit the project" |
| `harness-preview` | before any UI feature; "design this", "mockup" |
| `harness-progress` | spec or plan exists; "what's next", "track features" |
| `harness-verify` | after implementing a feature; "verify everything", "check my work" |

**Release-blocking rule**: every E2E run must assert browser diagnostics; unallowlisted `console.error` / `pageerror` / `requestfailed` / HTTP >=500 entries fail the release.

## Domain Glossary

- **Canvas project**: a single infinite canvas with its nodes, edges, and metadata, persisted in IndexedDB.
- **Node**: a draggable element on the canvas (image, text, etc.).
- **Canvas Agent**: the optional local loopback HTTP/MCP server that lets Codex/Claude operate the current canvas.
- **Loopback URL**: a URL whose host is `127.0.0.1`, `localhost`, or `[::1]`; only loopback URLs are accepted by the agent URL guard.
- **OpenAI-compatible endpoint**: a Base URL + API Key the user configures for image/text generation; the browser calls it directly.
- **Material**: accumulated image/media assets saved in the browser.
