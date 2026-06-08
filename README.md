# Timescape

Interactive 3D point-cloud morph of the **Mozart-Wohnhaus** (Mozart Residence, Makartplatz 8, Salzburg) across four historical states — a hackathon experiment.

## Stack

- React 18 + Vite
- Three.js (WebGL point cloud)
- Procedural monument geometry (~270k points) with era morphing

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

Chronological (left to right): **1773 original · 1944 destroyed · 1952 office block · 1996 reconstructed**

- Drag to orbit, scroll to zoom
- Click timeline dots to morph between states

## License

MIT
