# Timescape — Industry Standard Prototype Guide
**Project:** City Through Time — Mozart Wohnhaus, Salzburg  
**Stack:** React + Three.js  
**Date:** June 8, 2026 — Hackathon Prototyping Day  
**Repo:** https://github.com/AwesomeChap/timescape

---

## 1. What We Are Building

A single-page web application that lets a user drag a timeline slider and watch the Mozart Wohnhaus (Tanzmeisterhaus, Makartplatz 8, Salzburg) transform across four historical states — using Three.js for 3D rendering and React for UI.

**The four states:**

| Year | State | 3D Source | Info Panel |
|------|-------|-----------|------------|
| 1617 | Two separate buildings, first documented | Three.js geometry — two separate box meshes | "First documented as two buildings on what was then Hannibalplatz" |
| 1773 | Merged building, Mozart family moves in | Three.js geometry — single unified building, more detail | "Mozart family moves in. Wolfgang composes 232 letters and key symphonies here" |
| 1944 | Two thirds destroyed by Allied bombing | Three.js geometry — only right third remains + rubble + real historical photo | "October 16, 1944 — Allied air raid destroys two thirds of the building" |
| 1996 | Fully reconstructed, reopened as museum | Real 3D scan / detailed Three.js or GLTF from Polycam scan | "Reconstructed true to original plans. Reopened January 26, 1996 as Mozart Museum" |

---

## 2. Repository Structure (Industry Standard)

```
timescape/
├── public/
│   ├── index.html
│   ├── textures/
│   │   ├── stone_wall.jpg          # baroque building facade texture
│   │   ├── rubble.jpg              # for 1944 destroyed state
│   │   └── historic_1944.jpg      # real bomb damage photo (info panel)
│   └── models/
│       └── mozart_wohnhaus.glb    # optional: Polycam scan export
│
├── src/
│   ├── main.jsx                   # app entry point
│   ├── App.jsx                    # root component, layout
│   │
│   ├── features/
│   │   └── timescape/
│   │       ├── TimescapeTimeline.jsx     # ← your existing slider component
│   │       ├── TimescapeScene.jsx        # Three.js canvas wrapper
│   │       ├── TimescapeInfoPanel.jsx    # year + description + photo
│   │       └── timescapeData.js          # historical state definitions
│   │
│   ├── three/
│   │   ├── SceneManager.js         # Three.js scene, camera, renderer, lights
│   │   ├── BuildingStates.js       # geometry definitions for each era
│   │   ├── TransitionManager.js    # crossfade / morph logic between states
│   │   └── PointCloudLoader.js     # loader for real scan data (future)
│   │
│   └── styles/
│       ├── App.css
│       └── timeline.css
│
├── package.json
├── vite.config.js
└── README.md
```

---

## 3. Core Data Model

Define all historical states in one place. Everything else reads from this.

```js
// src/features/timescape/timescapeData.js

export const BUILDING_STATES = [
  {
    id: "1617",
    year: 1617,
    label: "1617 — Two Buildings",
    description:
      "First documented as two separate buildings on Hannibalplatz. The square was a social hub for Salzburg nobility.",
    photo: null,
    color: 0x8b7355,        // sandstone
    geometryType: "two_buildings",
  },
  {
    id: "1773",
    year: 1773,
    label: "1773 — Mozart Moves In",
    description:
      "The Mozart family moves into a spacious 8-room apartment on the first floor. Wolfgang lives here until 1781 and composes prolifically.",
    photo: null,
    color: 0xa0896b,
    geometryType: "full_building",
  },
  {
    id: "1944",
    year: 1944,
    label: "1944 — Bombing",
    description:
      "October 16, 1944. An Allied air raid destroys two thirds of the building. Only the Tanzmeistersaal wing survives.",
    photo: "/textures/historic_1944.jpg",    // real Mozarteum Foundation photo
    color: 0x4a4a4a,
    geometryType: "bombed",
  },
  {
    id: "1996",
    year: 1996,
    label: "1996 — Reconstruction",
    description:
      "Reconstructed true to original plans using authentic materials. Reopened January 26, 1996 as the Mozart Residence Museum.",
    photo: null,
    color: 0xc8a87a,
    geometryType: "reconstructed",           // or "gltf" if scan loaded
  },
];
```

---

## 4. Three.js Building States

Each geometry type maps to a function that returns a `THREE.Group`.

```js
// src/three/BuildingStates.js
import * as THREE from "three";

const WALL_MATERIAL = (color) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05 });

const ROOF_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0x8b4513,
  roughness: 0.9,
});

// Helper: simple building block
function makeBlock(w, h, d, color, x = 0, y = 0, z = 0) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = WALL_MATERIAL(color);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeRoof(w, h, d, x = 0, y = 0, z = 0) {
  const geo = new THREE.CylinderGeometry(0, w * 0.7, h, 4);
  const mesh = new THREE.Mesh(geo, ROOF_MATERIAL);
  mesh.position.set(x, y + h / 2, z);
  mesh.rotation.y = Math.PI / 4;
  return mesh;
}

// ── STATE: 1617 — two separate buildings ──────────────────────────────────
export function buildState1617() {
  const group = new THREE.Group();
  // Left building
  group.add(makeBlock(3, 4, 6, 0x8b7355, -2.5, 0, 0));
  group.add(makeRoof(3, 1.5, 6, -2.5, 4, 0));
  // Right building (slightly smaller)
  group.add(makeBlock(2.5, 3.5, 5, 0x8b7355, 2, 0, 0));
  group.add(makeRoof(2.5, 1.2, 5, 2, 3.5, 0));
  return group;
}

// ── STATE: 1773 — unified Mozart-era building ─────────────────────────────
export function buildState1773() {
  const group = new THREE.Group();
  // Main long body
  group.add(makeBlock(8, 5, 6, 0xa0896b, 0, 0, 0));
  group.add(makeRoof(8, 2, 6, 0, 5, 0));
  // Add windows as thin raised planes
  for (let i = -3; i <= 3; i += 1.5) {
    const windowGeo = new THREE.BoxGeometry(0.6, 0.9, 0.1);
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb });
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.position.set(i, 3, 3.05);
    group.add(win);
  }
  return group;
}

// ── STATE: 1944 — two thirds destroyed ───────────────────────────────────
export function buildState1944() {
  const group = new THREE.Group();
  // Surviving right third only
  group.add(makeBlock(2.5, 5, 6, 0x5a5a5a, 2.5, 0, 0));
  group.add(makeRoof(2.5, 1.5, 6, 2.5, 5, 0));
  // Rubble on left side
  for (let i = 0; i < 12; i++) {
    const size = Math.random() * 0.5 + 0.1;
    const rubble = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      WALL_MATERIAL(0x666666)
    );
    rubble.position.set(
      (Math.random() - 0.5) * 6 - 1.5,
      size / 2,
      (Math.random() - 0.5) * 4
    );
    rubble.rotation.set(
      Math.random(),
      Math.random(),
      Math.random()
    );
    group.add(rubble);
  }
  return group;
}

// ── STATE: 1996 — reconstructed ───────────────────────────────────────────
export function buildState1996() {
  const group = new THREE.Group();
  // Same as 1773 but cleaner, lighter color = new construction
  group.add(makeBlock(8, 5, 6, 0xc8a87a, 0, 0, 0));
  group.add(makeRoof(8, 2, 6, 0, 5, 0));
  // More windows — museum has more openings
  for (let floor = 0; floor < 2; floor++) {
    for (let i = -3; i <= 3; i += 1.2) {
      const windowGeo = new THREE.BoxGeometry(0.6, 0.8, 0.1);
      const windowMat = new THREE.MeshStandardMaterial({ color: 0xadd8e6 });
      const win = new THREE.Mesh(windowGeo, windowMat);
      win.position.set(i, 1.5 + floor * 2, 3.05);
      group.add(win);
    }
  }
  return group;
}

export const STATE_BUILDERS = {
  two_buildings: buildState1617,
  full_building: buildState1773,
  bombed: buildState1944,
  reconstructed: buildState1996,
};
```

---

## 5. Scene Manager

```js
// src/three/SceneManager.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class SceneManager {
  constructor(canvas) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0x1a1a2e);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x1a1a2e, 20, 60);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(12, 8, 12);
    this.camera.lookAt(0, 2, 0);

    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target.set(0, 2, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    this.scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3a })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Current building group
    this.currentBuilding = null;
    this.targetBuilding = null;
    this.transitioning = false;
    this.transitionProgress = 0;

    // Animation loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize(width, height) {
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // Swap building with fade transition
  transitionTo(newGroup, duration = 800) {
    if (this.transitioning) return;

    // Add new group at opacity 0
    newGroup.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0;
      }
    });
    this.scene.add(newGroup);

    const startTime = performance.now();
    const oldGroup = this.currentBuilding;

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Fade in new
      newGroup.traverse((child) => {
        if (child.isMesh) child.material.opacity = t;
      });

      // Fade out old
      if (oldGroup) {
        oldGroup.traverse((child) => {
          if (child.isMesh) {
            child.material.transparent = true;
            child.material.opacity = 1 - t;
          }
        });
      }

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        if (oldGroup) this.scene.remove(oldGroup);
        this.currentBuilding = newGroup;
        this.transitioning = false;
      }
    };

    this.transitioning = true;
    requestAnimationFrame(tick);
  }

  setBuilding(group) {
    if (this.currentBuilding) {
      this.transitionTo(group);
    } else {
      this.scene.add(group);
      this.currentBuilding = group;
    }
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }
}
```

---

## 6. TimescapeScene Component

```jsx
// src/features/timescape/TimescapeScene.jsx
import { useEffect, useRef } from "react";
import { SceneManager } from "../../three/SceneManager";
import { STATE_BUILDERS } from "../../three/BuildingStates";
import { BUILDING_STATES } from "./timescapeData";

export default function TimescapeScene({ activeStateId }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const prevStateId = useRef(null);

  // Init scene once
  useEffect(() => {
    const canvas = canvasRef.current;
    sceneRef.current = new SceneManager(canvas);

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect();
      sceneRef.current.resize(width, height);
    });
    resizeObserver.observe(canvas);

    // Load initial state
    const initial = BUILDING_STATES[0];
    const group = STATE_BUILDERS[initial.geometryType]();
    sceneRef.current.setBuilding(group);
    prevStateId.current = initial.id;

    return () => {
      resizeObserver.disconnect();
      sceneRef.current.dispose();
    };
  }, []);

  // React to state changes
  useEffect(() => {
    if (!sceneRef.current || activeStateId === prevStateId.current) return;

    const stateData = BUILDING_STATES.find((s) => s.id === activeStateId);
    if (!stateData) return;

    const newGroup = STATE_BUILDERS[stateData.geometryType]();
    sceneRef.current.transitionTo(newGroup);
    prevStateId.current = activeStateId;
  }, [activeStateId]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
```

---

## 7. Info Panel Component

```jsx
// src/features/timescape/TimescapeInfoPanel.jsx
export default function TimescapeInfoPanel({ state }) {
  if (!state) return null;

  return (
    <div className="info-panel">
      <div className="info-year">{state.year}</div>
      <div className="info-label">{state.label}</div>
      <p className="info-description">{state.description}</p>
      {state.photo && (
        <div className="info-photo-wrapper">
          <img
            src={state.photo}
            alt={`Historical photo from ${state.year}`}
            className="info-photo"
          />
          <span className="info-photo-credit">
            © International Mozarteum Foundation Salzburg
          </span>
        </div>
      )}
    </div>
  );
}
```

---

## 8. App Layout (Wiring It All Together)

```jsx
// src/App.jsx
import { useState } from "react";
import TimescapeScene from "./features/timescape/TimescapeScene";
import TimescapeTimeline from "./features/timescape/TimescapeTimeline";
import TimescapeInfoPanel from "./features/timescape/TimescapeInfoPanel";
import { BUILDING_STATES } from "./features/timescape/timescapeData";
import "./styles/App.css";

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeState = BUILDING_STATES[activeIndex];

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>City Through Time</h1>
        <span className="app-subtitle">Mozart Wohnhaus · Salzburg</span>
      </header>

      {/* Main view */}
      <main className="app-main">
        <div className="scene-container">
          <TimescapeScene activeStateId={activeState.id} />
        </div>
        <div className="info-container">
          <TimescapeInfoPanel state={activeState} />
        </div>
      </main>

      {/* Timeline at bottom */}
      <footer className="app-footer">
        <TimescapeTimeline
          states={BUILDING_STATES}
          activeIndex={activeIndex}
          onChange={setActiveIndex}
        />
      </footer>
    </div>
  );
}
```

---

## 9. CSS Layout

```css
/* src/styles/App.css */

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0f0f1a;
  color: #f0ece0;
  font-family: 'Inter', sans-serif;
  height: 100vh;
  overflow: hidden;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  padding: 12px 24px;
  background: rgba(0,0,0,0.4);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.app-header h1 {
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.app-subtitle {
  font-size: 0.85rem;
  color: #a89060;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.scene-container {
  flex: 1;
  position: relative;
}

.info-container {
  width: 280px;
  padding: 24px;
  background: rgba(0,0,0,0.3);
  border-left: 1px solid rgba(255,255,255,0.08);
  overflow-y: auto;
}

.app-footer {
  height: 80px;
  background: rgba(0,0,0,0.5);
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  padding: 0 24px;
}

/* Info Panel */
.info-year {
  font-size: 3rem;
  font-weight: 700;
  color: #c8a060;
  line-height: 1;
  margin-bottom: 4px;
}

.info-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #888;
  margin-bottom: 16px;
}

.info-description {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #ccc;
}

.info-photo-wrapper {
  margin-top: 20px;
}

.info-photo {
  width: 100%;
  border-radius: 4px;
  opacity: 0.85;
}

.info-photo-credit {
  display: block;
  font-size: 0.65rem;
  color: #666;
  margin-top: 4px;
}
```

---

## 10. TimescapeTimeline Contract

Your existing `TimescapeTimeline.jsx` should accept these props:

```jsx
<TimescapeTimeline
  states={BUILDING_STATES}     // array of state objects
  activeIndex={number}          // currently selected index
  onChange={(index) => void}    // callback when user selects a state
/>
```

The timeline should render a row of clickable year markers. Clicking or dragging snaps to the nearest state. No continuous slider — discrete stops only, matching the "discrete timeline covering only important incidents" from your original concept.

---

## 11. Running the Project

```bash
npm install
npm run dev
# opens at http://localhost:5173
```

Dependencies needed:
```json
{
  "three": "^0.165.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.0.0"
}
```

---

## 12. What to Demo to the Jury

**The sequence that wins:**

1. Open app — 1617 state visible, two simple buildings
2. Click 1773 — building merges, becomes the Mozart-era house, info panel updates
3. Click 1944 — **two thirds of the building disappear, rubble appears, real historical photo shows in panel** ← this is your moment
4. Click 1996 — building reconstructed, fresh color, museum text
5. Rotate the 3D view to show it's actually 3D

**Say this during the demo:**
> "Every person walking past this building today has no idea it was almost completely destroyed 80 years ago. We made that invisible history visible."

---

## 13. What the 1944 Photo Looks Like

The International Mozarteum Foundation published the actual 1944 bomb damage photo via Google Arts & Culture:

👉 https://artsandculture.google.com/story/owVhZqARk0VRtg

Scroll to the image titled *"Mozart's residence after being hit by a bomb in WWII (1944)"* — download and place in `/public/textures/historic_1944.jpg`.

---

## 14. Future Extensions (Pitch as Vision)

- **Real point cloud data:** Integrate Salzburg city 3D mesh from maps.stadt-salzburg.at/3d/ for the 1996 present state
- **Mobile AR:** Point phone at Makartplatz 8 and see 1944 overlay
- **Crowd navigation:** Use real-time GPS data to route tourists away from crowded spots (already in your pitch deck)
- **Other Salzburg buildings:** Hohensalzburg, Mirabell, Salzburg Cathedral

---

*Document prepared June 8, 2026 — Contextual Experience Engineering Hackathon, Paris Lodron University Salzburg*
