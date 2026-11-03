"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
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
import { buildLivingRoom } from "./LivingRoomEnvironment";

interface SofaViewerProps {
  objPath?: string;
  mtlPath?: string;
  className?: string;
}

const CAMERA_DIRECTION = new THREE.Vector3(0.72, 0.32, 0.82).normalize();
const MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.6;

function getFitDistance(bounds: THREE.Box3, target: THREE.Vector3, fov: number, aspect: number) {
  const verticalFov = THREE.MathUtils.degToRad(fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
  const forward = CAMERA_DIRECTION.clone().negate();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();
  let halfWidth = 0;
  let halfHeight = 0;
  let nearestCameraDepth = 0;

  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const offset = new THREE.Vector3(x, y, z).sub(target);
        halfWidth = Math.max(halfWidth, Math.abs(offset.dot(right)));
        halfHeight = Math.max(halfHeight, Math.abs(offset.dot(up)));
        nearestCameraDepth = Math.max(nearestCameraDepth, offset.dot(CAMERA_DIRECTION));
      }
    }
  }

  const horizontalDistance = nearestCameraDepth + halfWidth / Math.tan(horizontalFov / 2);
  const verticalDistance = nearestCameraDepth + halfHeight / Math.tan(verticalFov / 2);
  return Math.max(horizontalDistance, verticalDistance) * 1.04;
}

function createModelPivot(object: THREE.Group, center: THREE.Vector3) {
  const pivot = new THREE.Group();
  pivot.position.copy(center);
  object.position.sub(center);
  pivot.add(object);
  return pivot;
}

function createFabricBrandPatch(title: string, subtitle: string, width: number, height: number) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 400;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#D9CEBD";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(70, 56, 42, 0.035)";
  for (let x = 0; x < canvas.width; x += 8) context.fillRect(x, 0, 3, canvas.height);
  for (let y = 0; y < canvas.height; y += 8) context.fillRect(0, y, canvas.width, 3);

  context.strokeStyle = "rgba(88, 69, 50, 0.58)";
  context.lineWidth = 7;
  context.setLineDash([18, 12]);
  context.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);
  context.setLineDash([]);
  context.strokeStyle = "rgba(255, 255, 255, 0.62)";
  context.lineWidth = 3;
  context.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "bold 122px Georgia, serif";
  context.fillStyle = "#3B3027";
  context.fillText(title, canvas.width / 2, 176);
  context.font = "600 38px sans-serif";
  context.fillStyle = "#685949";
  context.fillText(subtitle, canvas.width / 2, 292);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const patch = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshLambertMaterial({ map: texture })
  );
  patch.name = "AZS Solutions front fabric label";
  return patch;
}

export default function SofaViewer({
  objPath = "/modals/obj/sofa.obj",
  mtlPath = "/modals/obj/sofa.mtl",
  className = "",
}: SofaViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const boundingBoxRef = useRef<THREE.Box3 | null>(null);
  const modelCenterRef = useRef<THREE.Vector3 | null>(null);
  const animationRef = useRef<number | null>(null);
  const zoomScaleRef = useRef(1);
  const autoRotateRef = useRef(false);
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
    scene.background = new THREE.Color(0xeae5dc);

    const camera = new THREE.PerspectiveCamera(
      36,
      stage.clientWidth / stage.clientHeight,
      0.1,
      100
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    const activePointers = new Map<number, { x: number; y: number }>();
    let activePointer: number | null = null;
    let previousPointer = { x: 0, y: 0 };
    let previousPinchDistance = 0;

    const getPinchDistance = () => {
      const [first, second] = Array.from(activePointers.values());
      return first && second
        ? Math.hypot(first.x - second.x, first.y - second.y)
        : 0;
    };

    const setZoomScale = (requestedScale: number) => {
      if (!modelRef.current) return;
      zoomScaleRef.current = THREE.MathUtils.clamp(requestedScale, MIN_ZOOM, MAX_ZOOM);
      modelRef.current.scale.setScalar(zoomScaleRef.current);
      interactedRef.current = true;
      setHasInteracted(true);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!modelRef.current) return;
      canvas.setPointerCapture(event.pointerId);
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      activePointer = activePointers.size === 1 ? event.pointerId : null;
      previousPointer = { x: event.clientX, y: event.clientY };
      previousPinchDistance = getPinchDistance();
      interactedRef.current = true;
      setHasInteracted(true);
      autoRotateRef.current = false;
      setIsAutoRotating(false);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!activePointers.has(event.pointerId) || !modelRef.current) return;
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (activePointers.size > 1) {
        const pinchDistance = getPinchDistance();
        if (previousPinchDistance > 0) {
          setZoomScale(zoomScaleRef.current * (pinchDistance / previousPinchDistance));
        }
        previousPinchDistance = pinchDistance;
        event.preventDefault();
        return;
      }

      if (event.pointerId !== activePointer) return;
      modelRef.current.rotation.y += (event.clientX - previousPointer.x) * 0.008;
      previousPointer = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      const remaining = Array.from(activePointers.entries())[0];
      activePointer = remaining?.[0] ?? null;
      if (remaining) previousPointer = remaining[1];
      previousPinchDistance = 0;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoomScale(zoomScaleRef.current * Math.exp(-event.deltaY * 0.002));
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    scene.add(new THREE.AmbientLight(0xfff4e5, 0.9));
    const hemisphereLight = new THREE.HemisphereLight(0xfff8ec, 0x766758, 0.55);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);
    const keyLight = new THREE.DirectionalLight(0xffe8c9, 1.0);
    keyLight.position.set(-8, 11, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xfff7eb, 0.45);
    fillLight.position.set(6, 7, 4);
    scene.add(fillLight);

    const addModel = (object: THREE.Group, applyMaterialFinish: boolean) => {
      if (isDisposed) return;

      if (applyMaterialFinish) {
        object.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const rawMaterials = Array.isArray(child.material) ? child.material : [child.material];
          const matteMaterials = rawMaterials.map((material) => {
            if (!(material instanceof THREE.MeshPhongMaterial)) return material;
            const color = material.name === "m_sofa_bottom"
              ? new THREE.Color(0xd5c8b3)
              : new THREE.Color(
                  Math.pow(material.color.r, 1 / 2.2),
                  Math.pow(material.color.g, 1 / 2.2),
                  Math.pow(material.color.b, 1 / 2.2)
                );
            return new THREE.MeshLambertMaterial({ name: material.name, color });
          });
          child.material = Array.isArray(child.material) ? matteMaterials : matteMaterials[0];
        });
      }

      const bounds = new THREE.Box3().setFromObject(object);
      const center = bounds.getCenter(new THREE.Vector3());
      const frontPatch = createFabricBrandPatch("AZS SOLUTIONS", "ATELIER SOREL", 1.3, 0.3);
      if (frontPatch) {
        frontPatch.position.set(center.x + 1.1, 0.35, -2.96);
        object.add(frontPatch);
      }

      scene.add(buildLivingRoom(center).roomGroup);
      const pivot = createModelPivot(object, center);
      modelRef.current = pivot;
      modelCenterRef.current = center;
      boundingBoxRef.current = bounds;
      scene.add(pivot);

      const target = new THREE.Vector3(center.x, 0.38, center.z);
      const distance = getFitDistance(bounds, target, camera.fov, camera.aspect);
      camera.position.copy(target).add(CAMERA_DIRECTION.clone().multiplyScalar(distance));
      camera.lookAt(target);
      setIsLoaded(true);
      setLoadError(null);
    };

    const loadPlainObj = (path: string, fallbackPath?: string) => {
      new OBJLoader().load(
        path,
        (object) => addModel(object, false),
        undefined,
        () => {
          if (fallbackPath) loadPlainObj(fallbackPath);
          else setLoadError("Unable to load original sofa.obj");
        }
      );
    };

    new MTLLoader().load(
      mtlPath,
      (materials) => {
        if (isDisposed) return;
        materials.preload();
        const loader = new OBJLoader();
        loader.setMaterials(materials);
        loader.load(
          objPath,
          (object) => addModel(object, true),
          undefined,
          () => loadPlainObj(objPath, objPath === "/modals/sofa.obj" ? undefined : "/modals/sofa.obj")
        );
      },
      undefined,
      () => loadPlainObj(objPath, objPath === "/modals/sofa.obj" ? undefined : "/modals/sofa.obj")
    );

    const render = () => {
      animationRef.current = requestAnimationFrame(render);
      if (autoRotateRef.current && modelRef.current) modelRef.current.rotation.y += 0.004;
      renderer.render(scene, camera);
    };
    render();

    const resize = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      const bounds = boundingBoxRef.current;
      const center = modelCenterRef.current;
      if (bounds && center && !interactedRef.current) {
        const target = new THREE.Vector3(center.x, 0.38, center.z);
        const distance = getFitDistance(bounds, target, camera.fov, camera.aspect);
        camera.position.copy(target).add(CAMERA_DIRECTION.clone().multiplyScalar(distance));
        camera.lookAt(target);
      }
    };
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", resize);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      modelRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      boundingBoxRef.current = null;
      modelCenterRef.current = null;
    };
  }, [objPath, mtlPath]);

  const applyPreset = useCallback((preset: string) => {
    if (!modelRef.current) return;
    const yaw: Record<string, number> = {
      angle: 0,
      front: 0.72,
      side: 0.72 + Math.PI / 2,
      back: Math.PI,
    };
    modelRef.current.rotation.set(0, yaw[preset] ?? 0, 0);
    setActivePreset(preset);
    autoRotateRef.current = false;
    setIsAutoRotating(false);
    interactedRef.current = true;
    setHasInteracted(true);
  }, []);

  const resetView = useCallback(() => {
    if (modelRef.current) {
      modelRef.current.rotation.set(0, 0, 0);
      modelRef.current.scale.setScalar(1);
    }
    zoomScaleRef.current = 1;
    interactedRef.current = false;
    autoRotateRef.current = false;
    setActivePreset("angle");
    setIsAutoRotating(false);
    setHasInteracted(false);
  }, []);

  const toggleAutoRotate = useCallback(() => {
    setIsAutoRotating((current) => {
      autoRotateRef.current = !current;
      return !current;
    });
  }, []);

  const zoom = useCallback((direction: "in" | "out") => {
    if (!modelRef.current) return;
    const factor = direction === "in" ? 1.32 : 0.76;
    zoomScaleRef.current = THREE.MathUtils.clamp(zoomScaleRef.current * factor, MIN_ZOOM, MAX_ZOOM);
    modelRef.current.scale.setScalar(zoomScaleRef.current);
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
    ["side", "Side"],
    ["back", "Back"],
  ] as const;

  return (
    <div ref={containerRef} className={`relative flex w-full flex-col items-center ${className}`}>
      <div className="relative h-[320px] w-full overflow-hidden rounded-xl border border-[#C5BFBA] bg-[#EAE5DC] sm:h-[360px] md:h-[400px] lg:h-[440px] xl:h-[470px]">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute right-3 top-3 z-20 rounded-full border border-white/60 bg-white/90 p-2 text-[#37312D] sm:right-5 sm:top-5"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          aria-label="Toggle fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        {!isLoaded && !loadError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#EAE5DC]">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#B8B2AD] border-t-[#37312D]" />
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
          className="h-full w-full touch-none cursor-grab outline-none active:cursor-grabbing"
          aria-label="Interactive sofa in a fixed luxury living room"
        />
        {isLoaded && !hasInteracted && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#37312D]/85 px-3 py-1.5 text-[10px] text-[#FAF8F5] sm:bottom-5 sm:text-xs">
            <span className="flex items-center gap-2"><Compass className="h-3.5 w-3.5" />Drag to rotate | Scroll or pinch to zoom</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-full border border-[#E6DED6] bg-[#F2EDE6]/90 p-1">
          {presets.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
              className={`rounded-full px-3 py-1 text-[11px] transition-colors ${activePreset === id ? "bg-[#37312D] text-[#FAF8F5]" : "text-[#37312D] hover:bg-white/70"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleAutoRotate}
            className={`rounded-full border p-2 ${isAutoRotating ? "border-[#37312D] bg-[#37312D] text-white" : "border-[#E6DED6] bg-white text-[#37312D]"}`}
            title={isAutoRotating ? "Pause rotation" : "Auto-rotate sofa"}
            aria-label={isAutoRotating ? "Pause rotation" : "Auto-rotate sofa"}
          >
            {isAutoRotating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button type="button" onClick={() => zoom("in")} className="rounded-full border border-[#E6DED6] bg-white p-2 text-[#37312D]" title="Zoom in" aria-label="Zoom in">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => zoom("out")} className="rounded-full border border-[#E6DED6] bg-white p-2 text-[#37312D]" title="Zoom out" aria-label="Zoom out">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={resetView} className="flex items-center gap-1.5 rounded-full border border-[#E6DED6] bg-white px-3 py-1.5 text-xs text-[#37312D]" title="Reset view" aria-label="Reset view">
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
