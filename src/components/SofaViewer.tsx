"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  AlertCircle,
  Eye,
} from "lucide-react";

interface SofaViewerProps {
  objPath?: string;
  mtlPath?: string;
  className?: string;
}

export default function SofaViewer({
  objPath = "/modals/obj/sofa.obj",
  mtlPath = "/modals/obj/sofa.mtl",
  className = "",
}: SofaViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animFrameId = useRef<number | null>(null);
  const initialCamPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const initialTarget = useRef<THREE.Vector3>(new THREE.Vector3());
  const boundingSphereRef = useRef<THREE.Sphere | null>(null);
  const fitDistanceRef = useRef<number>(7.5);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [activePreset, setActivePreset] = useState("perspective");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let isDisposed = false;

    // 1. Scene matching the neutral photographic studio in sofa1.jpg
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd0ccc8); // Exact neutral studio grey from reference
    sceneRef.current = scene;

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 100);
    cameraRef.current = camera;

    // 3. Renderer with neutral studio color calibration
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.04;
    controls.minDistance = 2.5;
    controls.maxDistance = 16;
    controlsRef.current = controls;

    controls.addEventListener("start", () => {
      setHasInteracted(true);
      controls.autoRotate = false;
      setIsAutoRotating(false);
    });

    // 5. Clean, Neutral Daylight Lighting (No yellow/beige tint, no harsh plastic shine)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd0ccc8, 0.85);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const softKey = new THREE.DirectionalLight(0xffffff, 0.75);
    softKey.position.set(5, 12, 8);
    scene.add(softKey);

    const softFill = new THREE.DirectionalLight(0xffffff, 0.55);
    softFill.position.set(-6, 8, -5);
    scene.add(softFill);

    // 6. Direct Load of original sofa.mtl and sofa.obj
    const mtlLoader = new MTLLoader();
    mtlLoader.load(
      mtlPath,
      (materials) => {
        if (isDisposed) return;
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
          objPath,
          (object) => {
            if (isDisposed) return;
            modelRef.current = object;

            // Apply true display gamma to original MTL colors with natural matte fabric finish
            object.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                  const rawMats = Array.isArray(mesh.material)
                    ? mesh.material
                    : [mesh.material];

                  const matteMats = rawMats.map((m: any) => {
                    const r = Math.pow(m.color.r, 1 / 2.2);
                    const g = Math.pow(m.color.g, 1 / 2.2);
                    const b = Math.pow(m.color.b, 1 / 2.2);

                    return new THREE.MeshLambertMaterial({
                      name: m.name,
                      color: new THREE.Color(r, g, b),
                    });
                  });

                  mesh.material = Array.isArray(mesh.material)
                    ? matteMats
                    : matteMats[0];
                }
              }
            });

            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            const sphere = box.getBoundingSphere(new THREE.Sphere());
            boundingSphereRef.current = sphere;

            scene.add(object);

            // Responsive framing: Calculate camera distance based on limiting FOV
            // so horizontal width on mobile screens never clips the sofa
            const vFOV = (camera.fov * Math.PI) / 180;
            const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * camera.aspect);
            const effectiveFOV = Math.min(vFOV, hFOV);
            const fitDistance = (sphere.radius / Math.sin(effectiveFOV / 2)) * 1.35;
            fitDistanceRef.current = fitDistance;

            const dir = new THREE.Vector3(0.72, 0.42, 0.82).normalize();
            const camPos = center.clone().add(dir.multiplyScalar(fitDistance));

            camera.position.copy(camPos);
            controls.target.copy(center);
            controls.minDistance = fitDistance * 0.4;
            controls.maxDistance = fitDistance * 2.8;
            controls.update();

            initialCamPos.current.copy(camPos);
            initialTarget.current.copy(center);

            setIsLoaded(true);
            setLoadError(null);
          },
          undefined,
          (err) => {
            console.error("Error loading sofa.obj:", err);
            if (objPath !== "/modals/sofa.obj") {
              const fallbackObjLoader = new OBJLoader();
              fallbackObjLoader.load(
                "/modals/sofa.obj",
                (fallbackObj) => {
                  if (isDisposed) return;
                  modelRef.current = fallbackObj;
                  const box = new THREE.Box3().setFromObject(fallbackObj);
                  const center = box.getCenter(new THREE.Vector3());
                  scene.add(fallbackObj);
                  camera.position.set(center.x + 5, center.y + 3.5, center.z + 6);
                  controls.target.copy(center);
                  controls.update();
                  setIsLoaded(true);
                },
                undefined,
                () => setLoadError("Unable to load original sofa.obj")
              );
            } else {
              setLoadError("Unable to load original sofa.obj");
            }
          }
        );
      },
      undefined,
      (err) => {
        console.warn("MTL load error, falling back to direct OBJ:", err);
        const objLoader = new OBJLoader();
        objLoader.load(
          objPath,
          (object) => {
            if (isDisposed) return;
            modelRef.current = object;
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            scene.add(object);
            camera.position.set(center.x + 5, center.y + 3.5, center.z + 6);
            controls.target.copy(center);
            controls.update();
            setIsLoaded(true);
          },
          undefined,
          () => setLoadError("Unable to load original sofa.obj")
        );
      }
    );

    // 7. Render Loop
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const newAspect = w / h;
      camera.aspect = newAspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      if (boundingSphereRef.current && !hasInteracted) {
        const vFOV = (camera.fov * Math.PI) / 180;
        const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * newAspect);
        const effectiveFOV = Math.min(vFOV, hFOV);
        const fitDistance = (boundingSphereRef.current.radius / Math.sin(effectiveFOV / 2)) * 1.35;
        fitDistanceRef.current = fitDistance;

        const dir = new THREE.Vector3(0.72, 0.42, 0.82).normalize();
        const camPos = initialTarget.current.clone().add(dir.multiplyScalar(fitDistance));
        camera.position.copy(camPos);
        initialCamPos.current.copy(camPos);
        controls.update();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      controls.dispose();
      renderer.dispose();
    };
  }, [objPath, mtlPath, hasInteracted]);

  // Camera Presets
  const applyPreset = useCallback((presetId: string) => {
    setActivePreset(presetId);
    setHasInteracted(true);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const target = initialTarget.current;
    if (!camera || !controls) return;

    const dist = fitDistanceRef.current || 7.5;
    const dir = new THREE.Vector3();

    if (presetId === "perspective") {
      dir.set(0.72, 0.42, 0.82).normalize();
    } else if (presetId === "front") {
      dir.set(0, 0.28, 1.0).normalize();
    } else if (presetId === "profile") {
      dir.set(1.0, 0.28, 0).normalize();
    } else if (presetId === "aerial") {
      dir.set(0.2, 1.0, 0.25).normalize();
    }

    camera.position.copy(target).add(dir.multiplyScalar(dist));
    controls.target.copy(target);
    controls.update();
  }, []);

  const handleResetView = useCallback(() => {
    setActivePreset("perspective");
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera && controls) {
      camera.position.copy(initialCamPos.current);
      controls.target.copy(initialTarget.current);
      controls.update();
    }
  }, []);

  const toggleAutoRotate = useCallback(() => {
    setIsAutoRotating((prev) => {
      const next = !prev;
      if (controlsRef.current) {
        controlsRef.current.autoRotate = next;
      }
      return next;
    });
  }, []);

  const handleZoom = useCallback((direction: "in" | "out") => {
    setHasInteracted(true);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const factor = direction === "in" ? 0.85 : 1.18;
    const offset = camera.position.clone().sub(controls.target);
    offset.multiplyScalar(factor);
    camera.position.copy(controls.target).add(offset);
    controls.update();
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
    } catch (e) {
      console.warn("Fullscreen toggle error:", e);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col items-center select-none ${className}`}
    >
      {/* 3D Canvas Stage with Clean Neutral Studio Background matching sofa1.jpg */}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] lg:h-[560px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#D0CCC8] border border-[#C5BFBA] shadow-sm flex items-center justify-center transition-all">
        
        {/* Top Badge */}
        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] sm:text-[11px] font-medium tracking-wider uppercase text-[#37312D] border border-white/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8B9A6] animate-pulse" />
            Interactive 3D View
          </span>
        </div>

        {/* Fullscreen Button */}
        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white text-[#37312D] text-xs font-medium border border-white/60 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#81766E]" />
          </button>
        </div>

        {/* Loading State */}
        {!isLoaded && !loadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#D0CCC8] p-6 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#B8B2AD] border-t-[#37312D] animate-spin mb-3" />
            <p className="font-serif text-sm tracking-wide text-[#37312D]">
              Loading 3D Sofa...
            </p>
          </div>
        )}

        {/* Error Fallback */}
        {loadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#D0CCC8] p-6 text-center max-w-sm mx-auto">
            <AlertCircle className="w-6 h-6 text-[#B36851] mb-2" />
            <p className="text-xs text-[#37312D] mb-3">{loadError}</p>
          </div>
        )}

        {/* Pure Three.js Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
        />

        {/* Subtle Guidance Badge */}
        {isLoaded && !hasInteracted && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-700">
            <div className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#37312D]/85 backdrop-blur-md text-[#FAF8F5] text-[11px] sm:text-xs font-light tracking-wide shadow-md flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
              <Compass className="w-3.5 h-3.5 text-[#E8C6B7]" />
              <span>Drag to rotate · Pinch to zoom</span>
            </div>
          </div>
        )}
      </div>

      {/* Responsive Control Bar */}
      <div className="w-full mt-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-0.5">
        {/* Preset Angles */}
        <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-full bg-[#F2EDE6]/90 border border-[#E6DED6]">
          <span className="hidden md:inline-flex items-center pl-2 pr-1 text-[10px] font-medium tracking-wider text-[#81766E] uppercase">
            <Eye className="w-3 h-3 mr-1" />
            View:
          </span>
          <button
            type="button"
            onClick={() => applyPreset("perspective")}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
              activePreset === "perspective"
                ? "bg-[#37312D] text-[#FAF8F5]"
                : "text-[#37312D] hover:bg-white/60"
            }`}
          >
            Angle
          </button>
          <button
            type="button"
            onClick={() => applyPreset("front")}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
              activePreset === "front"
                ? "bg-[#37312D] text-[#FAF8F5]"
                : "text-[#37312D] hover:bg-white/60"
            }`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => applyPreset("profile")}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
              activePreset === "profile"
                ? "bg-[#37312D] text-[#FAF8F5]"
                : "text-[#37312D] hover:bg-white/60"
            }`}
          >
            Side
          </button>
          <button
            type="button"
            onClick={() => applyPreset("aerial")}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
              activePreset === "aerial"
                ? "bg-[#37312D] text-[#FAF8F5]"
                : "text-[#37312D] hover:bg-white/60"
            }`}
          >
            Top
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 ml-auto sm:ml-0">
          <button
            type="button"
            onClick={toggleAutoRotate}
            className={`p-1.5 sm:p-2 rounded-full text-xs border transition-colors cursor-pointer ${
              isAutoRotating
                ? "bg-[#37312D] text-[#FAF8F5] border-[#37312D]"
                : "bg-white text-[#37312D] border-[#E6DED6] hover:bg-[#F2EDE6]"
            }`}
            title={isAutoRotating ? "Pause" : "Rotate"}
            aria-label="Toggle Auto Rotation"
          >
            {isAutoRotating ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleZoom("in")}
            className="p-1.5 sm:p-2 rounded-full bg-white hover:bg-[#F2EDE6] text-[#37312D] border border-[#E6DED6] transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleZoom("out")}
            className="p-1.5 sm:p-2 rounded-full bg-white hover:bg-[#F2EDE6] text-[#37312D] border border-[#E6DED6] transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white hover:bg-[#F2EDE6] text-[#37312D] border border-[#E6DED6] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset"
            aria-label="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#81766E]" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
