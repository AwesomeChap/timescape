import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import {
  ERA_COLORS,
  ERA_POSITIONS,
  MONUMENT_BOUNDS,
  POINT_COUNT,
  lerpEraColors,
  lerpEraPositions,
} from './monumentData';

const VERTEX_SHADER = `
  attribute float size;
  attribute float seed;
  varying vec3 vColor;
  varying float vDepth;
  varying float vLift;
  varying float vSeed;
  uniform vec3 tint;
  uniform float pointScale;

  vec3 materialColor(vec3 p) {
    float roof = smoothstep(4.65, 5.9, p.y);
    float ground = 1.0 - smoothstep(0.0, 0.2, p.y);
    float rubble = (1.0 - smoothstep(1.2, 2.1, p.y)) * smoothstep(-4.2, -0.2, -p.x);
    float front = smoothstep(2.75, 3.12, p.z);
    float windowBand = smoothstep(1.05, 1.45, p.y) * (1.0 - smoothstep(1.95, 2.35, p.y));
    windowBand += smoothstep(2.65, 2.95, p.y) * (1.0 - smoothstep(3.55, 3.95, p.y));
    float windowGlint = front * windowBand * step(0.64, fract(abs(p.x) * 1.85 + 0.18));

    vec3 wallTone = tint * (0.86 + 0.2 * seed);
    vec3 roofTone = vec3(0.34, 0.18, 0.12);
    vec3 stoneTone = vec3(0.28, 0.27, 0.24);
    vec3 glassTone = vec3(0.08, 0.16, 0.19);

    vec3 color = mix(wallTone, roofTone, roof);
    color = mix(color, stoneTone, max(ground * 0.72, rubble * 0.58));
    color = mix(color, glassTone, windowGlint * 0.92);
    return color;
  }

  void main() {
    vLift = position.y;
    vSeed = seed;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = clamp((-mvPosition.z - 5.0) / 19.0, 0.0, 1.0);
    vColor = materialColor(position);
    gl_PointSize = size * pointScale * (420.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vDepth;
  varying float vLift;
  varying float vSeed;
  uniform float morphMix;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    float softDisc = smoothstep(0.5, 0.24, dist);
    float denseCore = 1.0 - smoothstep(0.0, 0.18, dist);
    float heightLight = smoothstep(0.15, 5.7, vLift);
    float transitionDust = sin((vSeed + morphMix) * 18.8496) * 0.025 * (1.0 - abs(morphMix - 0.5) * 2.0);
    vec3 color = vColor * (0.62 + heightLight * 0.34 + denseCore * 0.2 - vDepth * 0.18 + transitionDust);
    float alpha = softDisc * (0.82 - vDepth * 0.18);
    gl_FragColor = vec4(color, alpha);
  }
`;

function createPointSizes(count) {
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const noise = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const random = noise - Math.floor(noise);
    sizes[i] = 0.22 + random * 0.34;
  }
  return sizes;
}

function createPointSeeds(count) {
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const noise = Math.sin(i * 4.1414 + 23.42) * 9721.173;
    seeds[i] = noise - Math.floor(noise);
  }
  return seeds;
}

const DEFAULT_ORBIT_THETA = 0;
const DEFAULT_ORBIT_PHI = 1.22;
const FRAMING_Y_MIN = Math.max(MONUMENT_BOUNDS.min[1], -0.15);
const FRAMING_Y_MAX = MONUMENT_BOUNDS.max[1];
const FRAMING_HEIGHT = FRAMING_Y_MAX - FRAMING_Y_MIN;
const FRAMING_CENTER_Y = MONUMENT_BOUNDS.center[1] - MONUMENT_BOUNDS.size[1] * 0.02;
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
    scene.fog = new THREE.Fog(0x080808, 16, 42);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 80);
    const lookTarget = new THREE.Vector3(
      MONUMENT_BOUNDS.center[0],
      FRAMING_CENTER_Y,
      MONUMENT_BOUNDS.center[2]
    );
    const monumentSize = new THREE.Vector3(...MONUMENT_BOUNDS.size);
    const fitPadding = 1.38;

    function getOrbitDistance(aspect) {
      const fovRad = THREE.Math.degToRad(camera.fov);
      const fitHeight = (FRAMING_HEIGHT * fitPadding) / (2 * Math.tan(fovRad / 2));
      const fitWidth = (monumentSize.x * fitPadding) / (2 * Math.tan(fovRad / 2) * aspect);
      return Math.max(fitHeight, fitWidth, monumentSize.z * fitPadding + 1.2);
    }

    let orbitDistance = getOrbitDistance(1);

    const monumentGroup = new THREE.Group();
    scene.add(monumentGroup);

    const workingPositions = new Float32Array(ERA_POSITIONS[0]);
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(workingPositions, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(createPointSizes(POINT_COUNT), 1));
    geometry.addAttribute('seed', new THREE.BufferAttribute(createPointSeeds(POINT_COUNT), 1));

    const tint = new THREE.Vector3(...ERA_COLORS[0]);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tint: { value: tint },
        morphMix: { value: 1 },
        pointScale: { value: 1 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: true,
      depthTest: true,
      blending: THREE.NormalBlending,
    });

    const scan = new THREE.Points(geometry, material);
    monumentGroup.add(scan);

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
      material.uniforms.pointScale.value = Math.max(Math.min(width, height) / 360, 0.76);
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
      container.setPointerCapture?.(event.pointerId);
    }

    function onPointerMove(event) {
      if (!isDragging) return;
      const dx = event.clientX - lastPointerX;
      const dy = event.clientY - lastPointerY;
      orbitTheta -= dx * 0.005;
      orbitPhi = Math.max(0.2, Math.min(1.38, orbitPhi + dy * 0.004));
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      updateCamera();
    }

    function onPointerUp(event) {
      isDragging = false;
      container.releasePointerCapture?.(event.pointerId);
      autoRotateTimeout = window.setTimeout(() => {
        autoRotate = true;
      }, 4200);
    }

    function onWheel(event) {
      event.preventDefault();
      autoRotate = false;
      const baseDistance = getOrbitDistance(camera.aspect);
      orbitDistance = Math.max(
        baseDistance * 0.68,
        Math.min(baseDistance * 2.25, orbitDistance + event.deltaY * 0.004)
      );
      updateCamera();
      autoRotateTimeout = window.setTimeout(() => {
        autoRotate = true;
      }, 4200);
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
        tint.set(...ERA_COLORS[to]);
      } else {
        lerpEraPositions(from, to, progress, workingPositions);
        const colorScratch = [0, 0, 0];
        lerpEraColors(from, to, progress, colorScratch);
        tint.set(...colorScratch);
      }

      geometry.attributes.position.needsUpdate = true;
      material.uniforms.morphMix.value = progress;
      material.uniforms.tint.value.copy(tint);

      if (autoRotate && !isDragging) {
        orbitTheta += 0.0011;
        updateCamera();
      }

      monumentGroup.rotation.y = Math.sin(elapsed * 0.12) * 0.008;
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
      aria-label="Interactive 3D point-cloud scan of Mozart Wohnhaus across historical eras"
    />
  );
});

export default TimescapeCanvas;
