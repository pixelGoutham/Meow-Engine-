// src/components/UniverseCanvas.tsx
import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useUniverseStore, type ModelId, type SceneType } from '../store/useUniverseStore';

const PARTICLE_COUNT = 55000;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uImplode;
  uniform vec2 uMouse;
  uniform float uSpeedScale;
  uniform float uIsIntro;

  attribute vec3 aTargetPos;
  attribute vec3 aColor;
  attribute vec3 aTargetColor;
  attribute float aSize;
  attribute float aSeed;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // 1. Smoothly morph between models
    float m = smoothstep(0.0, 1.0, uMorph);
    vec3 pos = mix(position, aTargetPos, m);
    vec3 col = mix(aColor, aTargetColor, m);

    float t = uTime * uSpeedScale;

    // 2. Dynamic 3D Fluid Wave & Orbital Motion (Eliminates static "sand" look)
    if (uIsIntro > 0.5) {
      // Full-screen sweeping cosmic & atomic currents
      float streamAngle = t * (0.22 + mod(aSeed, 0.35));
      float s = sin(streamAngle * 0.5);
      float c = cos(streamAngle * 0.5);
      pos.xy = mat2(c, -s, s, c) * pos.xy;

      // Undulating 3D ribbon waves across the entire viewport
      pos.x += sin(t * 1.4 + pos.y * 0.45 + aSeed * 6.28) * 0.45;
      pos.y += cos(t * 1.2 + pos.x * 0.35 + aSeed * 6.28) * 0.45;
      pos.z += sin(t * 1.6 + pos.x * 0.4 + aSeed * 6.28) * 0.55;
    } else {
      // 3D Orbital rotation + living quantum turbulence
      float angle = t * (0.28 + mod(aSeed, 0.45));
      float s = sin(angle * 0.45);
      float c = cos(angle * 0.45);
      pos.xz = mat2(c, -s, s, c) * pos.xz;

      // Continuous 3D curl-like flow so clouds visibly shimmer and breathe
      vec3 wave = vec3(
        sin(t * 2.4 + pos.y * 0.9 + aSeed * 12.0),
        cos(t * 2.1 + pos.z * 0.9 + aSeed * 12.0),
        sin(t * 2.6 + pos.x * 0.9 + aSeed * 12.0)
      );
      pos += wave * 0.14;
    }

    // 3. Large-Radius Interactive Cursor Attractor / Ripple
    vec3 mouseWorld = vec3(uMouse.x * 11.0, uMouse.y * 6.8, 0.0);
    float distToMouse = length(pos - mouseWorld);
    if (distToMouse < 4.2) {
      float influence = pow((4.2 - distToMouse) / 4.2, 1.5);
      vec3 pushDir = normalize(pos - mouseWorld + 0.001);
      // Swirl + repel around cursor
      vec3 swirlDir = vec3(-pushDir.y, pushDir.x, pushDir.z * 0.5);
      pos += (pushDir * 0.65 + swirlDir * 0.85) * influence * 1.6;
      col *= 1.0 + influence * 0.75;
    }

    // 4. Singularity Implosion & Detonation
    if (uImplode > 0.001) {
      if (uImplode <= 1.0) {
        float pull = pow(uImplode, 1.7);
        float spin = pull * 16.0;
        mat2 rot = mat2(cos(spin), -sin(spin), sin(spin), cos(spin));
        pos.xy = rot * pos.xy;
        pos = mix(pos, vec3(0.0), pull);
        col = mix(col, vec3(3.0, 2.5, 2.0), pull);
      } else {
        float burst = uImplode - 1.0;
        pos = mix(vec3(0.0), aTargetPos, smoothstep(0.0, 1.0, burst));
        col = mix(vec3(3.0, 2.5, 2.0), aTargetColor, smoothstep(0.0, 1.0, burst));
      }
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Larger, overlapping volumetric sprites (mix of lush nebula clouds & bright sparks)
    float sizeBoost = uIsIntro > 0.5 ? 42.0 : 36.0;
    gl_PointSize = clamp((aSize * sizeBoost) / -mvPosition.z, 2.2, 44.0);

    vColor = col;
    float radialDist = length(pos);
    vAlpha = clamp(1.25 - (radialDist / 22.0), 0.32, 0.95);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Dual-layer volumetric sprite: wide silky cloud halo + bright pinpoint core
    float normDist = dist * 2.0;
    float softCloud = pow(1.0 - normDist, 2.2) * 0.75;
    float brightCore = exp(-normDist * normDist * 10.0) * 0.85;
    float shape = softCloud + brightCore;

    // Boost chromatic saturation while preventing neutral white blow-out
    float luma = dot(vColor, vec3(0.299, 0.587, 0.114));
    vec3 saturated = mix(vec3(luma), vColor, 1.35);
    vec3 hdrColor = (saturated / (1.0 + luma * 0.28)) * 1.65;

    gl_FragColor = vec4(hdrColor * shape, shape * vAlpha * 0.82);
  }
`;

function generateDistribution(
  scene: SceneType,
  modelId: ModelId,
  variant: boolean
): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  const setParticle = (
    i: number,
    x: number,
    y: number,
    z: number,
    r: number,
    g: number,
    b: number
  ) => {
    const idx = i * 3;
    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
    colors[idx] = r;
    colors[idx + 1] = g;
    colors[idx + 2] = b;
  };

  // SCENE 1: Full-Screen Across-the-Room Magnet (Spans entire 2880x1800 viewport)
  if (scene === 'intro') {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const u = Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      if (i < PARTICLE_COUNT * 0.45) {
        // 1. Full-Screen Sweeping Spiral Energy Streams (Gold -> Rose -> Electric Sapphire)
        const arm = i % 3;
        const armOffset = (arm * Math.PI * 2) / 3;
        const rad = 1.2 + Math.pow(u, 0.65) * 11.5;
        const spiralAngle = rad * 0.65 + armOffset + (Math.random() - 0.5) * 0.55;
        const x = Math.cos(spiralAngle) * rad * 1.25;
        const y = Math.sin(spiralAngle) * rad * 0.78;
        const z = (Math.random() - 0.5) * 5.5;

        const t = rad / 12.0;
        if (arm === 0) {
          // Stellar Gold to Crimson
          setParticle(i, x, y, z, 2.4 - t * 0.5, 1.35 - t * 0.8, 0.25 + t * 0.6);
        } else if (arm === 1) {
          // Electric Cyan to Deep Cobalt
          setParticle(i, x, y, z, 0.15 + t * 0.4, 1.65 - t * 0.5, 2.5);
        } else {
          // Nebular Magenta-Violet to Warm Amber
          setParticle(i, x, y, z, 2.1, 0.35 + t * 1.1, 1.85 - t * 1.2);
        }
      } else if (i < PARTICLE_COUNT * 0.72) {
        // 2. Left Giant Glowing Quantum Atom + Intersecting Orbital Rings
        const isRing = i % 3 === 0;
        const rad = isRing ? 3.8 + (Math.random() - 0.5) * 0.25 : Math.pow(u, 0.5) * 4.2;
        const x = -5.6 + rad * Math.sin(phi) * Math.cos(theta);
        const y = rad * Math.sin(phi) * Math.sin(theta);
        const z = rad * Math.cos(phi);
        setParticle(i, x, y, z, 2.5, 1.45, 0.28);
      } else {
        // 3. Right Giant Maxwell-Boltzmann Plasma Sphere
        const rad = Math.pow(u, 0.5) * 4.4;
        const x = 5.6 + rad * Math.sin(phi) * Math.cos(theta);
        const y = rad * Math.sin(phi) * Math.sin(theta);
        const z = rad * Math.cos(phi);
        const e = Math.random();
        setParticle(
          i,
          x,
          y,
          z,
          0.2 + e * 2.3,
          0.75 + (1 - Math.abs(e - 0.5)) * 0.9,
          2.45 - e * 2.0
        );
      }
    }
    return { positions, colors };
  }

  // SCENE 2: Cinematic Ambient Nebula & Rising Embers
  if (scene === 'cinematic') {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 26;
      const y = (Math.random() - 0.5) * 16;
      const z = (Math.random() - 0.5) * 10 - 3;
      const warm = i % 3 === 0;
      if (warm) setParticle(i, x, y, z, 1.8, 0.95, 0.35);
      else setParticle(i, x, y, z, 0.35, 1.15, 2.0);
    }
    return { positions, colors };
  }

  // SCENE 3 & 4: High-Vibrancy, Full-Stage Scientific Models
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const u = Math.random() * 2 - 1;
    const phi = Math.acos(u);

    switch (modelId) {
      case 'hydrogen': {
        if (!variant) {
          // 1s Ground State: Blazing Rose Proton Core + Multi-Shell Sapphire/Cyan Cloud
          const isNucleus = i < 2500;
          const isInnerShell = i >= 2500 && i < 22000;
          const r = isNucleus
            ? Math.random() * 0.45
            : isInnerShell
            ? 0.6 + Math.pow(Math.random(), 0.6) * 2.4
            : 2.2 + -Math.log(1 - Math.random() * 0.95) * 1.65;

          const x = r * Math.sin(phi) * Math.cos(theta);
          const y = r * Math.sin(phi) * Math.sin(theta);
          const z = r * Math.cos(phi);

          if (isNucleus) {
            setParticle(i, x, y, z, 2.8, 0.35, 0.85); // Blazing Rose-Magenta Core
          } else if (isInnerShell) {
            setParticle(i, x, y, z, 0.15, 1.65, 2.5); // Electric Cyan High-Probability Shell
          } else {
            setParticle(i, x, y, z, 0.45, 0.55, 2.1); // Deep Sapphire Outer Halo
          }
        } else {
          // 2p Dumbbell Orbital (+Ψ Electric Cyan Lobe, -Ψ Rose-Crimson Lobe, Glowing Nodal Ring)
          if (i < 3000) {
            // Equatorial Nodal Ring + Nucleus
            const ringR = 0.3 + Math.random() * 1.8;
            setParticle(i, Math.cos(theta) * ringR, (Math.random() - 0.5) * 0.15, Math.sin(theta) * ringR, 2.4, 1.9, 0.5);
          } else {
            const cosTheta = Math.cos(phi);
            const r = (0.45 + Math.pow(Math.random(), 0.42) * 5.6) * Math.abs(cosTheta);
            const x = r * Math.sin(phi) * Math.cos(theta) * 1.15;
            const y = r * Math.cos(phi) * 1.15;
            const z = r * Math.sin(phi) * Math.sin(theta) * 1.15;
            if (y >= 0) setParticle(i, x, y, z, 0.15, 1.75, 2.6);
            else setParticle(i, x, y, z, 2.5, 0.3, 0.85);
          }
        }
        break;
      }

      case 'carbon': {
        // True 3D Tetrahedral sp3 Lobes + Central Core + Terminal Bond Spheres
        const dirs = [
          [1, 1, 1],
          [1, -1, -1],
          [-1, 1, -1],
          [-1, -1, 1],
        ];
        if (i < 3000) {
          // Bright Carbon Nucleus
          const r = Math.random() * 0.55;
          setParticle(
            i,
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi),
            2.6,
            1.8,
            0.35
          );
        } else {
          const lobeIdx = i % 4;
          const lobe = dirs[lobeIdx];
          const len = Math.hypot(lobe[0], lobe[1], lobe[2]);
          const nx = lobe[0] / len;
          const ny = lobe[1] / len;
          const nz = lobe[2] / len;

          // Teardrop orbital density peaking at 75% along each tetrahedral axis
          const dist = 0.5 + Math.pow(Math.random(), 0.65) * 5.2;
          const lobeWidth = variant
            ? 0.25
            : Math.sin((dist / 5.7) * Math.PI) * 1.55 + 0.2;

          const x = nx * dist + Math.sin(phi) * Math.cos(theta) * lobeWidth;
          const y = ny * dist + Math.sin(phi) * Math.sin(theta) * lobeWidth;
          const z = nz * dist + Math.cos(phi) * lobeWidth;

          if (variant) {
            setParticle(i, x, y, z, 2.5, 1.85, 0.25); // Highlighted Golden Bond Axes
          } else {
            // Vibrant Emerald-to-Cyan sp3 Hybrid Clouds
            const ratio = dist / 5.7;
            setParticle(
              i,
              x,
              y,
              z,
              0.15 + ratio * 0.3,
              2.1 - ratio * 0.4,
              0.95 + ratio * 1.4
            );
          }
        }
        break;
      }

      case 'oxygen': {
        const side = i % 2 === 0 ? -2.6 : 2.6;
        const isBridge = i < PARTICLE_COUNT * (variant ? 0.65 : 0.38);
        if (isBridge) {
          const bx = (Math.random() - 0.5) * 5.2;
          const ringAngle = Math.random() * Math.PI * 2;
          const radius = variant ? 0.95 : 1.55;
          const env = Math.cos((bx / 5.2) * Math.PI);
          const by = Math.cos(ringAngle) * radius * env;
          const bz = Math.sin(ringAngle) * radius * env;
          setParticle(i, bx, by, bz, 2.5, 1.35, 0.25);
        } else {
          const r = 0.3 + Math.pow(Math.random(), 0.5) * 2.9;
          const x = side + r * Math.sin(phi) * Math.cos(theta);
          const y = r * Math.sin(phi) * Math.sin(theta);
          const z = r * Math.cos(phi);
          setParticle(i, x, y, z, 0.2, 1.45, 2.55);
        }
        break;
      }

      case 'iron': {
        const grid = 9;
        const spacing = 1.05;
        const offset = ((grid - 1) * spacing) / 2;
        const cellIndex = i % (grid * grid * grid * 2);
        const isBodyCenter = cellIndex % 2 === 1;
        const c = Math.floor(cellIndex / 2);
        const gx = c % grid;
        const gy = Math.floor(c / grid) % grid;
        const gz = Math.floor(c / (grid * grid));

        const jitter = variant ? 0.08 : 0.26;
        const x = gx * spacing - offset + (isBodyCenter ? spacing * 0.5 : 0) + (Math.random() - 0.5) * jitter;
        const y = gy * spacing - offset + (isBodyCenter ? spacing * 0.5 : 0) + (Math.random() - 0.5) * jitter;
        const z = gz * spacing - offset + (isBodyCenter ? spacing * 0.5 : 0) + (Math.random() - 0.5) * jitter;

        if (variant) setParticle(i, x, y, z, 2.6, 0.45, 0.25);
        else
          setParticle(
            i,
            x,
            y,
            z,
            isBodyCenter ? 2.5 : 0.45,
            isBodyCenter ? 1.25 : 1.35,
            isBodyCenter ? 0.25 : 2.35
          );
        break;
      }

      case 'gas': {
        const x = (Math.random() - 0.5) * 11.5;
        const y = (Math.random() - 0.5) * 7.8;
        const z = (Math.random() - 0.5) * 7.8;
        const speed = Math.random();
        if (variant) {
          setParticle(i, x, y, z, 2.6, 0.45 + speed * 1.3, 0.2);
        } else {
          setParticle(
            i,
            x,
            y,
            z,
            0.2 + speed * 2.4,
            0.65 + (1 - Math.abs(speed - 0.5)) * 0.9,
            2.5 - speed * 2.1
          );
        }
        break;
      }

      case 'solar': {
        if (i < 6500) {
          const r = Math.pow(Math.random(), 0.5) * 1.35;
          setParticle(
            i,
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi),
            2.7,
            1.65,
            0.28
          );
        } else {
          const radii = [2.0, 2.7, 3.5, 4.3, 5.3, 6.5, 7.8, 9.1];
          const ringIdx = i % radii.length;
          const baseR = radii[ringIdx];
          const spread = ringIdx === 4 ? 0.55 : 0.12;
          const r = baseR + (Math.random() - 0.5) * spread;
          const x = r * Math.cos(theta);
          const z = r * Math.sin(theta);
          const y = (Math.random() - 0.5) * (ringIdx === 4 ? 0.32 : 0.08);

          if (variant && (ringIdx === 2 || ringIdx === 4)) {
            setParticle(i, x, y, z, 0.2, 2.5, 1.35);
          } else {
            setParticle(i, x, y, z, 0.45 + ringIdx * 0.22, 1.35, 2.35 - ringIdx * 0.16);
          }
        }
        break;
      }

      case 'galaxy': {
        const arms = 4;
        const armAngle = ((i % arms) * Math.PI * 2) / arms;
        const dist = 0.2 + Math.pow(Math.random(), 0.68) * 8.6;
        const swirl = dist * 1.15;
        const scatter = (Math.random() - 0.5) * (0.45 + dist * 0.13);
        const angle = armAngle + swirl + scatter;

        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const y = (Math.random() - 0.5) * (1.4 / (1 + dist * 0.4));

        const coreRatio = Math.max(0, 1 - dist / 3.8);
        if (variant && dist < 2.8) {
          setParticle(i, x, y * 1.8, z, 2.7, 1.75, 0.45);
        } else {
          setParticle(
            i,
            x,
            y,
            z,
            0.65 + coreRatio * 1.95,
            0.55 + coreRatio * 1.15,
            2.45 - coreRatio * 1.4
          );
        }
        break;
      }

      case 'universe': {
        const nodes = 18;
        const nIdx = i % nodes;
        const nextIdx = (nIdx + 1) % nodes;
        const nodePos = (k: number) => [
          Math.sin(k * 12.9898) * 6.8,
          Math.cos(k * 78.233) * 5.0,
          Math.sin(k * 37.719) * 6.0,
        ];
        const p1 = nodePos(nIdx);
        const p2 = nodePos(nextIdx);
        const t = Math.random();
        const jitter = variant ? 0.24 : 0.58;

        const x = p1[0] * (1 - t) + p2[0] * t + (Math.random() - 0.5) * jitter * 2.2;
        const y = p1[1] * (1 - t) + p2[1] * t + (Math.random() - 0.5) * jitter * 2.2;
        const z = p1[2] * (1 - t) + p2[2] * t + (Math.random() - 0.5) * jitter * 2.2;

        if (variant) setParticle(i, x, y, z, 1.25, 0.65, 2.6);
        else setParticle(i, x, y, z, 2.4 - t * 1.1, 0.65 + t * 0.7, 0.45 + t * 1.9);
        break;
      }
    }
  }

  return { positions, colors };
}

const ParticleField: React.FC = () => {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const scene = useUniverseStore((s) => s.scene);
  const activeModelId = useUniverseStore((s) => s.activeModelId);
  const variantActive = useUniverseStore((s) => s.variantActive);
  const setScene = useUniverseStore((s) => s.setScene);
  const setMetrics = useUniverseStore((s) => s.setMetrics);

  const transitionStartRef = useRef<number | null>(null);
  const frameCounterRef = useRef({ frames: 0, lastTime: performance.now() });

  const initialData = useMemo(() => {
    const { positions, colors } = generateDistribution('intro', 'hydrogen', false);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const seeds = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Mix of wide soft nebula clouds (2.2) and bright core sparks (0.9)
      sizes[i] = i % 5 === 0 ? 1.8 + Math.random() * 0.9 : 0.85 + Math.random() * 1.15;
      seeds[i] = Math.random();
    }
    return {
      positions,
      targetPositions: new Float32Array(positions),
      colors,
      targetColors: new Float32Array(colors),
      sizes,
      seeds,
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 1 },
      uImplode: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uSpeedScale: { value: 1.0 },
      uIsIntro: { value: 1.0 },
    }),
    []
  );

  // Interruptible morph from live on-screen presentation positions
  useEffect(() => {
    const geom = geometryRef.current;
    const mat = materialRef.current;
    if (!geom || !mat) return;

    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const targetPosAttr = geom.getAttribute('aTargetPos') as THREE.BufferAttribute;
    const colAttr = geom.getAttribute('aColor') as THREE.BufferAttribute;
    const targetColAttr = geom.getAttribute('aTargetColor') as THREE.BufferAttribute;

    const posArr = posAttr.array as Float32Array;
    const targetPosArr = targetPosAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;
    const targetColArr = targetColAttr.array as Float32Array;

    const rawMorph = Math.min(1, Math.max(0, mat.uniforms.uMorph.value));
    const smoothT = rawMorph * rawMorph * (3 - 2 * rawMorph);

    for (let i = 0; i < posArr.length; i++) {
      posArr[i] = posArr[i] + (targetPosArr[i] - posArr[i]) * smoothT;
      colArr[i] = colArr[i] + (targetColArr[i] - colArr[i]) * smoothT;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    const targetModelScene = scene === 'transition' ? 'main' : scene;
    const next = generateDistribution(targetModelScene, activeModelId, variantActive);

    targetPosArr.set(next.positions);
    targetColArr.set(next.colors);
    targetPosAttr.needsUpdate = true;
    targetColAttr.needsUpdate = true;

    mat.uniforms.uMorph.value = 0.0;
    mat.uniforms.uIsIntro.value = scene === 'intro' ? 1.0 : 0.0;
    mat.uniforms.uSpeedScale.value =
      activeModelId === 'gas' && variantActive ? 3.2 : 1.0;

    if (scene === 'transition') {
      transitionStartRef.current = performance.now();
    } else {
      transitionStartRef.current = null;
      mat.uniforms.uImplode.value = 0.0;
    }
  }, [scene, activeModelId, variantActive]);

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    mat.uniforms.uTime.value += delta;
    mat.uniforms.uMouse.value.lerp(state.pointer, 0.12);

    if (mat.uniforms.uMorph.value < 1.0) {
      mat.uniforms.uMorph.value = Math.min(1.0, mat.uniforms.uMorph.value + delta * 1.05);
    }

    if (scene === 'transition' && transitionStartRef.current !== null) {
      const elapsed = (performance.now() - transitionStartRef.current) / 1000;
      if (elapsed < 1.8) {
        mat.uniforms.uImplode.value = elapsed / 1.8;
      } else if (elapsed < 3.0) {
        mat.uniforms.uImplode.value = 1.0 + (elapsed - 1.8) / 1.2;
      } else {
        mat.uniforms.uImplode.value = 0.0;
        transitionStartRef.current = null;
        setScene('main');
      }
    }

    const now = performance.now();
    frameCounterRef.current.frames += 1;
    const diff = now - frameCounterRef.current.lastTime;
    if (diff >= 400) {
      const currentFps = Math.round((frameCounterRef.current.frames * 1000) / diff);
      const currentMs = Number((diff / frameCounterRef.current.frames).toFixed(2));
      setMetrics(currentFps, currentMs);
      frameCounterRef.current.frames = 0;
      frameCounterRef.current.lastTime = now;
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[initialData.positions, 3]}
          count={PARTICLE_COUNT}
          array={initialData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPos"
          args={[initialData.targetPositions, 3]}
          count={PARTICLE_COUNT}
          array={initialData.targetPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aColor"
          args={[initialData.colors, 3]}
          count={PARTICLE_COUNT}
          array={initialData.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetColor"
          args={[initialData.targetColors, 3]}
          count={PARTICLE_COUNT}
          array={initialData.targetColors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[initialData.sizes, 1]}
          count={PARTICLE_COUNT}
          array={initialData.sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSeed"
          args={[initialData.seeds, 1]}
          count={PARTICLE_COUNT}
          array={initialData.seeds}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const UniverseCanvas: React.FC = () => {
  const scene = useUniverseStore((s) => s.scene);

  return (
    <div className="canvas-wrapper">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 12.0], fov: 52 }}
        gl={{
          powerPreference: 'high-performance',
          alpha: false,
          antialias: false,
          stencil: false,
          depth: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.25;
        }}
      >
        <ParticleField />
        {scene === 'main' && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={4.5}
            maxDistance={20}
            autoRotate
            autoRotateSpeed={0.65}
            dampingFactor={0.06}
          />
        )}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.55}
            luminanceThreshold={0.42}
            luminanceSmoothing={0.45}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.15} darkness={0.68} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};