import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, Sliders, Camera, Layers } from 'lucide-react';

interface DigitalCoreCanvasProps {
  scrollProgress: number;
  primaryColor: string;
  secondaryColor: string;
  reducedMotion: boolean;
}

export type CoreFinishPreset = 'quantum' | 'cyber' | 'titanium';
export type CameraAnglePreset = 'default' | 'top' | 'closeup';

// Pre-allocated module-scope scratch objects to guarantee zero GC in render loop
const _vec3 = new THREE.Vector3();
const _targetLook = new THREE.Vector3(0, 0.25, 0);
const _dummyObj = new THREE.Object3D();
const _scratchColor = new THREE.Color();

/**
 * Generates a procedural tileable brushed-metal / micro-circuit bump CanvasTexture
 * with zero external network dependencies (Zero-404 policy).
 */
function createProceduralMicroReliefTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);

    // Fine brushed lines
    ctx.strokeStyle = '#969696';
    ctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Subtle geometric circuit traces
    ctx.strokeStyle = '#686868';
    ctx.lineWidth = 2;
    for (let i = 16; i < 256; i += 32) {
      ctx.strokeRect(i, i, 24, 24);
      ctx.beginPath();
      ctx.moveTo(i + 24, i + 12);
      ctx.lineTo(Math.min(256, i + 48), i + 12);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

/**
 * Generates a soft radial contact shadow CanvasTexture to ground the 3D assembly.
 */
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
    grad.addColorStop(0, 'rgba(5, 7, 14, 0.78)');
    grad.addColorStop(0.55, 'rgba(8, 10, 18, 0.35)');
    grad.addColorStop(1, 'rgba(8, 10, 18, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const DigitalCoreCanvas: React.FC<DigitalCoreCanvasProps> = ({
  scrollProgress,
  primaryColor,
  secondaryColor,
  reducedMotion,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Interactive HUD controls (stored in refs for the 60fps loop so state changes never rebuild WebGL)
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [explodedAmount, setExplodedAmount] = useState<number>(0.15);
  const [finishPreset, setFinishPreset] = useState<CoreFinishPreset>('quantum');
  const [cameraPreset, setCameraPreset] = useState<CameraAnglePreset>('default');

  const stateRef = useRef({
    scrollProgress,
    explodedAmount: 0.15,
    finishPreset: 'quantum' as CoreFinishPreset,
    cameraPreset: 'default' as CameraAnglePreset,
    reducedMotion,
    primaryColor,
    secondaryColor,
    pointerX: 0,
    pointerY: 0,
  });

  useEffect(() => {
    stateRef.current.scrollProgress = scrollProgress;
    stateRef.current.explodedAmount = explodedAmount;
    stateRef.current.finishPreset = finishPreset;
    stateRef.current.cameraPreset = cameraPreset;
    stateRef.current.reducedMotion = reducedMotion;
    stateRef.current.primaryColor = primaryColor;
    stateRef.current.secondaryColor = secondaryColor;
  }, [scrollProgress, explodedAmount, finishPreset, cameraPreset, reducedMotion, primaryColor, secondaryColor]);

  // Keyboard shortcut 'H' to collapse/expand bottom control dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'h') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Detect Software WebGL (SwiftShader / llvmpipe) per threejs skill
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgHex = 0x080a12;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.048);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Offset look target slightly right so the 3D subject frames cleanly on the left side of the RTL Hero
    const desktopOffset = width >= 1024 ? 1.15 : 0;
    _targetLook.set(desktopOffset, 0.25, 0);
    camera.position.set(desktopOffset + 0.6, 1.35, 6.1);
    camera.lookAt(_targetLook);

    // 2. Studio PBR Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 3. Balanced Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x080a12, 0.85);
    hemiLight.position.set(0, 12, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1e0, 2.2);
    keyLight.position.set(5, 7, 5);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      const d = 4.5;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 20;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 1.8);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const corePointLight = new THREE.PointLight(0x38bdf8, 2.4, 12, 2);
    corePointLight.position.set(0, 0.6, 0);
    scene.add(corePointLight);

    // 4. Procedural Bump/Roughness Map & Ground Plane + Contact Shadow
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const bumpTexture = createProceduralMicroReliefTexture(maxAnisotropy);
    const shadowTexture = createContactShadowTexture();

    const floorY = -1.65;
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0d18,
      roughness: 0.78,
      metalness: 0.22,
      bumpMap: bumpTexture,
      bumpScale: 0.015,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = floorY;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Subtle architectural polar grid offset by +0.02 on Y to prevent Z-fighting
    const gridHelper = new THREE.GridHelper(24, 24, 0x252d43, 0x141a2b);
    gridHelper.position.y = floorY + 0.02;
    scene.add(gridHelper);

    // Soft radial contact shadow disc at y = floorY + 0.03
    const contactShadowGeo = new THREE.CircleGeometry(2.6, 32);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const contactShadowMesh = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadowMesh.rotation.x = -Math.PI / 2;
    contactShadowMesh.position.y = floorY + 0.03;
    scene.add(contactShadowMesh);

    // 5. Composite 9-Part Procedural Hero Subject ("Geek roit Digital Core")
    // Pivot anchored at bottom-center flush with floorY
    const rootAssembly = new THREE.Group();
    rootAssembly.position.set(0, floorY, 0);
    scene.add(rootAssembly);

    // Materials with varied roughness (>= 0.25 delta across parts) and metalness
    const corePrimaryMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      metalness: 0.88,
      roughness: 0.18,
      bumpMap: bumpTexture,
      bumpScale: 0.02,
    });

    const chassisMatteMat = new THREE.MeshStandardMaterial({
      color: 0x141a2b,
      metalness: 0.45,
      roughness: 0.68,
      bumpMap: bumpTexture,
      bumpScale: 0.03,
    });

    const ringMetallicMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.92,
      roughness: 0.16,
      emissive: 0x0c2d48,
      emissiveIntensity: 0.45,
    });

    const accentEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xa78bfa,
      metalness: 0.3,
      roughness: 0.25,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.75,
    });

    const glassShellMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      metalness: 0.05,
      roughness: 0.12,
      transmission: isSoftwareGl ? 0 : 0.88,
      transparent: true,
      opacity: isSoftwareGl ? 0.32 : 1,
      ior: 1.52,
      thickness: 0.8,
      clearcoat: 1.0,
      depthWrite: false,
    });

    // Part 1 (Primary Silhouette): Lathe-turned grounded architectural pedestal base
    const lathePoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(1.15, 0.0),
      new THREE.Vector2(1.05, 0.14),
      new THREE.Vector2(0.72, 0.22),
      new THREE.Vector2(0.55, 0.38),
      new THREE.Vector2(0.0, 0.38),
    ];
    const pedestalGeo = new THREE.LatheGeometry(lathePoints, 32);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, chassisMatteMat);
    pedestalMesh.castShadow = !isSoftwareGl;
    pedestalMesh.receiveShadow = !isSoftwareGl;
    rootAssembly.add(pedestalMesh);

    // Part 2 (Accent Detail): Glowing emitter ring embedded in pedestal collar
    const baseCollarGeo = new THREE.TorusGeometry(0.66, 0.028, 16, 48);
    const baseCollarMesh = new THREE.Mesh(baseCollarGeo, accentEmissiveMat);
    baseCollarMesh.rotation.x = Math.PI / 2;
    baseCollarMesh.position.y = 0.24;
    rootAssembly.add(baseCollarMesh);

    // Floating Core Subgroup centered at y = 1.85 above pedestal
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 1.85, 0);
    rootAssembly.add(coreGroup);

    // Part 3 (Primary Silhouette): Bevel-extruded octagonal quantum processor prism
    const octShape = new THREE.Shape();
    const octRadius = 0.62;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const x = Math.cos(angle) * octRadius;
      const y = Math.sin(angle) * octRadius;
      if (i === 0) octShape.moveTo(x, y);
      else octShape.lineTo(x, y);
    }
    octShape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.44,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };
    const corePrismGeo = new THREE.ExtrudeGeometry(octShape, extrudeSettings);
    corePrismGeo.center();
    const corePrismMesh = new THREE.Mesh(corePrismGeo, corePrimaryMat);
    corePrismMesh.castShadow = !isSoftwareGl;
    coreGroup.add(corePrismMesh);

    // Part 4 (Secondary Read): Crystal refraction containment shell around core
    const crystalGeo = new THREE.IcosahedronGeometry(0.92, 1);
    const crystalMesh = new THREE.Mesh(crystalGeo, glassShellMat);
    crystalMesh.renderOrder = 2;
    coreGroup.add(crystalMesh);

    // Part 5 (Secondary Read): Outer precision gyroscope ring
    const outerRingGeo = new THREE.TorusGeometry(1.38, 0.045, 20, 64);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, ringMetallicMat);
    outerRingMesh.castShadow = !isSoftwareGl;
    coreGroup.add(outerRingMesh);

    // Part 6 (Secondary Read): Inner orthogonal gyroscope ring
    const innerRingGeo = new THREE.TorusGeometry(1.14, 0.032, 16, 64);
    const innerRingMesh = new THREE.Mesh(innerRingGeo, accentEmissiveMat);
    innerRingMesh.rotation.y = Math.PI / 3;
    coreGroup.add(innerRingMesh);

    // Part 7 (Accent Detail): Tubular data conduit helix wrapping the core
    class HelixCurve extends THREE.Curve<THREE.Vector3> {
      getPoint(t: number, optionalTarget = new THREE.Vector3()) {
        const angle = t * Math.PI * 4;
        const r = 1.56;
        const x = Math.cos(angle) * r;
        const y = (t - 0.5) * 1.3;
        const z = Math.sin(angle) * r;
        return optionalTarget.set(x, y, z);
      }
    }
    const tubeGeo = new THREE.TubeGeometry(new HelixCurve(), 48, 0.018, 8, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, ringMetallicMat);
    coreGroup.add(tubeMesh);

    // Parts 8..11 (Secondary Read): 4 Architectural Floating Interface Plates (representing Web, React, Mobile, AI)
    const interfacePlates: THREE.Group[] = [];
    const plateBaseDirs = [
      new THREE.Vector3(1.45, 0.55, 0.4),
      new THREE.Vector3(-1.45, 0.45, 0.5),
      new THREE.Vector3(1.25, -0.55, -0.45),
      new THREE.Vector3(-1.25, -0.5, -0.4),
    ];

    const plateShape = new THREE.Shape();
    const pw = 0.52;
    const ph = 0.34;
    plateShape.moveTo(-pw / 2, -ph / 2);
    plateShape.lineTo(pw / 2, -ph / 2);
    plateShape.lineTo(pw / 2, ph / 2);
    plateShape.lineTo(-pw / 2, ph / 2);
    plateShape.closePath();

    const plateGeo = new THREE.ExtrudeGeometry(plateShape, {
      depth: 0.03,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
    plateGeo.center();

    const stripGeo = new THREE.BoxGeometry(0.36, 0.035, 0.015);

    plateBaseDirs.forEach((dir, idx) => {
      const plateHolder = new THREE.Group();
      plateHolder.position.copy(dir);
      plateHolder.lookAt(0, 0, 0);

      const body = new THREE.Mesh(plateGeo, chassisMatteMat);
      const headerBar = new THREE.Mesh(
        stripGeo,
        idx % 2 === 0 ? accentEmissiveMat : ringMetallicMat
      );
      headerBar.position.set(0, 0.08, 0.032);

      const subBar = new THREE.Mesh(stripGeo, corePrimaryMat);
      subBar.scale.set(0.65, 0.7, 1);
      subBar.position.set(0.05, -0.04, 0.032);

      plateHolder.add(body, headerBar, subBar);
      coreGroup.add(plateHolder);
      interfacePlates.push(plateHolder);
    });

    // Part 12 (InstancedMesh > 20 items): 36 Orbital Data Satellites with per-instance scale & tint variation
    const instanceCount = 36;
    const nodeGeo = new THREE.OctahedronGeometry(0.055, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.85,
    });
    const instancedNodes = new THREE.InstancedMesh(nodeGeo, nodeMat, instanceCount);
    instancedNodes.frustumCulled = false;

    const orbitData: { radius: number; angle: number; yOffset: number; speed: number; scale: number }[] = [];
    for (let i = 0; i < instanceCount; i++) {
      const radius = 1.9 + (i % 4) * 0.42;
      const angle = (i / instanceCount) * Math.PI * 2;
      const yOffset = ((i % 7) - 3) * 0.28;
      const speed = 0.25 + (i % 5) * 0.08;
      const scale = 0.85 + ((i * 13) % 30) / 100; // ±15% variation
      orbitData.push({ radius, angle, yOffset, speed, scale });

      _dummyObj.position.set(
        Math.cos(angle) * radius,
        yOffset,
        Math.sin(angle) * radius
      );
      _dummyObj.scale.setScalar(scale);
      _dummyObj.updateMatrix();
      instancedNodes.setMatrixAt(i, _dummyObj.matrix);

      _scratchColor.setHex(i % 2 === 0 ? 0x8b5cf6 : 0x38bdf8);
      instancedNodes.setColorAt(i, _scratchColor);
    }
    instancedNodes.instanceMatrix.needsUpdate = true;
    if (instancedNodes.instanceColor) instancedNodes.instanceColor.needsUpdate = true;
    instancedNodes.computeBoundingSphere();
    coreGroup.add(instancedNodes);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer parallax tracking
    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      stateRef.current.pointerX = nx;
      stateRef.current.pointerY = ny;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Resize handling
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      _targetLook.set(w >= 1024 ? 1.15 : 0, 0.25, 0);
    };
    window.addEventListener('resize', onResize);

    // 6. Frame Pacing & Software-WebGL Guard (`afterDraw`) using high-resolution performance.now()
    let startTime = performance.now();
    let lastTime = startTime;
    let frameId = 0;
    let isDisposed = false;
    let smoothExplode = stateRef.current.explodedAmount;
    let smoothScroll = stateRef.current.scrollProgress;

    function afterDraw(cb: () => void) {
      if (isDisposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const elapsed = (now - startTime) / 1000;
      const st = stateRef.current;

      // Exponential damping for smooth state transitions
      smoothExplode = THREE.MathUtils.damp(
        smoothExplode,
        st.explodedAmount + st.scrollProgress * 0.65,
        5,
        dt
      );
      smoothScroll = THREE.MathUtils.damp(smoothScroll, st.scrollProgress, 5, dt);

      // Apply finish preset colors smoothly
      if (st.finishPreset === 'quantum') {
        _scratchColor.set(st.primaryColor || '#8B5CF6');
        corePrimaryMat.color.lerp(_scratchColor, 0.1);
        _scratchColor.set(st.secondaryColor || '#38BDF8');
        ringMetallicMat.color.lerp(_scratchColor, 0.1);
      } else if (st.finishPreset === 'cyber') {
        _scratchColor.set('#06B6D4');
        corePrimaryMat.color.lerp(_scratchColor, 0.1);
        _scratchColor.set('#A78BFA');
        ringMetallicMat.color.lerp(_scratchColor, 0.1);
      } else {
        _scratchColor.set('#94A3B8');
        corePrimaryMat.color.lerp(_scratchColor, 0.1);
        _scratchColor.set('#E2E8F0');
        ringMetallicMat.color.lerp(_scratchColor, 0.1);
      }

      const speedFactor = st.reducedMotion ? 0.08 : 1.0;

      // Core & Gyroscope rotations driven by time + scroll progress
      corePrismMesh.rotation.y = elapsed * 0.35 * speedFactor + smoothScroll * Math.PI * 1.4;
      corePrismMesh.rotation.x = Math.sin(elapsed * 0.4 * speedFactor) * 0.25 + smoothScroll * 0.6;

      outerRingMesh.rotation.z = elapsed * 0.28 * speedFactor + smoothScroll * Math.PI;
      outerRingMesh.rotation.x = Math.PI / 4 + Math.cos(elapsed * 0.3 * speedFactor) * 0.2;

      innerRingMesh.rotation.y = -elapsed * 0.42 * speedFactor - smoothScroll * Math.PI * 1.2;
      innerRingMesh.rotation.z = Math.sin(elapsed * 0.5 * speedFactor) * 0.35;

      crystalMesh.scale.setScalar(1 + smoothExplode * 0.22);
      outerRingMesh.scale.setScalar(1 + smoothExplode * 0.32);
      tubeMesh.rotation.y = elapsed * 0.2 * speedFactor;

      // Explode & float the 4 architectural interface plates
      interfacePlates.forEach((plate, idx) => {
        const base = plateBaseDirs[idx];
        const expansion = 1 + smoothExplode * 0.85;
        const bob = Math.sin(elapsed * 1.4 * speedFactor + idx * 1.5) * 0.06;
        plate.position.set(
          base.x * expansion,
          base.y * expansion + bob,
          base.z * expansion
        );
        plate.lookAt(0, 0, 0);
      });

      // Update InstancedMesh orbital satellites without allocations
      for (let i = 0; i < instanceCount; i++) {
        const od = orbitData[i];
        const curAngle = od.angle + elapsed * od.speed * speedFactor + smoothScroll * 1.5;
        const r = od.radius * (1 + smoothExplode * 0.35);
        _dummyObj.position.set(
          Math.cos(curAngle) * r,
          od.yOffset + Math.sin(elapsed * speedFactor + i) * 0.08,
          Math.sin(curAngle) * r
        );
        _dummyObj.rotation.y = curAngle;
        _dummyObj.scale.setScalar(od.scale);
        _dummyObj.updateMatrix();
        instancedNodes.setMatrixAt(i, _dummyObj.matrix);
      }
      instancedNodes.instanceMatrix.needsUpdate = true;

      // Damped Camera Choreography based on preset + pointer + scroll
      const lookX = _targetLook.x;
      if (st.cameraPreset === 'top') {
        _vec3.set(lookX + 0.2, 4.6, 3.4);
      } else if (st.cameraPreset === 'closeup') {
        _vec3.set(lookX + 0.5, 0.7, 3.8);
      } else {
        _vec3.set(
          lookX + 0.65 + st.pointerX * 0.45,
          0.95 + st.pointerY * 0.3 + smoothScroll * 0.8,
          5.7 - smoothScroll * 0.9
        );
      }

      camera.position.lerp(_vec3, 1 - Math.exp(-4.5 * dt));
      camera.lookAt(_targetLook);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);

      // Dispose geometries, materials, textures
      floorGeo.dispose();
      floorMat.dispose();
      contactShadowGeo.dispose();
      contactShadowMat.dispose();
      pedestalGeo.dispose();
      baseCollarGeo.dispose();
      corePrismGeo.dispose();
      crystalGeo.dispose();
      outerRingGeo.dispose();
      innerRingGeo.dispose();
      tubeGeo.dispose();
      plateGeo.dispose();
      stripGeo.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      corePrimaryMat.dispose();
      chassisMatteMat.dispose();
      ringMetallicMat.dispose();
      accentEmissiveMat.dispose();
      glassShellMat.dispose();
      bumpTexture.dispose();
      shadowTexture.dispose();
      envTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none" data-testid="three-hero-stage">
      {/* Dedicated isolated WebGL mount ref outside React HUD elements */}
      <div
        ref={canvasMountRef}
        className="w-full h-full"
        aria-label="صحنه سه‌بعدی تعاملی هسته دیجیتال گیک رویت"
      />

      {/* Unified Collapsible Bottom Control Dock (Zero backdrop-filter over WebGL per threejs skill) */}
      <div
        className="absolute bottom-4 inset-x-0 mx-auto z-30 w-fit max-w-[94vw] transition-transform duration-200"
        style={{
          transform: dockCollapsed ? 'translateY(calc(100% - 34px))' : 'translateY(0)',
        }}
      >
        <div className="flex flex-col items-center">
          {/* Collapse / Expand Handle */}
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            aria-expanded={!dockCollapsed}
            aria-label={dockCollapsed ? 'نمایش کنترل‌های صحنه سه‌بعدی' : 'مخفی کردن کنترل‌های صحنه سه‌بعدی'}
            className="flex items-center gap-2 px-4 py-1.5 rounded-t-lg bg-[#0E1220] border border-b-0 border-[#252D43] text-xs font-medium text-[#A5AEC5] hover:text-[#F5F7FF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>نمایش کنترل‌های هسته ۳بعدی (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>مخفی کردن پنل ۳بعدی (H)</span>
              </>
            )}
          </button>

          {/* Dock Body (Solid surface, no backdrop-blur over WebGL) */}
          <div
            className={`flex flex-wrap items-center justify-center gap-4 px-5 py-3 rounded-xl bg-[#0E1220] border border-[#252D43] shadow-2xl transition-opacity duration-200 ${
              dockCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {/* Exploded View Slider */}
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-[#8B5CF6] shrink-0" />
              <label htmlFor="exploded-slider" className="text-xs text-[#A5AEC5] whitespace-nowrap shrink-0">
                جداسازی لایه‌ها:
              </label>
              <input
                id="exploded-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={explodedAmount}
                onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                className="w-24 accent-[#8B5CF6] cursor-pointer"
              />
            </div>

            <div className="h-4 w-px bg-[#252D43] hidden sm:block" />

            {/* Material Finish Switcher */}
            <div className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <span className="text-xs text-[#A5AEC5] whitespace-nowrap shrink-0">جنس سطح:</span>
              {(
                [
                  { id: 'quantum', label: 'کوانتوم' },
                  { id: 'cyber', label: 'سایبر' },
                  { id: 'titanium', label: 'تیتانیوم' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFinishPreset(item.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    finishPreset === item.id
                      ? 'bg-[#8B5CF6] text-[#F5F7FF]'
                      : 'bg-[#141A2B] text-[#A5AEC5] hover:text-[#F5F7FF]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-[#252D43] hidden sm:block" />

            {/* Camera Angle Presets */}
            <div className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#A78BFA] shrink-0" />
              <span className="text-xs text-[#A5AEC5] whitespace-nowrap shrink-0">زاویه دوربین:</span>
              {(
                [
                  { id: 'default', label: 'نمای استاندارد' },
                  { id: 'closeup', label: 'نمای نزدیک' },
                  { id: 'top', label: 'نمای بالا' },
                ] as const
              ).map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => setCameraPreset(cam.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cameraPreset === cam.id
                      ? 'bg-[#38BDF8] text-[#080A12] font-semibold'
                      : 'bg-[#141A2B] text-[#A5AEC5] hover:text-[#F5F7FF]'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
