"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  AlertCircle,
  Compass,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface SofaViewerProps {
  objPath?: string;
  className?: string;
}

export type ControlTarget = "all" | "sofa" | "room";

// Camera placed inside the living room area framing both the TV console and the sofa ensemble
const DEFAULT_TARGET = new THREE.Vector3(-280, 420, -370);
const DEFAULT_CAMERA_POS = new THREE.Vector3(-120, 680, 850);
const BASE_FOV = 44;

function calculateFov(aspect: number): number {
  if (aspect < 1.35) {
    return Math.min(58, BASE_FOV / (aspect / 1.3));
  }
  return BASE_FOV;
}

// Splits non-indexed mesh geometry into floor/furniture items and ceiling fixtures
function splitMeshByHeight(mesh: THREE.Mesh, thresholdY = 1200) {
  const geo = mesh.geometry;
  const pos = geo.attributes.position;
  const norm = geo.attributes.normal;
  const uv = geo.attributes.uv;

  const lowPos: number[] = [];
  const lowNorm: number[] = [];
  const lowUv: number[] = [];
  const highPos: number[] = [];
  const highNorm: number[] = [];
  const highUv: number[] = [];

  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    let maxY = -Infinity;
    for (let j = 0; j < 3; j++) {
      v.fromBufferAttribute(pos, i + j);
      v.applyMatrix4(mesh.matrixWorld);
      maxY = Math.max(maxY, v.y);
    }
    const targetPos = maxY < thresholdY ? lowPos : highPos;
    const targetNorm = maxY < thresholdY ? lowNorm : highNorm;
    const targetUv = maxY < thresholdY ? lowUv : highUv;

    for (let j = 0; j < 3; j++) {
      targetPos.push(pos.getX(i + j), pos.getY(i + j), pos.getZ(i + j));
      if (norm) targetNorm.push(norm.getX(i + j), norm.getY(i + j), norm.getZ(i + j));
      if (uv) targetUv.push(uv.getX(i + j), uv.getY(i + j));
    }
  }

  const lowGeo = new THREE.BufferGeometry();
  lowGeo.setAttribute("position", new THREE.Float32BufferAttribute(lowPos, 3));
  if (norm) lowGeo.setAttribute("normal", new THREE.Float32BufferAttribute(lowNorm, 3));
  if (uv) lowGeo.setAttribute("uv", new THREE.Float32BufferAttribute(lowUv, 2));

  const highGeo = new THREE.BufferGeometry();
  highGeo.setAttribute("position", new THREE.Float32BufferAttribute(highPos, 3));
  if (norm) highGeo.setAttribute("normal", new THREE.Float32BufferAttribute(highNorm, 3));
  if (uv) highGeo.setAttribute("uv", new THREE.Float32BufferAttribute(highUv, 2));

  const lowMesh = new THREE.Mesh(lowGeo, mesh.material);
  lowMesh.name = `${mesh.name}_furniture`;
  lowMesh.matrix.copy(mesh.matrix);
  lowMesh.matrixWorld.copy(mesh.matrixWorld);

  const highMesh = new THREE.Mesh(highGeo, mesh.material);
  highMesh.name = `${mesh.name}_ceiling`;
  highMesh.matrix.copy(mesh.matrix);
  highMesh.matrixWorld.copy(mesh.matrixWorld);

  return { lowMesh, highMesh };
}

// Generates a high-contrast luxury embroidered fabric brand tag for AZS Solutions
function createFabricBrandPatch(
  titleText = "AZS SOLUTIONS",
  subtitleText = "STUDIO BESPOKE",
  width = 160,
  height = 68
) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 435;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Dark espresso leather backing patch for sharp contrast on light upholstery
  ctx.fillStyle = "#1E1A17";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Micro-woven texture
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  for (let x = 0; x < canvas.width; x += 4) {
    ctx.fillRect(x, 0, 2, canvas.height);
  }
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillRect(0, y, canvas.width, 2);
  }

  // Artisan gold/sand perimeter stitching
  ctx.strokeStyle = "#D4A373";
  ctx.lineWidth = 10;
  ctx.setLineDash([24, 16]);
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  ctx.setLineDash([]);

  // Inner accent border
  ctx.strokeStyle = "rgba(212, 163, 115, 0.4)";
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Crisp bold main title "AZS SOLUTIONS"
  ctx.font = "bold 96px 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillText(titleText, canvas.width / 2, canvas.height / 2 - 28);
  ctx.fillStyle = "#FAF5ED";
  ctx.fillText(titleText, canvas.width / 2, canvas.height / 2 - 32);

  // Elegant golden subtitle
  ctx.font = "600 36px 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#D4A373";
  ctx.fillText(subtitleText, canvas.width / 2, canvas.height / 2 + 76);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  const patchGeo = new THREE.PlaneGeometry(width, height);
  const patchMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  // Prevent z-fighting with sofa mesh
  patchMat.polygonOffset = true;
  patchMat.polygonOffsetFactor = -1.0;
  patchMat.polygonOffsetUnits = -1.0;

  const patchMesh = new THREE.Mesh(patchGeo, patchMat);
  patchMesh.name = "AZS_Solutions_Brand_Tag";
  return patchMesh;
}

const PRESETS: Record<string, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
  angle: {
    pos: DEFAULT_CAMERA_POS.clone(),
    target: DEFAULT_TARGET.clone(),
  },
  front: {
    pos: new THREE.Vector3(-850, 560, -370),
    target: new THREE.Vector3(450, 420, -370),
  },
  chaise: {
    pos: new THREE.Vector3(150, 650, 350),
    target: new THREE.Vector3(450, 410, -370),
  },
  overview: {
    pos: new THREE.Vector3(-250, 1150, 750),
    target: new THREE.Vector3(-280, 400, -370),
  },
};

export default function SofaViewer({
  objPath = "/modals/sofa/source/готовый.fbx",
  className = "",
}: SofaViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationRef = useRef<number | null>(null);
  const interactedRef = useRef(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [activePreset, setActivePreset] = useState("angle");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlTarget, setControlTarget] = useState<ControlTarget>("all");

  const sofaPivotRef = useRef<THREE.Group | null>(null);
  const roomPivotRef = useRef<THREE.Group | null>(null);
  const controlTargetRef = useRef<ControlTarget>("all");
  const isAutoRotatingRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const stage = canvas?.parentElement;
    if (!container || !canvas || !stage) return;

    let isDisposed = false;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#252321");

    const initialAspect = stage.clientWidth / stage.clientHeight;
    const camera = new THREE.PerspectiveCamera(
      calculateFov(initialAspect),
      initialAspect,
      10,
      15000
    );
    camera.position.copy(DEFAULT_CAMERA_POS);
    camera.lookAt(DEFAULT_TARGET);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.target.copy(DEFAULT_TARGET);
    controls.minDistance = 600;
    controls.maxDistance = 2100;
    // Full 360-degree horizontal orbit
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.minPolarAngle = 0.1;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

    controls.addEventListener("start", () => {
      interactedRef.current = true;
      setHasInteracted(true);
      if (controls.autoRotate) {
        controls.autoRotate = false;
        setIsAutoRotating(false);
      }
    });

    // Clean, natural lighting (no harsh directional spotlights or artificial glare effects)
    scene.add(new THREE.AmbientLight(0xfff4e5, 0.95));
    const hemisphereLight = new THREE.HemisphereLight(0xfff8ec, 0x766758, 0.6);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);
    const keyLight = new THREE.DirectionalLight(0xffe8c9, 0.9);
    keyLight.position.set(-8, 11, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xfff7eb, 0.45);
    fillLight.position.set(6, 7, 4);
    scene.add(fillLight);

    const addModel = (object: THREE.Group) => {
      if (isDisposed) return;
      scene.add(object);

      // Retrieve the concrete wall material from Plane001
      const plane001 = object.getObjectByName("Plane001") as THREE.Mesh | undefined;
      const wallMaterial = plane001?.material
        ? (Array.isArray(plane001.material) ? plane001.material[0] : plane001.material)
        : null;

      if (wallMaterial) {
        // 1. Match the white background behind the sofa with the concrete wall texture
        const bezMesh = object.getObjectByName("Без_названия8_20260512190452") as THREE.Mesh | undefined;
        if (bezMesh) {
          const bezMat = (wallMaterial as THREE.MeshPhongMaterial).clone();
          if (bezMat.map) {
            bezMat.map = (wallMaterial as THREE.MeshPhongMaterial).map!.clone();
            bezMat.map.wrapS = THREE.RepeatWrapping;
            bezMat.map.wrapT = THREE.RepeatWrapping;
            bezMat.map.repeat.set(1.4, 1.2);
            bezMat.map.needsUpdate = true;
          }
          bezMesh.material = bezMat;
        }

        // 2. Match the wall in front / to the side of the sofa with the concrete wall texture
        const plane003 = object.getObjectByName("Plane003") as THREE.Mesh | undefined;
        if (plane003) {
          const p3Mat = (wallMaterial as THREE.MeshPhongMaterial).clone();
          if (p3Mat.map) {
            p3Mat.map = (wallMaterial as THREE.MeshPhongMaterial).map!.clone();
            p3Mat.map.wrapS = THREE.RepeatWrapping;
            p3Mat.map.wrapT = THREE.RepeatWrapping;
            p3Mat.map.repeat.set(1.0, 1.0);
            p3Mat.map.needsUpdate = true;
          }
          plane003.material = p3Mat;
        }

        const plane002 = object.getObjectByName("Plane002") as THREE.Mesh | undefined;
        if (plane002) {
          plane002.material = wallMaterial;
        }
      }

      // Symmetrical center pivot of the seating ensemble (sofa cushions, rug, and coffee table)
      // Placed facing the front wall of the TV (+Z towards Plane002)
      const sofaCenter = new THREE.Vector3(95, 350, -700);

      const sofaPivot = new THREE.Group();
      sofaPivot.name = "SofaPivot";
      sofaPivot.position.copy(sofaCenter);
      scene.add(sofaPivot);
      sofaPivotRef.current = sofaPivot;

      const roomPivot = new THREE.Group();
      roomPivot.name = "RoomPivot";
      roomPivot.position.set(-280, 420, -370);
      scene.add(roomPivot);
      roomPivotRef.current = roomPivot;

      // Split material003 into floor living-room items (floor lamp, side table, accessories)
      // and ceiling fixtures (spots, overhead lights)
      const m3 = object.getObjectByName("material003") as THREE.Mesh | undefined;
      let m3Furniture: THREE.Mesh | null = null;
      let m3Ceiling: THREE.Mesh | null = null;
      if (m3) {
        object.updateMatrixWorld(true);
        const { lowMesh, highMesh } = splitMeshByHeight(m3, 1200);
        m3Furniture = lowMesh;
        m3Ceiling = highMesh;
        if (m3.parent) {
          m3.parent.remove(m3);
        }
      }

      // Group all sofa seating ensemble elements (sofa frame, cushions, rug, coffee table, side table, floor lamp)
      // under sofaPivot so they are moveable together with the sofa, placed facing the front wall of the TV
      const sofaMeshNames = ["material", "material002", "Cube001"];
      const sofaMeshes: THREE.Object3D[] = [];
      const roomMeshes: THREE.Object3D[] = [];

      if (m3Furniture) sofaMeshes.push(m3Furniture);
      if (m3Ceiling) roomMeshes.push(m3Ceiling);

      object.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          if (c === m3) return;
          if (sofaMeshNames.includes(c.name)) {
            sofaMeshes.push(c);
          } else {
            roomMeshes.push(c);
          }
        }
      });

      sofaMeshes.forEach((m) => sofaPivot.attach(m));
      roomMeshes.forEach((m) => roomPivot.attach(m));

      // Attach the clear AZS Solutions brand tag directly to the front base of the sofa
      const brandTag = createFabricBrandPatch();
      if (brandTag) {
        brandTag.position.set(520, 200, -934);
        brandTag.rotation.set(0, 0, 0);
        scene.add(brandTag);
        sofaPivot.attach(brandTag);
      }

      // Reposition and rotate the sofa ensemble to sit against the wall directly opposite the TV,
      // facing straight towards the TV (-X)
      sofaPivot.rotation.set(0, -Math.PI / 2, 0);
      sofaPivot.position.set(300, 350, -726);

      camera.position.copy(DEFAULT_CAMERA_POS);
      camera.lookAt(DEFAULT_TARGET);
      controls.target.copy(DEFAULT_TARGET);
      controls.update();

      setIsLoaded(true);
      setLoadError(null);
    };

    const textureAliases: Record<string, string> = {
      "13b446406e629dbc0a62586363b5c22f.jpg": "13b446406e629dbc0a62586363b5c22f.jpeg",
      "98b42d9fbaf885e3e3ac45dc95ca0454.jpg": "98b42d9fbaf885e3e3ac45dc95ca0454.jpeg",
      "ea0a4fedb17e6d61567237d9b1a4d2f1.jpg": "ea0a4fedb17e6d61567237d9b1a4d2f1.jpeg",
    };
    const textureManager = new THREE.LoadingManager();
    textureManager.setURLModifier((url) => {
      const fileName = decodeURIComponent(url.split("/").pop() ?? url);
      const alias = textureAliases[fileName];
      return alias ? `${url.slice(0, url.lastIndexOf("/") + 1)}${alias}` : url;
    });

    const fbxLoader = new FBXLoader(textureManager);
    fbxLoader.setResourcePath("/modals/sofa/textures/");
    fbxLoader.load(
      objPath,
      addModel,
      undefined,
      (error) => {
        console.error("Unable to load sofa FBX:", error);
        setLoadError("Unable to load the sofa model or its textures.");
      }
    );

    const render = () => {
      animationRef.current = requestAnimationFrame(render);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (isAutoRotatingRef.current) {
        if (controlTargetRef.current === "sofa" && sofaPivotRef.current) {
          sofaPivotRef.current.rotation.y += 0.01;
        } else if (controlTargetRef.current === "room" && roomPivotRef.current) {
          roomPivotRef.current.rotation.y += 0.01;
        }
      }
      renderer.render(scene, camera);
    };
    render();

    const resize = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      camera.aspect = aspect;
      camera.fov = calculateFov(aspect);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", resize);
      observer.disconnect();
      controls.dispose();
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      controlsRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      sofaPivotRef.current = null;
      roomPivotRef.current = null;
    };
  }, [objPath]);

  const setTargetMode = useCallback((target: ControlTarget) => {
    setControlTarget(target);
    controlTargetRef.current = target;
    if (controlsRef.current) {
      controlsRef.current.enabled = target === "all";
      if (target !== "all" && controlsRef.current.autoRotate) {
        controlsRef.current.autoRotate = false;
      }
    }
    interactedRef.current = true;
    setHasInteracted(true);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (controlTargetRef.current === "all") return;
    pointerStartRef.current = { x: e.clientX, y: e.clientY, active: true };
    interactedRef.current = true;
    setHasInteracted(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerStartRef.current.active || controlTargetRef.current === "all") return;
    const deltaX = e.clientX - pointerStartRef.current.x;
    pointerStartRef.current.x = e.clientX;
    pointerStartRef.current.y = e.clientY;

    if (controlTargetRef.current === "sofa" && sofaPivotRef.current) {
      sofaPivotRef.current.rotation.y += deltaX * 0.008;
    } else if (controlTargetRef.current === "room" && roomPivotRef.current) {
      roomPivotRef.current.rotation.y += deltaX * 0.008;
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerStartRef.current.active) {
      pointerStartRef.current.active = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  }, []);

  const rotateActivePivot = useCallback((direction: "left" | "right") => {
    const angle = direction === "left" ? -Math.PI / 8 : Math.PI / 8;
    if (controlTargetRef.current === "sofa" && sofaPivotRef.current) {
      sofaPivotRef.current.rotation.y += angle;
    } else if (controlTargetRef.current === "room" && roomPivotRef.current) {
      roomPivotRef.current.rotation.y += angle;
    } else if (controlsRef.current && cameraRef.current) {
      const offset = cameraRef.current.position.clone().sub(controlsRef.current.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      cameraRef.current.position.copy(controlsRef.current.target.clone().add(offset));
      controlsRef.current.update();
    }
    interactedRef.current = true;
    setHasInteracted(true);
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const preset = PRESETS[presetId];
    if (!camera || !controls || !preset) return;

    camera.position.copy(preset.pos);
    controls.target.copy(preset.target);
    camera.lookAt(preset.target);
    controls.update();

    setActivePreset(presetId);
    controls.autoRotate = false;
    setIsAutoRotating(false);
    isAutoRotatingRef.current = false;
    interactedRef.current = true;
    setHasInteracted(true);
  }, []);

  const resetView = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera && controls) {
      camera.position.copy(DEFAULT_CAMERA_POS);
      controls.target.copy(DEFAULT_TARGET);
      camera.lookAt(DEFAULT_TARGET);
      controls.autoRotate = false;
      controls.update();
    }
    if (sofaPivotRef.current) {
      sofaPivotRef.current.position.set(300, 350, -726);
      sofaPivotRef.current.rotation.set(0, -Math.PI / 2, 0);
    }
    if (roomPivotRef.current) {
      roomPivotRef.current.rotation.set(0, 0, 0);
    }
    interactedRef.current = false;
    setActivePreset("angle");
    setIsAutoRotating(false);
    isAutoRotatingRef.current = false;
    setHasInteracted(false);
  }, []);

  const toggleAutoRotate = useCallback(() => {
    setIsAutoRotating((current) => {
      const next = !current;
      isAutoRotatingRef.current = next;
      if (controlsRef.current) {
        controlsRef.current.autoRotate = next && controlTargetRef.current === "all";
      }
      return next;
    });
  }, []);

  const zoom = useCallback((direction: "in" | "out") => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const factor = direction === "in" ? 0.8 : 1.25;
    const offset = camera.position.clone().sub(controls.target).multiplyScalar(factor);
    const distance = THREE.MathUtils.clamp(
      offset.length(),
      controls.minDistance,
      controls.maxDistance
    );
    camera.position.copy(
      controls.target.clone().add(offset.normalize().multiplyScalar(distance))
    );
    controls.update();
    interactedRef.current = true;
    setHasInteracted(true);
  }, []);

  // Sync native fullscreen state changes (e.g. user pressing Esc key or browser controls)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const stageEl = stageRef.current;
    if (!stageEl) return;
    try {
      const isCurrentlyFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFs) {
        if (stageEl.requestFullscreen) {
          await stageEl.requestFullscreen();
        } else if ((stageEl as any).webkitRequestFullscreen) {
          await (stageEl as any).webkitRequestFullscreen();
        } else if ((stageEl as any).msRequestFullscreen) {
          await (stageEl as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn("Fullscreen toggle error:", error);
      // Fallback in-window fullscreen modal toggle if native API is restricted
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  const presets = [
    ["angle", "Angle"],
    ["front", "Front"],
    ["chaise", "Chaise"],
    ["overview", "Overview"],
  ] as const;

  return (
    <div
      ref={containerRef}
      className={`relative flex w-full flex-col ${
        isFullscreen ? "fixed inset-0 z-[9999] h-screen w-screen bg-[#252321]" : ""
      } ${className}`}
    >
      {/* 3D Stage: expands to 100vw and 100vh on fullscreen without letterboxing or black gaps */}
      <div
        ref={stageRef}
        className={`relative w-full overflow-hidden bg-[#252321] transition-all duration-150 ${
          isFullscreen
            ? "fixed inset-0 z-[9999] h-screen w-screen rounded-none border-0 shadow-none"
            : "h-[340px] sm:h-[380px] md:h-[420px] lg:h-[440px] xl:h-[460px] rounded-2xl border border-[#3E3A35] shadow-lg"
        } [&:fullscreen]:fixed [&:fullscreen]:inset-0 [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:rounded-none [&:fullscreen]:border-0 [&:-webkit-full-screen]:fixed [&:-webkit-full-screen]:inset-0 [&:-webkit-full-screen]:h-screen [&:-webkit-full-screen]:w-screen [&:-webkit-full-screen]:rounded-none [&:-webkit-full-screen]:border-0`}
      >
        
        {/* Top Controls: Preset Angles & Fullscreen Toggle */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#FAF8F5]/20 bg-[#FAF8F5]/90 backdrop-blur-md p-1 shadow-md">
            {presets.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => applyPreset(id)}
                className={`rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                  activePreset === id
                    ? "bg-[#37312D] text-[#FAF8F5] shadow-xs"
                    : "text-[#37312D] hover:bg-[#EAE4DC]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="pointer-events-auto rounded-full border border-white/40 bg-[#FAF8F5]/90 backdrop-blur-md p-2 text-[#37312D] hover:bg-white transition-colors cursor-pointer shadow-md"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Loading Overlay */}
        {!isLoaded && !loadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#252321]">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#4A453F] border-t-[#D4A373]" />
            <span className="text-xs tracking-wider uppercase text-[#A89F95]">Loading 3D Model...</span>
          </div>
        )}

        {/* Error Overlay */}
        {loadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#252321] p-6 text-center">
            <AlertCircle className="h-6 w-6 text-[#E07A5F]" />
            <p className="text-xs text-[#E8E2D9]">{loadError}</p>
          </div>
        )}

        {/* 3D Canvas with drag handlers for sofa/room modes */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="block w-full h-full touch-none cursor-grab outline-none active:cursor-grabbing"
          aria-label="Interactive 3D Solene Corner Sofa living room model"
        />

        {/* Mode-aware interaction guide */}
        {isLoaded && !hasInteracted && (
          <div className="pointer-events-none absolute bottom-16 left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#FAF8F5]/90 border border-[#E6DED6]/80 backdrop-blur-md px-3.5 py-1 text-[11px] text-[#37312D] shadow-sm">
            <span className="flex items-center gap-1.5 font-medium">
              <Compass className="h-3.5 w-3.5 text-[#C9936A]" />
              {controlTarget === "sofa"
                ? "Drag horizontally to spin sofa • Room stays static"
                : controlTarget === "room"
                ? "Drag horizontally to orbit room • Sofa stays static"
                : "Drag to orbit 360° | Scroll or pinch to zoom"}
            </span>
          </div>
        )}

        {/* Bottom Floating Bar: Mode Switcher & Quick Navigation */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          
          {/* Movement target switcher: Sofa static vs Room static vs All */}
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#FAF8F5]/20 bg-[#FAF8F5]/95 backdrop-blur-md p-1 shadow-md">
            <span className="text-[10px] uppercase font-semibold text-[#81766E] px-2 hidden sm:inline tracking-wider">
              Control:
            </span>
            <button
              type="button"
              onClick={() => setTargetMode("all")}
              className={`rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                controlTarget === "all"
                  ? "bg-[#37312D] text-[#FAF8F5] shadow-xs"
                  : "text-[#37312D] hover:bg-[#EAE4DC]"
              }`}
              title="Rotate all room elements together in 360° orbit"
            >
              <span>All 360°</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetMode("sofa")}
              className={`rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                controlTarget === "sofa"
                  ? "bg-[#37312D] text-[#FAF8F5] shadow-xs"
                  : "text-[#37312D] hover:bg-[#EAE4DC]"
              }`}
              title="Move/rotate sofa only while room & background stay static"
            >
              <span>Move Sofa</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetMode("room")}
              className={`rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                controlTarget === "room"
                  ? "bg-[#37312D] text-[#FAF8F5] shadow-xs"
                  : "text-[#37312D] hover:bg-[#EAE4DC]"
              }`}
              title="Move/orbit room while sofa stays static"
            >
              <span>Move Room</span>
            </button>
          </div>

          {/* Quick Rotation, Zoom & Reset tools */}
          <div className="pointer-events-auto ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => rotateActivePivot("left")}
              className="rounded-full border border-[#E6DED6]/80 bg-[#FAF8F5]/95 backdrop-blur-md p-1.5 text-[#37312D] hover:bg-white cursor-pointer transition-colors shadow-xs"
              title={controlTarget === "sofa" ? "Spin sofa left" : controlTarget === "room" ? "Spin room left" : "Rotate camera left"}
              aria-label="Rotate left"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => rotateActivePivot("right")}
              className="rounded-full border border-[#E6DED6]/80 bg-[#FAF8F5]/95 backdrop-blur-md p-1.5 text-[#37312D] hover:bg-white cursor-pointer transition-colors shadow-xs"
              title={controlTarget === "sofa" ? "Spin sofa right" : controlTarget === "room" ? "Spin room right" : "Rotate camera right"}
              aria-label="Rotate right"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleAutoRotate}
              className={`rounded-full border p-1.5 cursor-pointer backdrop-blur-md transition-colors shadow-xs ${
                isAutoRotating
                  ? "border-[#37312D] bg-[#37312D] text-white"
                  : "border-[#E6DED6]/80 bg-[#FAF8F5]/95 text-[#37312D] hover:bg-white"
              }`}
              title={isAutoRotating ? "Pause auto-spin" : "Auto-spin 360°"}
              aria-label={isAutoRotating ? "Pause auto-spin" : "Auto-spin 360°"}
            >
              {isAutoRotating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => zoom("in")}
              className="rounded-full border border-[#E6DED6]/80 bg-[#FAF8F5]/95 backdrop-blur-md p-1.5 text-[#37312D] hover:bg-white cursor-pointer transition-colors shadow-xs"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => zoom("out")}
              className="rounded-full border border-[#E6DED6]/80 bg-[#FAF8F5]/95 backdrop-blur-md p-1.5 text-[#37312D] hover:bg-white cursor-pointer transition-colors shadow-xs"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="flex items-center gap-1 rounded-full border border-[#E6DED6]/80 bg-[#FAF8F5]/95 backdrop-blur-md px-2.5 py-1 text-xs text-[#37312D] hover:bg-white cursor-pointer transition-colors shadow-xs"
              title="Reset view and rotations"
              aria-label="Reset view"
            >
              <span className="text-[11px] font-medium">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
