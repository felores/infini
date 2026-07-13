---
name: canvas
description: Operate the Infinite Canvas current web canvas: read nodes, selection, create text nodes, create generation flows, connect nodes, or trigger generation.
---

# Infinite Canvas

You are helping the user operate the Infinite Canvas web canvas. When you need to understand or modify the canvas, prefer using the configured `infinite-canvas` MCP tools; do not ask the user to manually copy JSON, URLs, or tokens.

## Workflow

- If the user has not yet opened or connected to the web canvas, use the `open-canvas` skill to open Infinite Canvas; do not ask the user to manually copy URLs or tokens.
- Before operating, first use `canvas_get_state` to read the current canvas; if the user explicitly mentions selected content, current nodes, or "this", first use `canvas_get_selection`.
- For creating single text content, prefer `canvas_create_text_node`.
- For creating generation content, prefer `canvas_generate_text`, `canvas_generate_image`, `canvas_generate_video`, `canvas_generate_audio`.
- When you need to chain prompts, config, and generation nodes into a flow, use `canvas_create_generation_flow` or existing flow tools.
- When you need to batch add/delete/modify, move, connect nodes, or set the viewport, use `canvas_apply_ops`.
- Do not simulate mouse clicks; do not ask the user to manually copy JSON.
- Write operations to the canvas will be confirmed a second time by the web sidebar; proceed based on the current tool result.

## Style

- Default to English for page copy and canvas node content.
- Generation nodes, config nodes, and prompt nodes should maintain clear structure for easy further editing.
- When batch-creating nodes, leave spacing between nodes; do not stack them at the same position.
- Image, video, audio, and other media nodes preserve original aspect ratio by default; only change the ratio when the user explicitly requests freeform distortion.
- Keep generation flows minimal and clear; the user should be able to understand node relationships at a glance.
