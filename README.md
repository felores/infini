<div align="center">
<pre>
██╗███╗   ██╗███████╗██╗███╗   ██╗██╗
██║████╗  ██║██╔════╝██║████╗  ██║██║
██║██╔██╗ ██║█████╗  ██║██╔██╗ ██║██║
██║██║╚██╗██║██╔══╝  ██║██║╚██╗██║██║
██║██║ ╚████║██║     ██║██║ ╚████║██║
╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝
</pre>

**open-source AI image creation workbench**

*Canvas orchestration · AI generation · Multi-agent collaboration*

🇬🇧 **English**  ·  🇨🇳 [中文](README.zh.md)  ·  🇪🇸 [Español](README.es.md)

</div>

<p align="center">
  <a href="https://render.com/deploy?repo=https://github.com/basketikun/infinite-canvas"><img src="https://img.shields.io/badge/Render-Deploy-46e3b7?style=flat-square&logo=render&logoColor=111111" alt="Deploy to Render"></a>
  <a href="https://github.com/basketikun/infinite-canvas/tags"><img src="https://img.shields.io/github/v/tag/basketikun/infinite-canvas?style=flat-square&label=version" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-f97316?style=flat-square" alt="License"></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://reactrouter.com/"><img src="https://img.shields.io/badge/React_Router-7-ca4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router"></a>
</p>

<p align="center">
  <a href="docs/content/docs/overview/quick-start.mdx">Quick Start</a> · <a href="docs/content/docs/overview/features.mdx">Features</a> · <a href="docs/content/docs/overview/render.mdx">Render Deploy</a> · <a href="docs/content/docs/overview/docker.mdx">Docker Deploy</a> · <a href="docs/content/docs/canvas/canvas-node-manual.mdx">Canvas Node Manual</a> · <a href="docs/content/docs/canvas/canvas-shortcuts.mdx">Canvas Shortcuts</a> · <a href="CLA.md">CLA</a> · <a href="SECURITY.md">Security</a> · <a href="docs/content/docs/progress/todo.mdx">Roadmap</a> · <a href="canvas-agent/README.md">Local Canvas Agent</a> · <a href="plugins/infinite-canvas">Codex App Plugin</a>
</p>

Infinite Canvas is an open-source workbench for image creation. It unifies infinite-canvas orchestration, AI image generation, reference-image editing, a conversation assistant, a prompt library, and material accumulation in one browser interface.

> [!CAUTION]
> This project is in development — no backward compatibility guarantees. Local storage formats may change without notice. Currently best suited for personal / local deployment; not recommended for multi-user public use.
>
> If you need a stable fork, feel free to fork and maintain independently. For PRs and derivative work, please retain original author credits and frontend branding.

## Core Features

- **Infinite Canvas**: multi-canvas projects, node drag & zoom, connections, minimap, undo/redo, import/export.
- **AI Creation**: browser-direct calls to your configured OpenAI-compatible endpoint. Supports text-to-image, image-to-image, reference-image editing, text Q&A, audio and video generation; Seedance 2.0 available via Huoshan Ark Agent Plan.
- **Canvas Assistant**: converse with the assistant around selected nodes and upstream nodes, generate images, and insert results back into the canvas.
- **Local Agent**: connect Codex / Claude Code via the local Canvas Agent over MCP to operate the current canvas.
- **Codex App Plugin**: install the Codex app plugin to auto-register MCP and attempt to start the local agent.
- **Prompt Library**: browser-direct access to multiple open-source GitHub projects, cached to IndexedDB.

Full feature documentation at [Features](docs/content/docs/overview/features.mdx).

Worried about not having an image generation API? Check out this free API project: [chatgpt2api](https://github.com/basketikun/chatgpt2api)

## Quick Start

AI API Key, Base URL, canvases, materials, and generation history are stored locally in the browser by default.

### Local Development

```bash
git clone git@github.com:basketikun/infinite-canvas.git
cd infinite-canvas
cd web
bun install
bun run dev
```

### Docker

```bash
git clone git@github.com:basketikun/infinite-canvas.git
cd infinite-canvas
docker compose up -d
```

Default port is 3000 — visit `http://localhost:3000`.

On first launch, open the configuration in the top-right corner and enter your OpenAI-compatible `Base URL` and `API Key`.

## New API Auto-Configuration

If you use New API, fill in the following under `System Settings → Chat → Add Chat Setting`:

```text
https://canvas.best?apiKey={key}&baseUrl={address}
```

Navigating to this URL will automatically open the configuration dialog with the API Key and Base URL pre-filled.
If self-hosting, replace `https://canvas.best` with your deployment address.

## Screenshots

<table width="100%">
  <tr>
    <td width="50%"><img src="https://i.ibb.co/TDFvGWDT/image.png" alt="image" border="0"></td>
    <td width="50%"><img src="https://i.ibb.co/zVwJq3YS/image.png" alt="image" border="0"></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://i.ibb.co/PvY3qhhK/image.png" alt="image" border="0"></td>
    <td width="50%"><img src="https://i.ibb.co/7D04LwN/image.png" alt="image" border="0"></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://i.ibb.co/bj30FtS5/5.png" alt="5" border="0"></td>
    <td width="50%"><img src="https://i.ibb.co/hxRvjw51/image.png" alt="image" border="0"></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://i.ibb.co/jkWsF8q1/image.png" alt="image" border="0"></td>
    <td width="50%"><img src="https://i.ibb.co/XrnfXHx7/image.png" alt="image" border="0"></td>
  </tr>
</table>

## Contact

Custom development / image generation API inquiries:

Email: 1844025705@qq.com · QQ: 1844025705

## Sponsorship

<div align="center">

If this project helps you, consider sponsoring via AiFaDian. Every bit of support keeps the updates coming!

<br>

<a href="https://ifdian.net/a/basketikun">
  <img src="https://img.shields.io/badge/AiFaDian-Sponsor-946ce6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyMS4zNWwtMS40NS0xLjMyQzUuNCAxNS4zNiAyIDEyLjI4IDIgOC41IDIgNS40MiA0LjQyIDMgNy41IDNjMS43NCAwIDMuNDEuODEgNC41IDIuMDlDMTMuMDkgMy44MSAxNC43NiAzIDE2LjUgMyAxOS41OCAzIDIyIDUuNDIgMjIgOC41YzAgMy43OC0zLjQgNi44Ni04LjU1IDExLjU0TDEyIDIxLjM1eiIvPjwvc3ZnPg==&logoColor=white" alt="AiFaDian Sponsor" />
</a>

<br>
<br>

</div>

Join the QQ group [AI Open Source Exchange](https://qm.qq.com/q/DFnKzZ807u)

## License

Licensed under the GNU Affero General Public License v3.0 — see [LICENSE](LICENSE).

## Star History

<a href="https://www.star-history.com/?repos=basketikun%2Finfinite-canvas&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=basketikun/infinite-canvas&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=basketikun/infinite-canvas&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=basketikun/infinite-canvas&type=date&legend=top-left" />
 </picture>
</a>
