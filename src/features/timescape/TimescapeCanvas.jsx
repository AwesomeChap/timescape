import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import {
  ERA_VERTEX_COLORS,
  ERA_POSITIONS,
  FRAMING_BOUNDS,
  POINT_COUNT,
  lerpEraVertexColors,
  lerpEraPositions,
} from './monumentData';

const VERTEX_SHADER = `
  attribute float size;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vLift;
  varying float vDepth;
  uniform float pointScale;

  void main() {
    vLift = position.y;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = clamp((-mvPosition.z - 5.0) / 18.0, 0.0, 1.0);
    vColor = aColor;
    gl_PointSize = size * pointScale * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vLift;
  varying float vDepth;
  uniform float morphMix;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.26, dist);
    float core = 1.0 - smoothstep(0.0, 0.22, dist);
    float lift = smoothstep(-1.6, 2.4, vLift);
    vec3 color = vColor * (0.9 + lift * 0.08 + core * 0.14 - vDepth * 0.1);
    gl_FragColor = vec4(color, alpha * 0.9);
  }
`;

function createPointSizes(count) {
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const noise = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const r = noise - Math.floor(noise);
    sizes[i] = 0.24 + r * 0.2;
  }
  return sizes;
}

const DEFAULT_ORBIT_THETA = 0;
const DEFAULT_ORBIT_PHI = 1.18;
const FRAMING_HEIGHT = FRAMING_BOUNDS.size[1];
const FRAMING_CENTER_Y = FRAMING_BOUNDS.center[1];

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

    const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 80);
    const lookTarget = new THREE.Vector3(
      FRAMING_BOUNDS.center[0],
      FRAMING_CENTER_Y,
      FRAMING_BOUNDS.center[2]
    );
    const framingSize = new THREE.Vector3(...FRAMING_BOUNDS.size);
    const fitPadding = 1.48;
    const orbitTiltScale = 1.06;

    function getOrbitDistance(aspect) {
      const fovRad = THREE.Math.degToRad(camera.fov);
      const fitHeight =
        (FRAMING_HEIGHT * fitPadding * orbitTiltScale) / (2 * Math.tan(fovRad / 2));
      const fitWidth =
        (framingSize.x * fitPadding) / (2 * Math.tan(fovRad / 2) * aspect);
      const depthPad = framingSize.z * 0.9 + 1.55;
      return Math.max(fitHeight, fitWidth, depthPad);
    }

    let orbitDistance = getOrbitDistance(1);

    const monumentGroup = new THREE.Group();
    scene.add(monumentGroup);

    const workingPositions = new Float32Array(ERA_POSITIONS[0]);
    const workingColors = new Float32Array(ERA_VERTEX_COLORS[0]);
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
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
      material.uniforms.pointScale.value = Math.max(Math.min(width, height) / 540, 0.42);
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
        workingColors.set(ERA_VERTEX_COLORS[to]);
      } else {
        lerpEraPositions(from, to, progress, workingPositions);
        lerpEraVertexColors(from, to, progress, workingColors);
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.aColor.needsUpdate = true;
      material.uniforms.morphMix.value = progress;

      if (autoRotate && !isDragging) {
        orbitTheta += 0.0018;
        updateCamera();
      }

      monumentGroup.rotation.y = Math.sin(elapsed * 0.15) * 0.012;
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
