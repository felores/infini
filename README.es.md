<p align="center">
  <img src="web/public/logo.svg" width="96" alt="Logo de Infinite Canvas">
</p>

<h1 align="center">Infinite Canvas</h1>

<p align="center">
  <a href="README.md">English</a> · <a href="README.zh.md">中文</a>
</p>

<p align="center">
  <a href="https://linux.do/"><img src="https://img.shields.io/badge/Linux.do-Community-2b6de8?style=flat-square" alt="Linux.do"></a>
  <a href="https://render.com/deploy?repo=https://github.com/basketikun/infinite-canvas"><img src="https://img.shields.io/badge/Render-Deploy-46e3b7?style=flat-square&logo=render&logoColor=111111" alt="Deploy to Render"></a>
  <a href="https://github.com/basketikun/infinite-canvas"><img src="https://img.shields.io/github/stars/basketikun/infinite-canvas?style=flat-square&logo=github" alt="GitHub stars"></a>
  <a href="https://github.com/basketikun/infinite-canvas/tags"><img src="https://img.shields.io/github/v/tag/basketikun/infinite-canvas?style=flat-square&label=version" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-f97316?style=flat-square" alt="License"></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://reactrouter.com/"><img src="https://img.shields.io/badge/React_Router-7-ca4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router"></a>
</p>

<p align="center">
  <a href="docs/content/docs/overview/quick-start.mdx">Inicio Rápido</a> · <a href="docs/content/docs/overview/features.mdx">Funciones</a> · <a href="docs/content/docs/overview/render.mdx">Despliegue en Render</a> · <a href="docs/content/docs/overview/docker.mdx">Despliegue en Docker</a> · <a href="docs/content/docs/canvas/canvas-node-manual.mdx">Manual de Nodos</a> · <a href="docs/content/docs/canvas/canvas-shortcuts.mdx">Atajos</a> · <a href="CLA.md">CLA</a> · <a href="SECURITY.md">Seguridad</a> · <a href="docs/content/docs/progress/todo.mdx">Hoja de Ruta</a> · <a href="canvas-agent/README.md">Canvas Agent Local</a> · <a href="plugins/infinite-canvas">Plugin Codex App</a>
</p>

Infinite Canvas es un banco de trabajo de código abierto para la creación de imágenes. Unifica orquestación de lienzo infinito, generación de imágenes por IA, edición de imágenes de referencia, un asistente conversacional, una biblioteca de prompts y acumulación de materiales en una sola interfaz de navegador.

> [!CAUTION]
> Este proyecto está en desarrollo — no hay garantías de compatibilidad hacia atrás. Los formatos de almacenamiento local pueden cambiar sin previo aviso. Actualmente es más adecuado para uso personal o local; no se recomienda para uso público multiusuario.
>
> Si necesitas un fork estable, siéntete libre de hacer fork y mantenerlo de forma independiente. Para PRs y trabajo derivado, por favor conserva los créditos del autor original y la marca visual.

## Funciones Principales

- **Lienzo Infinito**: proyectos con múltiples lienzos, arrastrar y soltar nodos, conexiones, minimapa, deshacer/rehacer, importar/exportar.
- **Creación con IA**: llamadas directas desde el navegador a endpoints compatibles con OpenAI. Soporta texto-a-imagen, imagen-a-imagen, edición de imágenes de referencia, preguntas y respuestas de texto, generación de audio y video; Seedance 2.0 disponible mediante Huoshan Ark Agent Plan.
- **Asistente de Lienzo**: conversa con el asistente sobre los nodos seleccionados y sus nodos upstream, genera imágenes e inserta los resultados de vuelta en el lienzo.
- **Agente Local**: conecta Codex / Claude Code a través del Canvas Agent local mediante MCP para operar el lienzo actual.
- **Plugin Codex App**: instala el plugin de la app Codex para registrar MCP automáticamente e intentar iniciar el agente local.
- **Biblioteca de Prompts**: acceso directo desde el navegador a múltiples proyectos open-source de GitHub, almacenados en caché en IndexedDB.

Documentación completa en [Funciones](docs/content/docs/overview/features.mdx).

¿Te preocupa no tener una API de generación de imágenes? Prueba este proyecto gratuito: [chatgpt2api](https://github.com/basketikun/chatgpt2api)

## Inicio Rápido

La API Key, Base URL, lienzos, materiales e historial de generación se almacenan localmente en el navegador por defecto.

### Desarrollo Local

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

Puerto predeterminado: 3000 — visita `http://localhost:3000`.

En el primer inicio, abre la configuración en la esquina superior derecha e ingresa tu `Base URL` y `API Key` compatibles con OpenAI.

## Configuración Automática con New API

Si usas New API, completa lo siguiente en `Configuración del Sistema → Chat → Agregar Configuración de Chat`:

```text
https://canvas.best?apiKey={key}&baseUrl={address}
```

Al navegar a esta URL se abrirá automáticamente el diálogo de configuración con la API Key y Base URL pre-cargadas.
Si tienes tu propio despliegue, reemplaza `https://canvas.best` con tu dirección.

## Capturas de Pantalla

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

## Contacto

Consultas sobre desarrollo personalizado / API de generación de imágenes:

Email: 1844025705@qq.com · QQ: 1844025705

## Patrocinio

<div align="center">

Si este proyecto te es útil, considera patrocinar a través de AiFaDian. ¡Cada aporte mantiene las actualizaciones en marcha!

<br>

<a href="https://ifdian.net/a/basketikun">
  <img src="https://img.shields.io/badge/AiFaDian-Sponsor-946ce6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyMS4zNWwtMS40NS0xLjMyQzUuNCAxNS4zNiAyIDEyLjI4IDIgOC41IDIgNS40MiA0LjQyIDMgNy41IDNjMS43NCAwIDMuNDEuODEgNC41IDIuMDlDMTMuMDkgMy44MSAxNC43NiAzIDE2LjUgMyAxOS41OCAzIDIyIDUuNDIgMjIgOC41YzAgMy43OC0zLjQgNi44Ni04LjU1IDExLjU0TDEyIDIxLjM1eiIvPjwvc3ZnPg==&logoColor=white" alt="AiFaDian Sponsor" />
</a>

<br>
<br>

</div>

## Comunidad

Aprende IA en [LinuxDO](https://linux.do/)

Únete al grupo QQ [AI Open Source Exchange](https://qm.qq.com/q/DFnKzZ807u)

## Licencia

Licenciado bajo GNU Affero General Public License v3.0 — ver [LICENSE](LICENSE).

## Historial de Estrellas

<a href="https://www.star-history.com/?repos=basketikun%2Finfinite-canvas&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=basketikun/infinite-canvas&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=basketikun/infinite-canvas&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=basketikun/infinite-canvas&type=date&legend=top-left" />
 </picture>
</a>
