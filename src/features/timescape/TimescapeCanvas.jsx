import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import {
  ERA_COLOR_BUFFERS,
  ERA_POSITIONS,
  MONUMENT_BOUNDS,
  POINT_COUNT,
  lerpColorBuffers,
  lerpEraPositions,
} from './monumentData';

const VERTEX_SHADER = `
  attribute float size;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vLift;
  uniform float pointScale;

  void main() {
    vColor = aColor;
    vLift = position.y;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * pointScale * (340.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vLift;
  uniform float morphMix;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.18, dist);
    float core = 1.0 - smoothstep(0.0, 0.2, dist);
    float lift = smoothstep(-1.4, 2.1, vLift);
    float shimmer = 0.04 * sin(morphMix * 12.566) * (1.0 - morphMix);
    vec3 color = vColor * (0.74 + lift * 0.12 + core * 0.3 + shimmer);
    gl_FragColor = vec4(color, alpha * 0.88);
  }
`;

function createPointSizes(count) {
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const noise = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const r = noise - Math.floor(noise);
    sizes[i] = 0.38 + r * 0.55;
  }
  return sizes;
}

/** Main facade (Makartplatz) faces +Z — theta 0 places camera on that axis. */
const DEFAULT_ORBIT_THETA = 0;
/** ~1.24 rad ≈ 18° above horizon at the look target — front elevation, not top-down. */
const DEFAULT_ORBIT_PHI = 1.24;
/** Frame the whole house including its ground floor and street base. */
const FRAMING_Y_MIN = MONUMENT_BOUNDS.min[1];
const FRAMING_Y_MAX = MONUMENT_BOUNDS.max[1];
const FRAMING_HEIGHT = FRAMING_Y_MAX - FRAMING_Y_MIN;
/** Slightly below geometric center so the silhouette sits centered, not bottom-heavy. */
const FRAMING_CENTER_Y = MONUMENT_BOUNDS.center[1] - MONUMENT_BOUNDS.size[1] * 0.025;
/** Nudge projection upward in the canvas (fraction of viewport height). */
const VIEW_OFFSET_Y = 0.03;

const TimescapeCanvas = forwardRef(function TimescapeCanvas(
  { morphProgress, fromEraIndex, toEraIndex },
  ref
) {
  const rootRef = useRef(null);
  const resetViewRef = useRef(null);
  const morphRef = useRef({ morphProgress, fromEraIndex, toEraIndex });

  morphRef.current = { morphProgress, fromEraIndex, toEraIndex };

  useImperativeHandle(ref, () => ({
    resetView: () => resetViewRef.current?.(),
  }));

  useEffect(() => {
    const container = rootRef.current;
    if (!container) return undefined;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 80);
    const lookTarget = new THREE.Vector3(
      MONUMENT_BOUNDS.center[0],
      FRAMING_CENTER_Y,
      MONUMENT_BOUNDS.center[2]
    );
    const monumentSize = new THREE.Vector3(...MONUMENT_BOUNDS.size);
    const fitPadding = 1.42;

    function getOrbitDistance(aspect) {
      const fovRad = THREE.Math.degToRad(camera.fov);
      const fitHeight = (FRAMING_HEIGHT * fitPadding) / (2 * Math.tan(fovRad / 2));
      const fitWidth = (monumentSize.x * fitPadding) / (2 * Math.tan(fovRad / 2) * aspect);
      return Math.max(fitHeight, fitWidth, monumentSize.z * fitPadding + 2);
    }

    let orbitDistance = getOrbitDistance(1);

    const monumentGroup = new THREE.Group();
    scene.add(monumentGroup);

    const workingPositions = new Float32Array(ERA_POSITIONS[0]);
    const workingColors = new Float32Array(ERA_COLOR_BUFFERS[0]);
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(workingPositions, 3));
    geometry.addAttribute('aColor', new THREE.BufferAttribute(workingColors, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(createPointSizes(POINT_COUNT), 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        morphMix: { value: 0 },
        pointScale: { value: 1 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: true,
      blending: THREE.NormalBlending,
    });

    const points = new THREE.Points(geometry, material);
    monumentGroup.add(points);

    const clock = new THREE.Clock();
    let orbitTheta = DEFAULT_ORBIT_THETA;
    let orbitPhi = DEFAULT_ORBIT_PHI;
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let autoRotate = true;
    let autoRotateTimeout = 0;

    function updateCamera() {
      const x = lookTarget.x + orbitDistance * Math.sin(orbitPhi) * Math.sin(orbitTheta);
      const y = lookTarget.y + orbitDistance * Math.cos(orbitPhi);
      const z = lookTarget.z + orbitDistance * Math.sin(orbitPhi) * Math.cos(orbitTheta);
      camera.position.set(x, y, z);
      camera.lookAt(lookTarget);
    }

    function resize() {
      const width = Math.max(container.clientWidth || 0, 1);
      const height = Math.max(container.clientHeight || 0, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      orbitDistance = getOrbitDistance(width / height);
      camera.setViewOffset(
        width,
        height,
        0,
        Math.round(height * VIEW_OFFSET_Y),
        width,
        height
      );
      camera.updateProjectionMatrix();
      material.uniforms.pointScale.value = Math.max(Math.min(width, height) / 460, 0.58);
      updateCamera();
    }

    function resetView() {
      window.clearTimeout(autoRotateTimeout);
      orbitTheta = DEFAULT_ORBIT_THETA;
      orbitPhi = DEFAULT_ORBIT_PHI;
      orbitDistance = getOrbitDistance(camera.aspect);
      autoRotate = true;
      updateCamera();
    }

    resetViewRef.current = resetView;

    function onPointerDown(event) {
      isDragging = true;
      autoRotate = false;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
    }

    function onPointerMove(event) {
      if (!isDragging) return;
      const dx = event.clientX - lastPointerX;
      const dy = event.clientY - lastPointerY;
      orbitTheta -= dx * 0.005;
      orbitPhi = Math.max(0.15, Math.min(1.35, orbitPhi + dy * 0.004));
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      updateCamera();
    }

    function onPointerUp() {
      isDragging = false;
      autoRotateTimeout = window.setTimeout(() => {
        autoRotate = true;
      }, 4000);
    }

    function onWheel(event) {
      event.preventDefault();
      autoRotate = false;
      orbitDistance = Math.max(
        getOrbitDistance(camera.aspect) * 0.65,
        Math.min(getOrbitDistance(camera.aspect) * 2.4, orbitDistance + event.deltaY * 0.004)
      );
      updateCamera();
      autoRotateTimeout = window.setTimeout(() => {
        autoRotate = true;
      }, 4000);
    }

    container.appendChild(renderer.domElement);
    resize();
    updateCamera();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resize);
    });
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    let frameId = 0;

    const renderLoop = () => {
      const elapsed = clock.getElapsedTime();
      const { morphProgress: progress, fromEraIndex: from, toEraIndex: to } = morphRef.current;

      if (from === to || progress >= 1) {
        workingPositions.set(ERA_POSITIONS[to]);
        workingColors.set(ERA_COLOR_BUFFERS[to]);
      } else {
        lerpEraPositions(from, to, progress, workingPositions);
        lerpColorBuffers(from, to, progress, workingColors);
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.aColor.needsUpdate = true;
      material.uniforms.morphMix.value = progress;

      if (autoRotate && !isDragging) {
        orbitTheta += 0.0018;
        updateCamera();
      }

      monumentGroup.rotation.y = Math.sin(elapsed * 0.15) * 0.015;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      resetViewRef.current = null;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(autoRotateTimeout);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="timescape-canvas"
      role="img"
      aria-label="Interactive point cloud monument morphing across historical eras"
    />
  );
});

export default TimescapeCanvas;
