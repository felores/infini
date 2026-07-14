# CHANGELOG

## Unreleased

+ [Added] Canvas Agent optionally mounts the KIE OpenAI transport at `/kie` behind its existing loopback bearer token when `KIE_AI_API_KEY` is set, with readiness exposed via `/health` and `/config` and `KIE_AI_*` / `KIE_MCP_*` stripped from Codex and Claude subprocess environments.
+ [Fixed] Prevent empty prompt covers and duplicate prompt tags from producing React rendering warnings.
+ [Fixed] Shape image API response fields by model family so GPT Image requests do not send unsupported `response_format`.
+ [Fixed] Encode multiple image-edit references with multipart `image[]` fields while preserving single-image compatibility.
+ [Fixed] Remove perpetual chat message animation and the rapidly changing working indicator that caused visible flicker.
+ [Fixed] Fix source-mode Canvas Agent missing platform Codex dependency and outdated version causing chat request failures; pass through server and subprocess diagnostics.
+ [Optimized] Local dev harness adds Canvas Agent dependency pre-check, private service logs, and browser 500 response body diagnostics.
+ [Fixed] Harden API Key import, local Agent authentication, process startup, and config file permissions to prevent credential leakage and Windows shell injection.
+ [Optimized] Pin Canvas Agent and release workflow dependencies and Action versions; use frozen lockfile for release builds.
+ [Optimized] Clarify local Agent connection instructions: only plugin or manual MCP setup increases Codex token consumption; running the Agent directly is unaffected.
+ [Optimized] Improve local Agent connection instructions to distinguish between Codex plugin launch and direct Agent execution.
+ [Added] Agent chat messages now use streamdown streaming rendering for better long-reply and Markdown content display.
+ [Added] Agent adds site-level tools for canvas, workbench, prompt library, and assets, supporting reading config, triggering generation, and adding assets.
+ [Added] Agent panel becomes a site-wide persistent right sidebar; toggling pushes the top nav and page content with an independent entry button.
+ [Added] Agent adds `site_navigate` tool to jump directly to home, canvas, workbench, assets, and config pages from a conversation.
+ [Added] Agent conversations support one-click stop; the send button turns into a red stop button and interrupts the current Codex turn.
+ [Changed] Codex sessions are now site-level continuous threads, no longer separated by canvas ID; cross-page and cross-canvas share the same context.
+ [Changed] Remove old online canvas assistant logic that called OpenAI responses API from the frontend; unify on MCP + local Codex pipeline.
+ [Added] Canvas nodes support a unified name field displayed above the node; double-click the name to edit directly.
+ [Added] Canvas adds group nodes with drag-in/drag-out grouping, drag-highlight snapping, and child-node movement when moving a group.
+ [Changed] Canvas node top toolbar now shows on click-select instead of hover to avoid frequent pop-ups when moving the mouse over nodes.

## v0.6.0 - 2026-07-09

+ [Added] Add Codex App plugin support.
+ [Added] Add a standalone page for configuration and user preferences with a Codex connection config tab.
+ [Added] Add GitHub Pages frontend static site publish workflow.
+ [Added] Image split supports dragging equal-division lines to adjust, with add, delete, and reset for horizontal/vertical split lines.
+ [Changed] Docker runtime image switched to nginx static hosting.
+ [Changed] Remove website Agent mode, focus on connecting Codex Agent to operate the canvas.
+ [Fixed] Fix image workbench retry success result lost after refresh.
+ [Fixed] Fix Gemini format image generation not passing size ratio config.
+ [Fixed] Fix frontend TypeScript build errors.
+ [Fixed] Fix canvas generation config showing image model when switching to text/video/audio mode.
+ [Fixed] Compat with relay station video tasks returning video URL directly without `/content` endpoint; improve failure reason display.

## v0.5.0 - 2026-07-05

+ [Added] Channel supports Gemini format.
+ [Changed] Migrate frontend from Next.js to Vite; project becomes a static frontend build.
+ [Changed] Remove 404 EvoLinkAI prompt source.

## v0.4.0 - 2026-06-16

+ [Added] Add web Agent Loop mode.
+ [Added] Support Vercel one-click deploy.
+ [Changed] Remove backend; project repositioned as a personal canvas tool.

## v0.3.0 - 2026-06-15

+ [Added] Add canvas-agent to operate canvas via codex.

## v0.2.5 - 2026-06-08

+ [Added] Add image split feature.
+ [Added] Support webdav data sync.
+ [Fixed] Fix canvas text node error.

## v0.2.4 - 2026-06-04

+ [Added] Add image-to-prompt feature.

## v0.2.3 - 2026-06-04

+ [Added] Add image mask local edit feature.
+ [Optimized] Optimize config node @image feature.

## v0.2.2 - 2026-06-04

+ [Added] Add image upscale tool.
+ [Optimized] Optimize image toolbar with custom features.
+ [Fixed] Fix port conflict and pg/mysql uninitialized issues.

## v0.2.1 - 2026-06-03

+ [Added] Add documentation site pages.
+ [Optimized] Optimize canvas connection interaction.
+ [Optimized] Optimize model selection user preferences.

## v0.2.0 - 2026-06-01

+ [Added] Support connection via Volcano Ark AgentPlan.
+ [Added] Video generation supports audio, watermark, and image/video/audio reference inputs.
+ [Added] Canvas adds audio node.
+ [Optimized] Image/video assets support numbered prompt injection like `Image1`.

## v0.1.1 - 2026-05-30

+ [Added] Support New API redirect with auto-fill of Base URL and API Key config.

## v0.1.0 - 2026-05-26

+ [Optimized] Optimize My Canvas and My Assets export features.
+ [Fixed] Fix canvas undo and config node bugs.

## v0.0.9 - 2026-05-26

+ [Added] Add video workbench page.
+ [Fixed] Fix image node size parameter passing.

## v0.0.8 - 2026-05-24

+ [Added] Add user account and compute-point system with username/password registration and Linux.do OAuth.
+ [Added] Admin backend public config supports model compute-point settings and billing queries.
+ [Added] Canvas top-right shows user compute-point balance; generate button shows estimated consumption.
+ [Added] Add video generation node.

## v0.0.7 - 2026-05-23

+ [Added] Admin prompt management supports multi-select batch delete.
+ [Added] Add feature to pull GitHub prompt sources.
+ [Added] Add awesome-gpt-image2-prompts prompt source.
+ [Optimized] Optimize model dropdown style and image edit settings.

## v0.0.6 - 2026-05-22

+ [Added] Admin backend supports configuring model channels; frontend uses backend channel capabilities without authentication.
+ [Optimized] Unify backend error messages, AI proxy, image node generation and retry, missing reference image handling.
+ [Optimized] Backend model proxy path adjusted to OpenAI style.

## v0.0.5 - 2026-05-20

+ [Added] Top-right version number clickable to show version update modal with current/latest version and timeline-organized changelog.
+ [Added] Settings modal supports configuring system prompt auto-attached to AI image generation, edit, and text requests.

## v0.0.4 - 2026-05-20

+ [Changed] Docker runtime entry switched to Next.js serving pages; `/api/*` proxied by Next.js to internal Go service.
+ [Fixed] Fix text copy failure on LAN IP access.

## v0.0.3 - 2026-05-19

+ [Fixed] Update nanoid dependency and change ID generation to prevent failures from crypto module unavailability on other IPs.

## v0.0.2 - 2026-05-19

+ [Added] Add image generation workbench with text-to-image, image-to-image, history viewing, and mobile adaptation.
+ [Fixed] Canvas generation size control supports more common ratios and custom ratio input.
+ [Fixed] Restore drag on config nodes to prevent panel controls from blocking node dragging.
+ [Added] Add Render deployment instructions.

## v0.0.1 - 2026-05-19

+ [Added] Initial open-source release with infinite canvas: multi-canvas projects, node drag/zoom, connections, minimap, undo/redo, import/export.
+ [Added] AI creation: text-to-image, image-to-image, reference image editing, and text Q&A via OpenAI-compatible API.
+ [Added] Canvas assistant: converse around selected and upstream nodes, generate images, and insert results back to canvas.
+ [Added] Prompt library: scrape multiple GitHub open-source projects, organize hundreds of image prompts by case.
