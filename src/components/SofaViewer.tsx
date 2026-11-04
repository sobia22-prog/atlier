"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  AlertCircle,
  Compass,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface SofaViewerProps {
  objPath?: string;
  className?: string;
}

// Camera placed inside the living room area so room boundaries and floor stay completely within view
const DEFAULT_TARGET = new THREE.Vector3(50, 430, -780);
const DEFAULT_CAMERA_POS = new THREE.Vector3(100, 700, 1000);
const BASE_FOV = 44;

function calculateFov(aspect: number): number {
  if (aspect < 1.35) {
    return Math.min(58, BASE_FOV / (aspect / 1.3));
  }
  return BASE_FOV;
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
    pos: new THREE.Vector3(50, 650, 950),
    target: new THREE.Vector3(50, 420, -800),
  },
  chaise: {
    pos: new THREE.Vector3(-800, 700, 750),
    target: new THREE.Vector3(-250, 420, -700),
  },
  overview: {
    pos: new THREE.Vector3(100, 1150, 900),
    target: new THREE.Vector3(50, 380, -750),
  },
};

export default function SofaViewer({
  objPath = "/modals/sofa/source/готовый.fbx",
  className = "",
}: SofaViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const stage = canvas?.parentElement;
    if (!container || !canvas || !stage) return;

    let isDisposed = false;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#EAE5DC");

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

      // Attach the clear AZS Solutions brand tag directly to the front base of the sofa
      const brandTag = createFabricBrandPatch();
      if (brandTag) {
        brandTag.position.set(520, 200, -934);
        brandTag.rotation.set(0, 0, 0);
        scene.add(brandTag);
      }

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
      controls.update();
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
    };
  }, [objPath]);

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
    interactedRef.current = false;
    setActivePreset("angle");
    setIsAutoRotating(false);
    setHasInteracted(false);
  }, []);

  const toggleAutoRotate = useCallback(() => {
    setIsAutoRotating((current) => {
      if (controlsRef.current) controlsRef.current.autoRotate = !current;
      return !current;
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

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn("Fullscreen toggle error:", error);
    }
  }, []);

  const presets = [
    ["angle", "Angle"],
    ["front", "Front"],
    ["chaise", "Chaise"],
    ["overview", "Overview"],
  ] as const;

  return (
    <div ref={containerRef} className={`relative flex w-full flex-col ${className}`}>
      {/* 3D Stage sized to keep everything inside the room without going out of bounds */}
      <div className="relative w-full h-[320px] sm:h-[360px] md:h-[400px] lg:h-[420px] xl:h-[440px] overflow-hidden rounded-2xl bg-[#EAE5DC] border border-[#E6DED6] shadow-sm">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute right-3 top-3 z-20 rounded-full border border-white/60 bg-white/90 p-2 text-[#37312D] hover:bg-white transition-colors sm:right-4 sm:top-4 cursor-pointer shadow-xs"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          aria-label="Toggle fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {!isLoaded && !loadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#EAE5DC]">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#B8B2AD] border-t-[#37312D]" />
            <span className="text-xs tracking-wider uppercase text-[#81766E]">Loading 3D Model...</span>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#EAE5DC] p-6 text-center">
            <AlertCircle className="h-6 w-6 text-[#B36851]" />
            <p className="text-xs text-[#37312D]">{loadError}</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="block w-full h-full touch-none cursor-grab outline-none active:cursor-grabbing"
          aria-label="Interactive 3D Solene Corner Sofa living room model"
        />

        {isLoaded && !hasInteracted && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#37312D]/85 backdrop-blur-md px-3.5 py-1 text-[11px] text-[#FAF8F5]">
            <span className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-[#FAF8F5]" />
              Drag to orbit 360° | Scroll or pinch to zoom
            </span>
          </div>
        )}
      </div>

      {/* Preset and camera controls */}
      <div className="mt-2.5 flex w-full flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-1 rounded-full border border-[#E6DED6] bg-[#F2EDE6]/90 p-1">
          {presets.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                activePreset === id
                  ? "bg-[#37312D] text-[#FAF8F5] shadow-xs"
                  : "text-[#37312D] hover:bg-white/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleAutoRotate}
            className={`rounded-full border p-1.5 cursor-pointer transition-colors ${
              isAutoRotating
                ? "border-[#37312D] bg-[#37312D] text-white"
                : "border-[#E6DED6] bg-white text-[#37312D] hover:bg-[#FAF8F5]"
            }`}
            title={isAutoRotating ? "Pause room orbit" : "Auto-orbit room 360°"}
            aria-label={isAutoRotating ? "Pause room orbit" : "Auto-orbit room 360°"}
          >
            {isAutoRotating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => zoom("in")}
            className="rounded-full border border-[#E6DED6] bg-white p-1.5 text-[#37312D] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => zoom("out")}
            className="rounded-full border border-[#E6DED6] bg-white p-1.5 text-[#37312D] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="flex items-center gap-1.5 rounded-full border border-[#E6DED6] bg-white px-2.5 py-1 text-xs text-[#37312D] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
            title="Reset view"
            aria-label="Reset view"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline text-[11px]">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
