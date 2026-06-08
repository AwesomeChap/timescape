# Timescape

Interactive 3D point-cloud morph of **Mozart's Wohnhaus** across five historical eras — a hackathon experiment.

## Stack

- React 18 + Vite
- Three.js (WebGL point-cloud morph)
- Procedural point-cloud monument with per-era vertex colours across five timelines

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static host, or use [Render](#deploy-on-render) below.

## Deploy on Render

This repo includes a [`render.yaml`](render.yaml) blueprint for a **Static Site**.

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In the [Render dashboard](https://dashboard.render.com/), click **New** → **Blueprint**.
3. Connect the repo and apply the blueprint. Render will create a static site with:
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
4. After the first deploy finishes, open the `*.onrender.com` URL Render assigns.

**Manual setup** (without Blueprint): **New** → **Static Site** → connect the repo, then set:

| Setting | Value |
|--------|--------|
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |

Optional: add a custom domain under the site’s **Settings** → **Custom Domains** (e.g. a subdomain pointing at Render).

## Timeline

Present → past (left to right): **1994 · 1952 · 1944 · 1685 · 1617**

- Drag to orbit, scroll to zoom
- Click timeline dots to morph between eras

## License

MIT
