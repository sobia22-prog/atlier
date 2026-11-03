import * as THREE from "three";

// 1. Parisian Limewash Plaster Wall with Architectural Boiserie Moldings
export function createWallTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Base warm Parisian limewash plaster
  ctx.fillStyle = "#EAE5DD";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle limewash organic mottled variations
  ctx.fillStyle = "rgba(225, 218, 208, 0.45)";
  for (let i = 0; i < 40; i++) {
    const rx = (i * 97) % canvas.width;
    const ry = (i * 73) % canvas.height;
    ctx.beginPath();
    ctx.arc(rx, ry, 140 + (i % 5) * 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soft architectural ceiling cove light wash (top-down subtle gradient)
  const topCove = ctx.createLinearGradient(0, 0, 0, 320);
  topCove.addColorStop(0, "rgba(255, 252, 245, 0.65)");
  topCove.addColorStop(1, "rgba(255, 252, 245, 0)");
  ctx.fillStyle = topCove;
  ctx.fillRect(0, 0, canvas.width, 320);

  // Bottom shadow near baseboard
  const botShadow = ctx.createLinearGradient(0, canvas.height - 180, 0, canvas.height);
  botShadow.addColorStop(0, "rgba(50, 42, 35, 0)");
  botShadow.addColorStop(1, "rgba(50, 42, 35, 0.14)");
  ctx.fillStyle = botShadow;
  ctx.fillRect(0, canvas.height - 180, canvas.width, 180);

  // 4 Architectural Boiserie Wall Panel Molding Frames across the wall
  const panelCount = 4;
  const panelWidth = 360;
  const panelHeight = 620;
  const panelTop = 180;
  const spacing = (canvas.width - panelCount * panelWidth) / (panelCount + 1);

  for (let p = 0; p < panelCount; p++) {
    const px = spacing + p * (panelWidth + spacing);

    // Outer molding shadow & highlight (3D effect)
    ctx.strokeStyle = "rgba(65, 52, 42, 0.34)"; // Top & left shadow
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px, panelTop + panelHeight);
    ctx.lineTo(px, panelTop);
    ctx.lineTo(px + panelWidth, panelTop);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.72)"; // Bottom & right highlight
    ctx.beginPath();
    ctx.moveTo(px + panelWidth, panelTop);
    ctx.lineTo(px + panelWidth, panelTop + panelHeight);
    ctx.lineTo(px, panelTop + panelHeight);
    ctx.stroke();

    // Inner subtle inset molding
    const inset = 18;
    ctx.strokeStyle = "rgba(75, 62, 52, 0.24)";
    ctx.lineWidth = 2;
    ctx.strokeRect(px + inset, panelTop + inset, panelWidth - inset * 2, panelHeight - inset * 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

// 2. Scandinavian Natural White-Oak Plank Hardwood Floor
export function createOakParquetTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Base warm Scandinavian natural oak tone
  ctx.fillStyle = "#A28A72";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const plankHeight = 160;
  const plankWidths = [440, 520, 380, 580, 480];

  for (let row = 0; row < 13; row++) {
    const y = row * plankHeight;
    const toneOffset = (((row * 7) % 5) - 2) * 5;
    ctx.fillStyle = `rgb(${162 + toneOffset}, ${140 + toneOffset}, ${116 + toneOffset})`;
    ctx.fillRect(0, y, canvas.width, plankHeight);

    // Staggered vertical plank butt joints
    let currX = (row * 240) % 440;
    while (currX < canvas.width) {
      ctx.fillStyle = "rgba(55, 45, 35, 0.32)";
      ctx.fillRect(currX, y, 3, plankHeight);
      currX += plankWidths[row % plankWidths.length];
    }

    // Horizontal plank bevel seam groove
    ctx.fillStyle = "rgba(50, 40, 30, 0.35)";
    ctx.fillRect(0, y + plankHeight - 3, canvas.width, 3);

    // Organic oak wood grain streaks
    ctx.fillStyle = "rgba(70, 56, 42, 0.045)";
    for (let g = 0; g < 18; g++) {
      ctx.fillRect(0, y + 10 + g * 8, canvas.width, 1.8);
    }
  }

  // Soft natural daylight wash from window side (upper left)
  const sunWash = ctx.createLinearGradient(0, 0, canvas.width * 0.75, canvas.height * 0.75);
  sunWash.addColorStop(0, "rgba(255, 250, 235, 0.16)");
  sunWash.addColorStop(0.65, "rgba(255, 250, 235, 0.05)");
  sunWash.addColorStop(1, "rgba(255, 250, 235, 0)");
  ctx.fillStyle = sunWash;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

// 3. Luxury Woven Bouclé Wool Area Rug
export function createBoucleRugTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Base warm textured ivory / cream wool
  ctx.fillStyle = "#E5DFD6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Woven melange texture with fine micro-loops
  ctx.fillStyle = "rgba(165, 155, 140, 0.12)";
  for (let x = 0; x < canvas.width; x += 6) {
    ctx.fillRect(x, 0, 3, canvas.height);
  }
  for (let y = 0; y < canvas.height; y += 6) {
    ctx.fillRect(0, y, canvas.width, 3);
  }

  // Faint high-value wool loops
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  for (let x = 2; x < canvas.width; x += 10) {
    for (let y = 2; y < canvas.height; y += 10) {
      ctx.fillRect(x, y, 2.5, 2.5);
    }
  }

  // Tailored perimeter whip-stitched border in warm toasted sand
  const borderWidth = 52;
  ctx.strokeStyle = "#B5A694";
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(borderWidth / 2, borderWidth / 2, canvas.width - borderWidth, canvas.height - borderWidth);

  // Inner stitched accent line
  ctx.strokeStyle = "rgba(75, 65, 55, 0.4)";
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 10]);
  ctx.strokeRect(borderWidth + 10, borderWidth + 10, canvas.width - (borderWidth + 10) * 2, canvas.height - (borderWidth + 10) * 2);
  ctx.setLineDash([]);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

// 4. Contemporary Gallery Canvas Art Texture (Minimalist Architectural Abstract)
export function createAbstractArtTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Belgian natural linen background
  ctx.fillStyle = "#F3EFE9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Linen fine canvas grain
  ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
  for (let i = 0; i < canvas.width; i += 4) {
    ctx.fillRect(i, 0, 2, canvas.height);
  }

  // Large architectural geometric terracotta arch
  ctx.fillStyle = "#B3583E";
  ctx.beginPath();
  ctx.arc(380, 420, 210, Math.PI, 0, false);
  ctx.lineTo(590, 560);
  ctx.lineTo(170, 560);
  ctx.closePath();
  ctx.fill();

  // Sunlit golden ochre organic arc
  ctx.fillStyle = "rgba(217, 167, 74, 0.88)";
  ctx.beginPath();
  ctx.arc(620, 280, 160, 0, Math.PI * 2);
  ctx.fill();

  // Soft muted stone-grey rectangular block
  ctx.fillStyle = "rgba(140, 132, 123, 0.75)";
  ctx.fillRect(440, 190, 220, 310);

  // Soft dusty rose accent circle
  ctx.fillStyle = "rgba(196, 139, 127, 0.82)";
  ctx.beginPath();
  ctx.arc(290, 210, 85, 0, Math.PI * 2);
  ctx.fill();

  // Subtle gallery dark wood frame border
  ctx.strokeStyle = "#38302A";
  ctx.lineWidth = 18;
  ctx.strokeRect(9, 9, canvas.width - 18, canvas.height - 18);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function createSecondaryArtTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 880;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#E9E4DA";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#89907A";
  ctx.beginPath();
  ctx.ellipse(340, 420, 120, 270, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#B65F49";
  ctx.beginPath();
  ctx.arc(260, 310, 105, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#B49A70";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(150, 660);
  ctx.quadraticCurveTo(340, 560, 500, 220);
  ctx.stroke();
  ctx.strokeStyle = "#41382F";
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

// 5. Flowing Belgian Sheer Linen Curtain Texture
export function createCurtainTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Warm sheer ivory linen base
  ctx.fillStyle = "#EFECE6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vertical drapery fold shadows and highlights
  const folds = 6;
  const foldWidth = canvas.width / folds;
  for (let f = 0; f < folds; f++) {
    const x = f * foldWidth;
    const grad = ctx.createLinearGradient(x, 0, x + foldWidth, 0);
    grad.addColorStop(0, "rgba(50, 42, 34, 0.22)");
    grad.addColorStop(0.35, "rgba(255, 255, 255, 0.45)");
    grad.addColorStop(0.7, "rgba(50, 42, 34, 0.18)");
    grad.addColorStop(1, "rgba(50, 42, 34, 0.28)");
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, foldWidth, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

// 6. Roman Travertine Stone Table Texture
export function createTravertineTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Base warm limestone / travertine tone
  ctx.fillStyle = "#DDD6CB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle horizontal sediment bands
  for (let y = 0; y < canvas.height; y += 16) {
    const toneOffset = Math.sin(y * 0.08) * 12;
    ctx.fillStyle = `rgba(${210 + toneOffset}, ${202 + toneOffset}, ${190 + toneOffset}, 0.45)`;
    ctx.fillRect(0, y, canvas.width, 14);

    // Natural travertine micro-pores
    ctx.fillStyle = "rgba(95, 85, 75, 0.09)";
    for (let p = 0; p < 8; p++) {
      const px = (y * 37 + p * 63) % canvas.width;
      ctx.fillRect(px, y + 4, 12, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 7. Sunlit Garden Courtyard Window Backdrop Texture
export function createWindowGardenTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Soft sky gradient (morning daylight)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGrad.addColorStop(0, "#D9E8F5");
  skyGrad.addColorStop(0.45, "#EBF2F7");
  skyGrad.addColorStop(0.7, "#FAF5EB");
  skyGrad.addColorStop(1, "#D4CBBF");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft distant Parisian limestone facade silhouettes
  ctx.fillStyle = "rgba(205, 195, 185, 0.5)";
  ctx.fillRect(60, 220, 240, 260);
  ctx.fillRect(360, 180, 280, 300);
  ctx.fillRect(700, 240, 260, 240);

  // Lush green garden courtyard trees (diffused background)
  const treeColors = [
    "rgba(78, 108, 70, 0.85)",
    "rgba(95, 128, 85, 0.88)",
    "rgba(62, 92, 55, 0.92)",
    "rgba(115, 145, 100, 0.75)",
  ];

  for (let i = 0; i < 48; i++) {
    const tx = (i * 27) % canvas.width;
    const ty = 340 + Math.sin(i * 1.8) * 90;
    const radius = 60 + (i % 5) * 18;
    ctx.fillStyle = treeColors[i % treeColors.length];
    ctx.beginPath();
    ctx.arc(tx, ty, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soft warm morning sunlight flare from upper left
  const sunGrad = ctx.createRadialGradient(180, 100, 20, 180, 100, 480);
  sunGrad.addColorStop(0, "rgba(255, 252, 235, 0.85)");
  sunGrad.addColorStop(0.4, "rgba(255, 248, 220, 0.35)");
  sunGrad.addColorStop(1, "rgba(255, 248, 220, 0)");
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export interface LivingRoomElements {
  roomGroup: THREE.Group;
  rugMesh: THREE.Mesh;
  windowBackdrop: THREE.Mesh;
}

/**
 * Constructs an authentic, modern luxury architectural living room in Three.js
 * generously scaled around the Atelier Sorel sectional sofa so the background
 * completely envelopes the camera view without clipping or showing boundary edges.
 */
export function buildLivingRoom(sofaCenter: THREE.Vector3): LivingRoomElements {
  const roomGroup = new THREE.Group();
  roomGroup.name = "ArchitecturalLivingRoom";

  const cx = sofaCenter.x;
  const cz = sofaCenter.z;

  // 1. Natural Scandinavian White-Oak Hardwood Floor (Extending generously to prevent edge clipping)
  const floorTexture = createOakParquetTexture();
  const floorGeo = new THREE.PlaneGeometry(26, 22);
  const floorMat = new THREE.MeshLambertMaterial({
    map: floorTexture || undefined,
    color: floorTexture ? 0xffffff : 0xd8cbbe,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(cx, -0.082, cz + 1.0);
  roomGroup.add(floorMesh);

  // 2. Luxury Woven Bouclé Wool Area Rug (Grounding the seating area)
  const rugTexture = createBoucleRugTexture();
  const rugGeo = new THREE.PlaneGeometry(9.8, 8.6);
  const rugMat = new THREE.MeshLambertMaterial({
    map: rugTexture || undefined,
    color: 0xffffff,
  });
  const rugMesh = new THREE.Mesh(rugGeo, rugMat);
  rugMesh.rotation.x = -Math.PI / 2;
  rugMesh.position.set(cx + 0.3, -0.078, cz + 0.3);
  roomGroup.add(rugMesh);

  // 3. Architectural Back Wall with Boiserie Moldings
  const wallTexture = createWallTexture();
  const backWallGeo = new THREE.PlaneGeometry(26, 7.2);
  const backWallMat = new THREE.MeshLambertMaterial({
    map: wallTexture || undefined,
    color: wallTexture ? 0xffffff : 0xeae5dc,
  });
  const backWall = new THREE.Mesh(backWallGeo, backWallMat);
  backWall.position.set(cx, 3.5, cz - 7.2);
  roomGroup.add(backWall);

  // Wall Baseboard (Dark Smoked Bronze / Smoked Oak)
  const baseboardGeo = new THREE.BoxGeometry(26, 0.16, 0.05);
  const baseboardMat = new THREE.MeshLambertMaterial({ color: 0x2e2722 });
  const baseboard = new THREE.Mesh(baseboardGeo, baseboardMat);
  baseboard.position.set(cx, -0.01, cz - 7.18);
  roomGroup.add(baseboard);

  // 5. Contemporary Gallery Canvas Artwork on Back Wall
  const artTexture = createAbstractArtTexture();
  const artGeo = new THREE.PlaneGeometry(5.2, 3.25);
  const artMat = new THREE.MeshLambertMaterial({
    map: artTexture || undefined,
    color: 0xffffff,
  });
  const artMesh = new THREE.Mesh(artGeo, artMat);
  artMesh.position.set(-6.1, -0.6, 0.08);
  backWall.add(artMesh);

  // 6. Architectural Left Wall with Tall French Black-Steel Windows & Linen Curtains
  const leftWallGeo = new THREE.PlaneGeometry(22, 7.2);
  const leftWallMat = new THREE.MeshLambertMaterial({ color: 0xeae5dc });
  const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(cx - 9.0, 3.5, cz + 1.0);
  roomGroup.add(leftWall);

  // Black Steel Casement Window Mullions Frame (5 elegant bays)
  const frameMat = new THREE.MeshLambertMaterial({ color: 0x554331 });
  const windowFrameGroup = new THREE.Group();

  const outerW = 9.0;
  const outerH = 5.0;
  const beamThick = 0.045;

  // Horizontal window frame beams
  const hBeamGeo = new THREE.BoxGeometry(beamThick, beamThick, outerW);
  const topBeam = new THREE.Mesh(hBeamGeo, frameMat);
  topBeam.position.set(cx - 8.92, 5.8, cz);
  windowFrameGroup.add(topBeam);

  const botBeam = new THREE.Mesh(hBeamGeo, frameMat);
  botBeam.position.set(cx - 8.92, 0.0, cz);
  windowFrameGroup.add(botBeam);

  const midBeam = new THREE.Mesh(hBeamGeo, frameMat);
  midBeam.position.set(cx - 8.92, 3.8, cz);
  windowFrameGroup.add(midBeam);

  // Vertical window mullion bars
  const vBeamGeo = new THREE.BoxGeometry(beamThick, outerH, beamThick);
  for (let b = 0; b <= 3; b++) {
    const vMullion = new THREE.Mesh(vBeamGeo, frameMat);
    const zPos = cz - outerW / 2 + (b * outerW) / 3;
    vMullion.position.set(cx - 8.92, 2.8, zPos);
    windowFrameGroup.add(vMullion);
  }
  roomGroup.add(windowFrameGroup);

  // Outside Window Sunlit Courtyard / Parisian Garden Backdrop
  const gardenTexture = createWindowGardenTexture();
  const gardenGeo = new THREE.PlaneGeometry(15, 7.3);
  const gardenMat = new THREE.MeshBasicMaterial({
    map: gardenTexture || undefined,
    color: 0xffffff,
  });
  const windowBackdrop = new THREE.Mesh(gardenGeo, gardenMat);
  windowBackdrop.rotation.y = Math.PI / 2;
  windowBackdrop.position.set(cx - 9.7, 3.4, cz);
  roomGroup.add(windowBackdrop);

  // Flowing Sheer Belgian Linen Drapes / Curtains on Window Sides
  const curtainTexture = createCurtainTexture();
  const curtainGeo = new THREE.PlaneGeometry(1.2, 5.5);
  const curtainMat = new THREE.MeshLambertMaterial({
    map: curtainTexture || undefined,
    color: 0xffffff,
  });

  const leftCurtain = new THREE.Mesh(curtainGeo, curtainMat);
  leftCurtain.rotation.y = Math.PI / 2;
  leftCurtain.position.set(cx - 8.85, 2.8, cz - outerW / 2 + 0.6);
  roomGroup.add(leftCurtain);

  const rightCurtain = new THREE.Mesh(curtainGeo, curtainMat);
  rightCurtain.rotation.y = Math.PI / 2;
  rightCurtain.position.set(cx - 8.85, 2.8, cz + outerW / 2 - 0.6);
  roomGroup.add(rightCurtain);

  const secondaryArtTexture = createSecondaryArtTexture();
  const secondaryArtGeo = new THREE.PlaneGeometry(2.5, 3.4);
  const secondaryArtMat = new THREE.MeshLambertMaterial({
    map: secondaryArtTexture || undefined,
    color: 0xffffff,
  });
  const secondaryArt = new THREE.Mesh(secondaryArtGeo, secondaryArtMat);
  secondaryArt.rotation.y = Math.PI / 2;
  secondaryArt.position.set(cx - 8.92, 2.8, cz - 5.9);
  roomGroup.add(secondaryArt);

  // 7. Architectural Right Wall (Limestone with floating oak console)
  const rightWallGeo = new THREE.PlaneGeometry(22, 7.2);
  const rightWall = new THREE.Mesh(rightWallGeo, leftWallMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(cx + 10.0, 3.5, cz + 1.0);
  roomGroup.add(rightWall);

  // 8. Architectural Ceiling
  const ceilingGeo = new THREE.PlaneGeometry(26, 22);
  const ceilingMat = new THREE.MeshLambertMaterial({ color: 0xf5f2ec });
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(cx, 7.1, cz + 1.0);
  roomGroup.add(ceiling);

  // 9. Architectural Arched Corner Floor Lamp
  const lampGroup = new THREE.Group();
  lampGroup.position.set(cx - 6.2, -0.08, cz - 4.5);

  const lampBaseGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24);
  const lampBaseMat = new THREE.MeshLambertMaterial({ color: 0x22201e });
  const lampBase = new THREE.Mesh(lampBaseGeo, lampBaseMat);
  lampBase.position.y = 0.03;
  lampGroup.add(lampBase);

  const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.8, 16);
  const stemMat = new THREE.MeshLambertMaterial({ color: 0x1f1d1a });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 1.4;
  lampGroup.add(stem);

  const shadeGeo = new THREE.SphereGeometry(0.24, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const shadeMat = new THREE.MeshLambertMaterial({ color: 0xd4a742 });
  const shade = new THREE.Mesh(shadeGeo, shadeMat);
  shade.rotation.x = Math.PI;
  shade.position.set(0.65, 2.85, 0.65);
  lampGroup.add(shade);

  roomGroup.add(lampGroup);

  return {
    roomGroup,
    rugMesh,
    windowBackdrop,
  };
}
