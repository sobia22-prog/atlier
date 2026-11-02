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
  Home,
  Sparkles,
} from "lucide-react";

interface SofaViewerProps {
  objPath?: string;
  mtlPath?: string;
  className?: string;
}

// Generates an authentic woven linen fabric label embossed with the brand text
function createFabricBrandPatch(titleText: string, subtitleText: string, width = 0.72, height = 0.24) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 340;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Warm ivory/cream linen base matching sofa upholstery (#DDD5C7)
  ctx.fillStyle = "#DDD5C7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle cross-weave linen texture
  ctx.fillStyle = "rgba(0, 0, 0, 0.022)";
  for (let x = 0; x < canvas.width; x += 4) {
    ctx.fillRect(x, 0, 2, canvas.height);
  }
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillRect(0, y, canvas.width, 2);
  }

  // Woven tailored perimeter seam stitches (fine artisan thread)
  ctx.strokeStyle = "rgba(75, 65, 55, 0.38)";
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 8]);
  ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
  ctx.setLineDash([]);

  // Inner subtle pressed seam border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Debossed lighting highlight (offset slightly down)
  ctx.font = "bold 68px 'Cormorant Garamond', Georgia, serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.fillText(titleText, canvas.width / 2, canvas.height / 2 - 20);

  // Main embossed lettering
  ctx.fillStyle = "#322A24";
  ctx.fillText(titleText, canvas.width / 2, canvas.height / 2 - 22);

  // Subtitle / Couture Edition
  ctx.font = "600 22px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillText(subtitleText, canvas.width / 2, canvas.height / 2 + 56);
  ctx.fillStyle = "#6E6258";
  ctx.fillText(subtitleText, canvas.width / 2, canvas.height / 2 + 54);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  const patchGeo = new THREE.PlaneGeometry(width, height);
  const patchMat = new THREE.MeshLambertMaterial({
    map: texture,
  });
  const patchMesh = new THREE.Mesh(patchGeo, patchMat);
  return patchMesh;
}

// Generates an authentic Scandinavian white oak floor plank texture
function createOakFloorTexture() {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Base warm Scandinavian natural oak tone
  ctx.fillStyle = "#D6C7B3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const plankHeight = 128;
  const plankWidths = [380, 420, 350, 440, 390];

  for (let row = 0; row < 8; row++) {
    const y = row * plankHeight;
    const toneOffset = (((row * 7) % 5) - 2) * 4;
    ctx.fillStyle = `rgba(${218 + toneOffset}, ${203 + toneOffset}, ${183 + toneOffset}, 0.38)`;
    ctx.fillRect(0, y, canvas.width, plankHeight);

    // Plank joints
    let currX = (row * 190) % 360;
    while (currX < canvas.width) {
      ctx.fillStyle = "rgba(75, 62, 50, 0.28)";
      ctx.fillRect(currX, y, 2, plankHeight);
      currX += plankWidths[row % plankWidths.length];
    }

    // Plank edge bevel groove
    ctx.fillStyle = "rgba(65, 52, 42, 0.30)";
    ctx.fillRect(0, y + plankHeight - 2, canvas.width, 2);

    // Fine grain streaks
    ctx.fillStyle = "rgba(70, 55, 42, 0.035)";
    for (let g = 0; g < 12; g++) {
      ctx.fillRect(0, y + 10 + g * 10, canvas.width, 1.5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

// Generates a soft circular alpha falloff map for the floor so it blends seamlessly into room panorama
function createFloorAlphaMap() {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Radial gradient: white in center (opaque), fading to black at outer edge (transparent)
  const grad = ctx.createRadialGradient(256, 256, 120, 256, 256, 252);
  grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.55, "rgba(255, 255, 255, 0.96)");
  grad.addColorStop(0.85, "rgba(255, 255, 255, 0.40)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
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
  const roomTextureRef = useRef<THREE.Texture | null>(null);
  const shadowPlaneRef = useRef<THREE.Mesh | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameId = useRef<number | null>(null);
  const initialCamPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const initialTarget = useRef<THREE.Vector3>(new THREE.Vector3());
  const boundingSphereRef = useRef<THREE.Sphere | null>(null);
  const fitDistanceRef = useRef<number>(7.5);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [activePreset, setActivePreset] = useState("perspective");
  const [environmentMode, setEnvironmentMode] = useState<"room" | "studio">("room");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let isDisposed = false;

    // 1. Scene setup: Modern 360 architectural room panorama (with neutral studio fallback)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd0ccc8);
    sceneRef.current = scene;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "/textures/room-panorama.jpg",
      (roomTexture) => {
        if (isDisposed) return;
        roomTexture.mapping = THREE.EquirectangularReflectionMapping;
        roomTexture.colorSpace = THREE.SRGBColorSpace;
        roomTextureRef.current = roomTexture;

        if (environmentMode === "room") {
          scene.background = roomTexture;
          scene.environment = roomTexture;
        }
      },
      undefined,
      (err) => {
        console.warn("Room panorama texture load error:", err);
      }
    );

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
    controls.autoRotate = false; // Static by default, never rotating unless user clicks rotate
    controls.autoRotateSpeed = 1.0;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Keep camera above floor level
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

            // 1. Scandinavian Oak Wood Floor Plane grounding the sofa
            const floorTexture = createOakFloorTexture();
            const floorAlpha = createFloorAlphaMap();
            const floorGeo = new THREE.PlaneGeometry(36, 36);
            const floorMat = new THREE.MeshLambertMaterial({
              map: floorTexture || undefined,
              alphaMap: floorAlpha || undefined,
              transparent: !!floorAlpha,
              color: floorTexture ? 0xffffff : 0xd8c8b4,
              depthWrite: false,
            });
            const floorMesh = new THREE.Mesh(floorGeo, floorMat);
            floorMesh.rotation.x = -Math.PI / 2;
            floorMesh.position.set(center.x, -0.082, center.z);
            scene.add(floorMesh);
            floorMeshRef.current = floorMesh;

            // 2. Realistic ground contact shadow directly under the sofa base and feet
            const shadowCanvas = document.createElement("canvas");
            shadowCanvas.width = 512;
            shadowCanvas.height = 512;
            const sCtx = shadowCanvas.getContext("2d");
            if (sCtx) {
              const grad = sCtx.createRadialGradient(256, 256, 40, 256, 256, 248);
              grad.addColorStop(0, "rgba(22, 18, 14, 0.58)");
              grad.addColorStop(0.35, "rgba(22, 18, 14, 0.38)");
              grad.addColorStop(0.7, "rgba(22, 18, 14, 0.12)");
              grad.addColorStop(1, "rgba(22, 18, 14, 0)");
              sCtx.fillStyle = grad;
              sCtx.fillRect(0, 0, 512, 512);
            }
            const sTexture = new THREE.CanvasTexture(shadowCanvas);
            const shadowPlaneGeo = new THREE.PlaneGeometry(8.5, 7.5);
            const shadowPlaneMat = new THREE.MeshBasicMaterial({
              map: sTexture,
              transparent: true,
              opacity: 0.92,
              depthWrite: false,
            });
            const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
            shadowPlane.rotation.x = -Math.PI / 2;
            shadowPlane.position.set(center.x, -0.078, center.z);
            scene.add(shadowPlane);
            shadowPlaneRef.current = shadowPlane;

            // 3. AZS Solutions brand fabric label seamlessly integrated on the front chaise
            const frontFabricPatch = createFabricBrandPatch(
              "AZS SOLUTIONS",
              "SIGNATURE LIVING · ATELIER EDITION ©",
              0.72,
              0.24
            );
            if (frontFabricPatch) {
              // Placed along the front lower face of the chaise cushion
              frontFabricPatch.position.set(0.0, 0.24, 0.005);
              object.add(frontFabricPatch);
            }

            // 4. Side armrest seam tag
            const sideFabricTag = createFabricBrandPatch(
              "AZS SOLUTIONS",
              "ATELIER SOREL · BESPOKE EDITION ©",
              0.52,
              0.18
            );
            if (sideFabricTag) {
              sideFabricTag.position.set(-1.005, 0.35, -1.2);
              sideFabricTag.rotation.y = -Math.PI / 2;
              object.add(sideFabricTag);
            }

            scene.add(object);

            // Responsive framing:
            // On desktop/laptop (aspect >= 1), display the sofa large and heroic (~75% of stage).
            // On mobile (aspect < 1), scale distance so entire horizontal span fits comfortably without clipping.
            const aspect = camera.aspect;
            let fitDistance: number;
            if (aspect < 1.0) {
              const vFOV = (camera.fov * Math.PI) / 180;
              const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect);
              fitDistance = (sphere.radius / Math.sin(hFOV / 2)) * 1.12;
            } else {
              fitDistance = sphere.radius * 2.55;
            }
            fitDistanceRef.current = fitDistance;

            // Natural standing eye-level perspective looking down at sofa resting on the floor
            const lookTarget = new THREE.Vector3(center.x, 0.38, center.z);
            const dir = new THREE.Vector3(0.72, 0.52, 0.82).normalize();
            const camPos = lookTarget.clone().add(dir.multiplyScalar(fitDistance));

            camera.position.copy(camPos);
            controls.target.copy(lookTarget);
            controls.minDistance = fitDistance * 0.4;
            controls.maxDistance = fitDistance * 2.8;
            controls.update();

            initialCamPos.current.copy(camPos);
            initialTarget.current.copy(lookTarget);

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
        let fitDistance: number;
        if (newAspect < 1.0) {
          const vFOV = (camera.fov * Math.PI) / 180;
          const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * newAspect);
          fitDistance = (boundingSphereRef.current.radius / Math.sin(hFOV / 2)) * 1.12;
        } else {
          fitDistance = boundingSphereRef.current.radius * 2.55;
        }
        fitDistanceRef.current = fitDistance;

        const dir = new THREE.Vector3(0.72, 0.52, 0.82).normalize();
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
      dir.set(0.72, 0.52, 0.82).normalize();
    } else if (presetId === "front") {
      dir.set(0, 0.38, 1.05).normalize();
    } else if (presetId === "profile") {
      dir.set(1.05, 0.38, 0).normalize();
    } else if (presetId === "aerial") {
      dir.set(0.2, 1.1, 0.25).normalize();
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

  const toggleEnvironment = useCallback(() => {
    setEnvironmentMode((prev) => {
      const nextMode = prev === "room" ? "studio" : "room";
      const scene = sceneRef.current;
      if (scene) {
        if (nextMode === "room" && roomTextureRef.current) {
          scene.background = roomTextureRef.current;
          scene.environment = roomTextureRef.current;
          if (floorMeshRef.current) floorMeshRef.current.visible = true;
          if (shadowPlaneRef.current) shadowPlaneRef.current.visible = true;
        } else {
          scene.background = new THREE.Color(0xd0ccc8);
          scene.environment = null;
          if (floorMeshRef.current) floorMeshRef.current.visible = false;
          if (shadowPlaneRef.current) shadowPlaneRef.current.visible = true;
        }
      }
      return nextMode;
    });
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
      <div className="relative w-full h-[340px] sm:h-[440px] md:h-[520px] lg:h-[620px] xl:h-[660px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#D0CCC8] border border-[#C5BFBA] shadow-sm flex items-center justify-center transition-all">
        
        {/* Top Badges & Environment Switcher */}
        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-white/92 backdrop-blur-md text-[10px] sm:text-[11px] font-medium tracking-wider uppercase text-[#37312D] border border-white/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8B9A6] animate-pulse" />
            {environmentMode === "room" ? "3D Living Room" : "3D Studio"}
          </span>

          <button
            type="button"
            onClick={toggleEnvironment}
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-white/92 hover:bg-white text-[10px] sm:text-[11px] font-medium text-[#37312D] border border-white/60 shadow-2xs transition-all cursor-pointer backdrop-blur-md"
            title="Switch between Living Room and Studio backdrop"
          >
            {environmentMode === "room" ? (
              <>
                <Sparkles className="w-3 h-3 text-[#B36851]" />
                <span className="hidden xs:inline">Studio View</span>
              </>
            ) : (
              <>
                <Home className="w-3 h-3 text-[#B36851]" />
                <span className="hidden xs:inline">Living Room</span>
              </>
            )}
          </button>
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
