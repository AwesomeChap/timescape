# Timescape

Interactive 3D point-cloud morph of **Salzburg Cathedral** across three historical eras — a hackathon experiment.

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

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

## Timeline

Present → past (left to right): **2024 · 1945 · 1938**

- Drag to orbit, scroll to zoom
- Click timeline dots to morph between eras

## License

MIT
