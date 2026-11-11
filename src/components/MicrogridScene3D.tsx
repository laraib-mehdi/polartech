import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DispatchSourceState, GridComponentHealth } from '../types/microgrid';

interface MicrogridScene3DProps {
  dispatch: DispatchSourceState;
  components: GridComponentHealth[];
  sunElevationDeg: number;
  solarHour: number;
  windSpeedMs: number;
  selectedSubsystemId: string;
  onSelectSubsystem: (id: string) => void;
  showLabels: boolean;
  h2StoredKg: number;
  maxH2Kg: number;
  batterySoc: number;
}

export const MicrogridScene3D: React.FC<MicrogridScene3DProps> = ({
  dispatch,
  components,
  sunElevationDeg,
  solarHour,
  windSpeedMs,
  selectedSubsystemId,
  onSelectSubsystem,
  showLabels,
  h2StoredKg,
  maxH2Kg,
  batterySoc,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const turbinesRef = useRef<THREE.Group[]>([]);
  const satDishRef = useRef<THREE.Group | null>(null);
  const tankFillsRef = useRef<THREE.Mesh[]>([]);
  const exhaustGlowsRef = useRef<THREE.Mesh[]>([]);
  const flowLinesRef = useRef<{
    [key: string]: {
      a: THREE.Vector3;
      b: THREE.Vector3;
      dots: THREE.Mesh[];
      t: number;
    };
  }>({});
  const labelSpritesRef = useRef<{ [key: string]: { sprite: THREE.Sprite; canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } }>({});
  const interactiveHitMeshesRef = useRef<THREE.Mesh[]>([]);
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(12, 3, 5));
  const cameraOrbitRef = useRef({ theta: 0.65, phi: 1.02, radius: 210 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, button: 0 });

  // Keep references to latest dynamic props so animation loop is purely 60fps without React tear-down
  const latestPropsRef = useRef({
    dispatch,
    components,
    sunElevationDeg,
    solarHour,
    windSpeedMs,
    selectedSubsystemId,
    showLabels,
    h2StoredKg,
    maxH2Kg,
    batterySoc,
  });

  useEffect(() => {
    latestPropsRef.current = {
      dispatch,
      components,
      sunElevationDeg,
      solarHour,
      windSpeedMs,
      selectedSubsystemId,
      showLabels,
      h2StoredKg,
      maxH2Kg,
      batterySoc,
    };
  });

  // Handle camera presets when selected subsystem changes
  useEffect(() => {
    const targets: { [key: string]: { target: THREE.Vector3; theta: number; phi: number; radius: number } } = {
      overview: { target: new THREE.Vector3(10, 4, 10), theta: 0.65, phi: 1.05, radius: 210 },
      wt: { target: new THREE.Vector3(68, 18, -32), theta: 0.85, phi: 1.15, radius: 110 },
      pv: { target: new THREE.Vector3(-24, 4, -55), theta: 0.35, phi: 1.1, radius: 90 },
      bat: { target: new THREE.Vector3(44, 4, 25), theta: 1.1, phi: 1.15, radius: 65 },
      h2: { target: new THREE.Vector3(6, 5, 50), theta: 0.15, phi: 1.15, radius: 85 },
      dg: { target: new THREE.Vector3(-34, 6, 26), theta: -0.4, phi: 1.15, radius: 70 },
      sat: { target: new THREE.Vector3(-18, 12, -8), theta: -0.6, phi: 1.1, radius: 60 },
      bus: { target: new THREE.Vector3(6, 4, 26), theta: 0.5, phi: 1.1, radius: 55 },
    };

    let key = 'overview';
    if (selectedSubsystemId.startsWith('wt')) key = 'wt';
    else if (selectedSubsystemId === 'pv') key = 'pv';
    else if (selectedSubsystemId === 'bat') key = 'bat';
    else if (['ely', 'h2', 'fc'].includes(selectedSubsystemId)) key = 'h2';
    else if (selectedSubsystemId.startsWith('dg')) key = 'dg';
    else if (selectedSubsystemId === 'sat') key = 'sat';
    else if (selectedSubsystemId === 'bus') key = 'bus';

    const t = targets[key] || targets.overview;
    cameraTargetRef.current.copy(t.target);
    cameraOrbitRef.current.theta = t.theta;
    cameraOrbitRef.current.phi = t.phi;
    cameraOrbitRef.current.radius = t.radius;
  }, [selectedSubsystemId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.5, 2000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 600;
    const shadowD = 120;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xcde3f9, 0x5b7088, 0.55);
    scene.add(hemiLight);

    // Helpers to create materials
    const M = (color: number, opts: THREE.MeshStandardMaterialParameters = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1, ...opts });

    // 1. Terrain & Schirmacher Oasis (Queen Maud Land / Lake Priyadarshini Margin)
    // Permafrost snow terrain
    const snowMat = M(0xe6f0fa, { roughness: 0.9, metalness: 0.05 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 500, 32, 32), snowMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -120);
    ground.receiveShadow = true;
    scene.add(ground);

    // Lake Priyadarshini & Queen Maud Land Blue Ice Margin
    const seaMat = M(0x0e2c45, { roughness: 0.25, metalness: 0.45 });
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(1000, 450), seaMat);
    sea.rotation.x = -Math.PI / 2;
    sea.position.set(0, -0.3, 310);
    scene.add(sea);

    // Ice floes and moraine blue-ice plates
    for (let i = 0; i < 9; i++) {
      const floeW = 30 + Math.random() * 45;
      const floeH = 20 + Math.random() * 35;
      const floe = new THREE.Mesh(new THREE.BoxGeometry(floeW, 0.6, floeH), snowMat);
      floe.position.set(-350 + i * 85 + (Math.random() - 0.5) * 30, -0.1, 240 + Math.random() * 120);
      floe.rotation.y = Math.random() * Math.PI;
      scene.add(floe);
    }

    // Schirmacher Oasis rocky nunatak ridges
    for (let i = 0; i < 16; i++) {
      const heightVal = 45 + Math.random() * 85;
      const radiusVal = 35 + Math.random() * 35;
      const coneMat = M(i % 3 === 0 ? 0x6e8093 : 0xd8e4f0, { roughness: 0.95 });
      const cone = new THREE.Mesh(new THREE.ConeGeometry(radiusVal, heightVal, 7), coneMat);
      cone.position.set(-360 + i * 48, heightVal / 2, -260 - Math.random() * 60);
      cone.rotation.y = (i * 0.4) % Math.PI;
      scene.add(cone);
    }

    // Helper box builder
    const box = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      mat: THREE.Material,
      parent: THREE.Object3D = scene
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y + h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // 2. Maitri 2 Station Main Research Complex (Aerodynamic elevated dual-deck polar hull)
    const polarOrangeMat = M(0xe05610, { roughness: 0.45, metalness: 0.25 }); // Indian Polar high-vis orange/saffron
    const whiteMat = M(0xf0f4f8, { roughness: 0.5, metalness: 0.15 });
    const polarGreenMat = M(0x138808, { roughness: 0.45, metalness: 0.25 }); // Indian Antarctic Programme green accent
    const redMat = M(0xef4444, { roughness: 0.5, metalness: 0.2 }); // Aviation warning markers
    const darkSteelMat = M(0x2d3748, { roughness: 0.4, metalness: 0.6 });
    const glassMat = M(0x1a365d, { roughness: 0.1, metalness: 0.8 });

    // Main station central research wing
    box(24, 5.2, 9, 0, 2.0, 0, polarOrangeMat);
    // Upper observation & astrophysics deck
    box(14, 2.8, 6.5, 0, 7.2, 0, whiteMat);
    // Indian Antarctic Programme tricolor aerodynamic racing stripes
    box(24.2, 0.4, 9.1, 0, 4.4, 0, polarOrangeMat);
    box(24.2, 0.4, 9.1, 0, 4.0, 0, whiteMat);
    box(24.2, 0.4, 9.1, 0, 3.6, 0, polarGreenMat);

    // West Laboratory Pod (Deep Ice Core & Cryo-Microbiology)
    box(12, 4.2, 7, -34, 2.0, -2, whiteMat);
    box(12.1, 0.5, 7.1, -34, 4.2, -2, polarOrangeMat);

    // East Logistics & Life-Support Pod
    box(10, 4.2, 7, 34, 2.0, -8, polarOrangeMat);
    box(10.1, 0.5, 7.1, 34, 4.2, -8, whiteMat);

    // Weatherproof interconnected sky-bridges on stilts
    box(14, 2.4, 2.4, -20, 2.8, -1, darkSteelMat);
    box(14, 2.4, 2.4, 20, 2.8, -4, darkSteelMat);

    // Main Observation panoramic bay windows
    for (let i = -3; i <= 3; i++) {
      box(0.15, 1.8, 1.3, -12.08, 3.4, i * 1.2, glassMat);
      box(0.15, 1.8, 1.3, 12.08, 3.4, i * 1.2, glassMat);
      box(1.2, 1.6, 0.15, i * 1.5, 7.6, 3.32, glassMat);
    }

    // Heavy-duty Aerodynamic Hydraulic Stilts (Elevated 2m above ground to prevent snow drifting)
    [-10, -5, 0, 5, 10].forEach((x) => {
      [-3.8, 3.8].forEach((z) => {
        box(0.7, 2.0, 0.7, x, 0, z, darkSteelMat);
      });
    });
    // Pod stilts
    [-38, -30].forEach((x) => {
      [-4.5, 1.5].forEach((z) => box(0.6, 2.0, 0.6, x, 0, z, darkSteelMat));
    });
    [30, 38].forEach((x) => {
      [-10.5, -5.5].forEach((z) => box(0.6, 2.0, 0.6, x, 0, z, darkSteelMat));
    });

    // 3. Satellite Tracking Radome & Ground Station Dome
    const satGroup = new THREE.Group();
    satGroup.position.set(-18, 0, -8);
    scene.add(satGroup);
    // Radome tower
    box(3, 8, 3, 0, 0, 0, whiteMat, satGroup);
    // Parabolic antenna dish
    const dishGroup = new THREE.Group();
    dishGroup.position.set(0, 9.5, 0);
    const dishMesh = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), whiteMat);
    dishMesh.rotation.x = Math.PI / 3;
    dishGroup.add(dishMesh);
    const subReflector = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 8), darkSteelMat);
    subReflector.position.set(0, 1.2, 0.6);
    dishGroup.add(subReflector);
    satGroup.add(dishGroup);
    satDishRef.current = dishGroup;

    // 4. Central Smart Switchgear (AC Grid Bus)
    const busMat = M(0x475569, { roughness: 0.3, metalness: 0.7 });
    box(4, 3, 2.5, 6, 0, 26, busMat);
    // Pulsing bus status LED bar
    box(3.2, 0.3, 0.2, 6, 2.2, 27.3, M(0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.9 }));
    const busPos = new THREE.Vector3(6, 1.8, 26);

    // 5. Battery Energy Storage System (BESS 600 kWh) - 2x Insulated Green Containers
    const bessMat = M(0x1e3a2b, { roughness: 0.5, metalness: 0.3 });
    [-1, 1].forEach((k) => {
      box(12, 3.6, 3.4, 44, 0, 24 + k * 4.5, bessMat);
      // Container HVAC refrigeration units
      box(1.5, 2.2, 1.5, 37.5, 0.6, 24 + k * 4.5, whiteMat);
      // Battery SOC visual strip
      box(0.2, 0.4, 3.2, 38.2, 2.4, 24 + k * 4.5, M(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.8 }));
    });
    const batPos = new THREE.Vector3(42, 2, 25);

    // 6. Emergency Diesel Genset Enclosure (2x 100 kW)
    const dieselMat = M(0x78350f, { roughness: 0.7, metalness: 0.3 });
    box(10, 4, 5.5, -34, 0, 26, dieselMat);
    // Exhaust stacks
    const exhaustMeshes: THREE.Mesh[] = [];
    [-36, -32].forEach((x) => {
      box(0.8, 7.5, 0.8, x, 4, 26, darkSteelMat);
      const exhaustGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 12, 8),
        M(0xf97316, { emissive: 0xea580c, emissiveIntensity: 0.0 })
      );
      exhaustGlow.position.set(x, 11.8, 26);
      scene.add(exhaustGlow);
      exhaustMeshes.push(exhaustGlow);
    });
    exhaustGlowsRef.current = exhaustMeshes;
    const dgPos = new THREE.Vector3(-29, 2, 26);

    // 7. Solar PV Array (150 kWp Bifacial Polar Array)
    const pvMat = M(0x1e293b, { roughness: 0.2, metalness: 0.8 });
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        const x = -44 + c * 5.2;
        const z = -48 - r * 8.0;
        const panel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 2.4), pvMat);
        panel.position.set(x, 2.2, z);
        panel.rotation.x = -0.92; // Polar snow shedding tilt angle ~52 degrees
        panel.castShadow = true;
        scene.add(panel);
        // Steel frame supports
        box(0.25, 2.0, 0.25, x, 0, z, darkSteelMat);
      }
    }
    const pvPos = new THREE.Vector3(-24, 2, -55);

    // 8. 3x Polar Wind Turbines (60 kW each)
    const turbCoords = [
      [48, -42],
      [72, -34],
      [96, -26],
    ];
    const turbineRotors: THREE.Group[] = [];
    turbCoords.forEach(([tx, tz]) => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(tx, 0, tz);
      scene.add(towerGroup);

      // Tapered tower cylinder
      const towerGeom = new THREE.CylinderGeometry(0.7, 1.2, 28, 16);
      const towerMesh = new THREE.Mesh(towerGeom, whiteMat);
      towerMesh.position.y = 14;
      towerMesh.castShadow = true;
      towerGroup.add(towerMesh);

      // Nacelle
      box(2.8, 2.2, 4.4, 0, 27, 0, whiteMat, towerGroup);
      // Warning strobe light at top
      box(0.3, 0.4, 0.3, 0, 29.2, 0, M(0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.0 }), towerGroup);

      // 3-blade rotor assembly
      const rotorGroup = new THREE.Group();
      rotorGroup.position.set(0, 28, 2.5);
      towerGroup.add(rotorGroup);

      for (let b = 0; b < 3; b++) {
        const bladeArm = new THREE.Group();
        bladeArm.rotation.z = b * ((Math.PI * 2) / 3);
        const bladeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 13.5, 0.2), whiteMat);
        bladeMesh.position.y = 6.8;
        // Red tip for polar aviation visibility
        const tipMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 2.5, 0.22), redMat);
        tipMesh.position.y = 12.5;
        bladeArm.add(bladeMesh);
        bladeArm.add(tipMesh);
        rotorGroup.add(bladeArm);
      }
      towerGroup.rotation.y = 0.4;
      turbineRotors.push(rotorGroup);
    });
    turbinesRef.current = turbineRotors;
    const windPos = new THREE.Vector3(56, 2, -22);

    // 9. Green Hydrogen Hub: PEM Electrolyzer (100 kW), 700-bar Storage Tanks, PEM Fuel Cell (80 kW)
    // Electrolyzer Pod
    const elyPod = box(14, 4.5, 4.5, -20, 0, 52, M(0x0369a1, { roughness: 0.4, metalness: 0.4 }));
    box(14, 0.4, 4.7, -20, 4.5, 52, M(0x38bdf8));
    // Fuel Cell Pod
    const fcPod = box(12, 4.5, 4.5, 34, 0, 52, M(0x15803d, { roughness: 0.4, metalness: 0.4 }));
    box(12, 0.4, 4.7, 34, 4.5, 52, M(0x4ade80));

    // 3x High-Pressure H2 Cylinders with dynamic fill visualizer
    const tankFills: THREE.Mesh[] = [];
    for (let k = 0; k < 3; k++) {
      const tankGroup = new THREE.Group();
      tankGroup.position.set(7, 3.2, 45 + k * 7);
      tankGroup.rotation.z = Math.PI / 2;
      scene.add(tankGroup);

      // Translucent protective composite tank shell
      const shell = new THREE.Mesh(
        new THREE.CylinderGeometry(2.3, 2.3, 13, 20),
        M(0x67e8f9, { transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.2 })
      );
      tankGroup.add(shell);

      // Internal pressurized hydrogen core
      const gasCore = new THREE.Mesh(
        new THREE.CylinderGeometry(2.0, 2.0, 12.5, 20),
        M(0x06b6d4, { emissive: 0x0891b2, emissiveIntensity: 0.7 })
      );
      tankGroup.add(gasCore);
      tankFills.push(gasCore);

      // Support cradle
      box(12, 0.8, 1.2, 7, 0, 45 + k * 7, darkSteelMat);
    }
    tankFillsRef.current = tankFills;

    const elyPos = new THREE.Vector3(-14, 2, 52);
    const fcPos = new THREE.Vector3(28, 2, 52);
    const stationLoadPos = new THREE.Vector3(0, 3.5, 3);

    // 10. 3D Power Lines & Dynamic Flow Particles
    const createFlowLine = (a: THREE.Vector3, b: THREE.Vector3, defaultColor: number) => {
      const lineGeom = new THREE.BufferGeometry().setFromPoints([a, b]);
      const lineMesh = new THREE.Line(
        lineGeom,
        new THREE.LineBasicMaterial({ color: 0x334155, linewidth: 2 })
      );
      scene.add(lineMesh);

      const dots: THREE.Mesh[] = [];
      for (let i = 0; i < 6; i++) {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.48, 10, 8),
          new THREE.MeshBasicMaterial({ color: defaultColor })
        );
        dot.visible = false;
        scene.add(dot);
        dots.push(dot);
      }
      return { a, b, dots, t: 0 };
    };

    flowLinesRef.current = {
      pv: createFlowLine(pvPos, busPos, 0xfbbf24),
      wind: createFlowLine(windPos, busPos, 0x38bdf8),
      battery: createFlowLine(batPos, busPos, 0x22c55e),
      diesel: createFlowLine(dgPos, busPos, 0xef4444),
      electrolyzer: createFlowLine(busPos, elyPos, 0x06b6d4),
      fuelCell: createFlowLine(fcPos, busPos, 0x4ade80),
      load: createFlowLine(busPos, stationLoadPos, 0xffffff),
    };

    // 11. Interactive Click Target Meshes & 3D Sprite Labels
    const subsystemsConfig = [
      { id: 'load', name: 'Station Load', pos: [0, 11, 0], hit: [26, 8, 14, 0, 4, 0] },
      { id: 'bus', name: 'Smart Switchgear Bus', pos: [6, 8, 26], hit: [6, 4, 5, 6, 2, 26] },
      { id: 'bat', name: 'BESS 600 kWh', pos: [44, 8, 25], hit: [14, 5, 14, 44, 2, 25] },
      { id: 'dg', name: 'Diesel Gensets', pos: [-34, 15, 26], hit: [12, 8, 8, -34, 4, 26] },
      { id: 'pv', name: 'Solar PV 150 kWp', pos: [-24, 9, -58], hit: [45, 5, 30, -24, 3, -58] },
      { id: 'wt0', name: 'Wind Turbine 1', pos: [48, 34, -42], hit: [6, 32, 6, 48, 16, -42] },
      { id: 'wt1', name: 'Wind Turbine 2', pos: [72, 34, -34], hit: [6, 32, 6, 72, 16, -34] },
      { id: 'wt2', name: 'Wind Turbine 3', pos: [96, 34, -26], hit: [6, 32, 6, 96, 16, -26] },
      { id: 'ely', name: 'PEM Electrolyzer', pos: [-20, 9, 52], hit: [15, 6, 6, -20, 3, 52] },
      { id: 'h2', name: 'H₂ Storage 700bar', pos: [7, 10, 52], hit: [16, 7, 24, 7, 3.5, 52] },
      { id: 'fc', name: 'PEM Fuel Cell 80kW', pos: [34, 9, 52], hit: [14, 6, 6, 34, 3, 52] },
      { id: 'sat', name: 'LEO Sat Ground Link', pos: [-18, 13, -8], hit: [5, 12, 5, -18, 6, -8] },
    ];

    const hitMeshes: THREE.Mesh[] = [];
    const labelSprites: { [key: string]: { sprite: THREE.Sprite; canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } } = {};

    subsystemsConfig.forEach((cfg) => {
      // Invisible bounding mesh for raycast picking
      const hitGeom = new THREE.BoxGeometry(cfg.hit[0], cfg.hit[1], cfg.hit[2]);
      const hitMesh = new THREE.Mesh(hitGeom, new THREE.MeshBasicMaterial({ visible: false }));
      hitMesh.position.set(cfg.hit[3], cfg.hit[4], cfg.hit[5]);
      hitMesh.userData.id = cfg.id;
      scene.add(hitMesh);
      hitMeshes.push(hitMesh);

      // High-res Canvas Sprite for crisp text
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      sprite.scale.set(22, 5.5, 1);
      sprite.renderOrder = 99;
      scene.add(sprite);

      labelSprites[cfg.id] = { sprite, canvas, texture };
    });

    interactiveHitMeshesRef.current = hitMeshes;
    labelSpritesRef.current = labelSprites;

    // Orbit & Pan Events
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY, button: e.button };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY, button: dragStartRef.current.button };

      if (dragStartRef.current.button === 2) {
        // Right drag: Pan target
        const th = cameraOrbitRef.current.theta;
        cameraTargetRef.current.x -= dx * 0.12 * Math.cos(th);
        cameraTargetRef.current.z += dx * 0.12 * Math.sin(th);
      } else {
        // Left drag: Orbit
        cameraOrbitRef.current.theta -= dx * 0.0055;
        cameraOrbitRef.current.phi = Math.max(0.2, Math.min(1.48, cameraOrbitRef.current.phi - dy * 0.0055));
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dist = Math.hypot(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y);
      isDraggingRef.current = false;

      // Click raycasting if not a long drag
      if (dist < 6 && cameraRef.current) {
        const rect = container.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObjects(interactiveHitMeshesRef.current);
        if (intersects.length > 0) {
          const clickedId = intersects[0].object.userData.id;
          if (clickedId) {
            onSelectSubsystem(clickedId);
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraOrbitRef.current.radius = Math.max(25, Math.min(350, cameraOrbitRef.current.radius * (1 + e.deltaY * 0.001)));
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('contextmenu', handleContextMenu);

    // Resize handler
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Render & Animation Loop
    let lastTime = performance.now();
    let animFrameId: number;

    const animate = (now: number) => {
      animFrameId = requestAnimationFrame(animate);
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const p = latestPropsRef.current;

      // 1. Position Camera from Orbit params
      if (cameraRef.current) {
        const { theta, phi, radius } = cameraOrbitRef.current;
        const tgt = cameraTargetRef.current;
        cameraRef.current.position.set(
          tgt.x + radius * Math.sin(phi) * Math.sin(theta),
          tgt.y + radius * Math.cos(phi),
          tgt.z + radius * Math.sin(phi) * Math.cos(theta)
        );
        cameraRef.current.lookAt(tgt);
      }

      // 2. Sun Lighting & Sky Ambient based on astronomical sun elevation
      const sunRad = (p.sunElevationDeg * Math.PI) / 180;
      const azimRad = (p.solarHour / 24) * 2 * Math.PI;
      const clampedElevation = Math.max(sunRad, 0.06);
      sunLight.position.set(
        Math.sin(azimRad) * 250 * Math.cos(clampedElevation),
        250 * Math.sin(clampedElevation),
        -Math.cos(azimRad) * 250
      );
      const daylightFactor = Math.max(0.05, Math.min(1.0, (p.sunElevationDeg + 8) / 22));
      sunLight.intensity = 1.35 * daylightFactor;
      hemiLight.intensity = 0.2 + 0.5 * daylightFactor;

      // Dynamic Polar Sky Color & Fog
      const skyR = 0.04 + 0.45 * daylightFactor;
      const skyG = 0.07 + 0.65 * daylightFactor;
      const skyB = 0.15 + 0.78 * daylightFactor;
      scene.background = new THREE.Color(skyR, skyG, skyB);
      scene.fog = new THREE.FogExp2(new THREE.Color(skyR, skyG, skyB), 0.0016);

      // 3. Spin Wind Turbines in sync with real wind speed
      turbinesRef.current.forEach((rotor, idx) => {
        const unitKw = p.dispatch.windUnitsKw[idx] || 0;
        if (unitKw > 0.5) {
          rotor.rotation.z -= dt * (0.4 + p.windSpeedMs * 0.18);
        }
      });

      // 4. Satellite Ground Dish tracking motion
      if (satDishRef.current) {
        satDishRef.current.rotation.y = Math.sin(now * 0.0004) * 0.6;
        satDishRef.current.rotation.x = Math.PI / 4 + Math.sin(now * 0.0003) * 0.15;
      }

      // 5. Hydrogen Gas Tank Level Visualizer
      const fillRatio = Math.max(0.08, Math.min(1.0, p.h2StoredKg / p.maxH2Kg));
      tankFillsRef.current.forEach((core) => {
        core.scale.set(0.2 + 0.8 * fillRatio, 1, 0.2 + 0.8 * fillRatio);
      });

      // 6. Diesel Exhaust Glow when gensets operate
      const isDieselActive = p.dispatch.dieselPowerKw > 0.5;
      exhaustGlowsRef.current.forEach((exhaust) => {
        (exhaust.material as THREE.MeshStandardMaterial).emissiveIntensity = isDieselActive
          ? 0.7 + 0.3 * Math.sin(now * 0.015)
          : 0.0;
      });

      // 7. Dynamic Flow Particle animations
      const updateFlow = (
        flowItem: { a: THREE.Vector3; b: THREE.Vector3; dots: THREE.Mesh[]; t: number },
        powerKw: number,
        colorHex: number
      ) => {
        const isActive = Math.abs(powerKw) > 0.8;
        const speed = Math.sign(powerKw) * Math.min(1.2, 0.35 + Math.abs(powerKw) / 100);
        flowItem.t = (flowItem.t + dt * speed + 1) % 1;

        flowItem.dots.forEach((dot, i) => {
          dot.visible = isActive;
          if (isActive) {
            const frac = (flowItem.t + i / 6 + 1) % 1;
            dot.position.lerpVectors(flowItem.a, flowItem.b, frac);
            (dot.material as THREE.MeshBasicMaterial).color.set(colorHex);
          }
        });
      };

      const flows = flowLinesRef.current;
      if (flows.pv) updateFlow(flows.pv, p.dispatch.pvPowerKw, 0xfbbf24);
      if (flows.wind) updateFlow(flows.wind, p.dispatch.windPowerKw, 0x38bdf8);
      if (flows.battery) {
        // If battery > 0: discharging to bus (green). If < 0: charging from bus (purple)
        updateFlow(flows.battery, p.dispatch.batteryPowerKw, p.dispatch.batteryPowerKw > 0 ? 0x22c55e : 0xa855f7);
      }
      if (flows.diesel) updateFlow(flows.diesel, p.dispatch.dieselPowerKw, 0xef4444);
      if (flows.electrolyzer) updateFlow(flows.electrolyzer, p.dispatch.electrolyzerPowerKw, 0x06b6d4);
      if (flows.fuelCell) updateFlow(flows.fuelCell, p.dispatch.fuelCellPowerKw, 0x4ade80);
      if (flows.load) updateFlow(flows.load, p.dispatch.stationLoadKw, 0xffffff);

      // 8. Update 3D Canvas Labels every 6 frames
      if (p.showLabels && Math.floor(now / 50) % 3 === 0) {
        const labels = labelSpritesRef.current;
        const renderLabel = (id: string, name: string, value: string, badgeColor: string) => {
          const item = labels[id];
          if (!item) return;
          const ctx = item.canvas.getContext('2d');
          if (!ctx) return;

          ctx.clearRect(0, 0, 512, 128);
          // Rounded background box
          ctx.fillStyle = 'rgba(7, 14, 23, 0.88)';
          ctx.beginPath();
          ctx.roundRect(6, 6, 500, 116, 20);
          ctx.fill();

          ctx.lineWidth = id === p.selectedSubsystemId ? 6 : 3;
          ctx.strokeStyle = id === p.selectedSubsystemId ? '#38bdf8' : badgeColor;
          ctx.stroke();

          // Title
          ctx.font = 'bold 36px "Plus Jakarta Sans", system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(name, 256, 52);

          // Value
          ctx.font = '600 32px "JetBrains Mono", monospace';
          ctx.fillStyle = badgeColor;
          ctx.fillText(value, 256, 96);

          item.texture.needsUpdate = true;
          item.sprite.scale.set(id === p.selectedSubsystemId ? 25 : 20, id === p.selectedSubsystemId ? 6.2 : 5, 1);
        };

        renderLabel('load', 'Maitri 2 Research Hub', `${p.dispatch.stationLoadKw.toFixed(0)} kW`, '#ffffff');
        renderLabel('bus', 'Smart Grid Bus', p.dispatch.unservedLoadKw > 0 ? 'DEFICIT ALERT' : 'SYNCHRONIZED', '#38bdf8');
        renderLabel(
          'bat',
          'BESS 600 kWh',
          `${(p.batterySoc * 100).toFixed(0)}% · ${p.dispatch.batteryPowerKw > 0 ? '+' : ''}${p.dispatch.batteryPowerKw.toFixed(0)} kW`,
          '#c084fc'
        );
        renderLabel('pv', 'Solar PV 150 kWp', `${p.dispatch.pvPowerKw.toFixed(0)} kW`, '#fbbf24');
        renderLabel('dg', 'Diesel Backup', `${p.dispatch.dieselPowerKw.toFixed(0)} kW`, '#f87171');
        renderLabel('wt0', 'WT-1 Polar (60 kW)', `${(p.dispatch.windUnitsKw[0] || 0).toFixed(0)} kW`, '#38bdf8');
        renderLabel('wt1', 'WT-2 Polar (60 kW)', `${(p.dispatch.windUnitsKw[1] || 0).toFixed(0)} kW`, '#38bdf8');
        renderLabel('wt2', 'WT-3 Polar (60 kW)', `${(p.dispatch.windUnitsKw[2] || 0).toFixed(0)} kW`, '#38bdf8');
        renderLabel('ely', 'PEM H₂ (Lake Priyadarshini)', `${p.dispatch.electrolyzerPowerKw.toFixed(0)} kW`, '#06b6d4');
        renderLabel(
          'h2',
          'H₂ Storage 700bar',
          `${p.h2StoredKg.toFixed(0)} kg · ${(fillRatio * 100).toFixed(0)}%`,
          '#22d3ee'
        );
        renderLabel('fc', 'PEM Fuel Cell', `${p.dispatch.fuelCellPowerKw.toFixed(0)} kW`, '#4ade80');
        renderLabel('sat', 'ISRO Polar Link', 'LOCKED · 220 Mbps', '#a78bfa');
      }

      // Hide or show all sprites based on toggle
      Object.values(labelSpritesRef.current).forEach((lbl) => {
        lbl.sprite.visible = p.showLabels;
      });

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('contextmenu', handleContextMenu);
      if (rendererRef.current?.domElement && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden" data-testid="microgrid-3d-scene">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Controls & View Presets */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 items-center pointer-events-auto">
        <div className="bg-[#0b1624]/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">3D Views:</span>
          <button
            onClick={() => onSelectSubsystem('overview')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              selectedSubsystemId === 'overview'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectSubsystem('wt1')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              selectedSubsystemId.startsWith('wt')
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Wind Array
          </button>
          <button
            onClick={() => onSelectSubsystem('pv')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              selectedSubsystemId === 'pv'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Solar PV
          </button>
          <button
            onClick={() => onSelectSubsystem('h2')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              ['h2', 'ely', 'fc'].includes(selectedSubsystemId)
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            H₂ System
          </button>
          <button
            onClick={() => onSelectSubsystem('bat')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              selectedSubsystemId === 'bat'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            BESS Storage
          </button>
          <button
            onClick={() => onSelectSubsystem('sat')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              selectedSubsystemId === 'sat'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            SatCom Dome
          </button>
        </div>
      </div>

      {/* Floating Legend / Flow Guide */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto bg-[#0b1624]/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-xs shadow-2xl flex items-center gap-3">
        <span className="text-[10px] uppercase font-bold text-slate-400">Power Vectors:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
          <span className="text-slate-300 text-[11px]">Solar PV</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
          <span className="text-slate-300 text-[11px]">Wind</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          <span className="text-slate-300 text-[11px]">Battery</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
          <span className="text-slate-300 text-[11px]">Green H₂</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
          <span className="text-slate-300 text-[11px]">Diesel</span>
        </div>
        <div className="text-[10px] text-slate-500 ml-2 hidden sm:inline">
          Drag to rotate · Right-drag to pan · Scroll to zoom
        </div>
      </div>
    </div>
  );
};
