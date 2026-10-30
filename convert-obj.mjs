import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Polyfill FileReader for Node.js
class FileReaderPolyfill {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
}
globalThis.FileReader = FileReaderPolyfill;

async function convert() {
  console.log('Reading files...');
  const objText = fs.readFileSync('public/modals/sofa.obj', 'utf8');
  const mtlText = fs.readFileSync('public/modals/sofa.mtl', 'utf8');

  const mtlLoader = new MTLLoader();
  const materials = mtlLoader.parse(mtlText, 'public/modals/');
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  const obj = objLoader.parse(objText);

  console.log('Parsed OBJ successfully. Object name:', obj.name);

  // Traverse meshes to upgrade materials to luxury MeshStandardMaterial
  obj.traverse((child) => {
    if (child.isMesh) {
      // Ensure smooth lighting
      if (child.geometry) {
        child.geometry.computeVertexNormals();
      }

      if (Array.isArray(child.material)) {
        child.material = child.material.map(upgradeMaterial);
      } else if (child.material) {
        child.material = upgradeMaterial(child.material);
      }
    }
  });

  function upgradeMaterial(oldMat) {
    const matName = (oldMat.name || '').toLowerCase();
    console.log('Converting material:', oldMat.name);

    // Warm luxury palette matching Atelier Sorel
    // m_sofa: warm bouclé neutral
    // m_sofa_bottom: dark smoked oak feet
    // Material.002, 003, 004: soft nude, warm peach, sand cushions
    let color = oldMat.color ? oldMat.color.clone() : new THREE.Color(0xd8b9a6);
    let roughness = 0.85;
    let metalness = 0.05;

    if (matName.includes('bottom')) {
      // Legs / base: dark espresso smoked ash
      color = new THREE.Color(0x2d2522);
      roughness = 0.6;
      metalness = 0.1;
    } else if (matName.includes('sofa')) {
      // Main sofa body: soft warm bouclé ivory/nude
      color = new THREE.Color(0xdcc8b8);
      roughness = 0.9;
      metalness = 0.02;
    } else if (matName.includes('002')) {
      // Pillow 1: soft peach
      color = new THREE.Color(0xe0b8a4);
      roughness = 0.85;
      metalness = 0.02;
    } else if (matName.includes('003')) {
      // Pillow 2: muted terracotta / warm clay
      color = new THREE.Color(0xbe8b77);
      roughness = 0.88;
      metalness = 0.02;
    } else if (matName.includes('004')) {
      // Pillow 3: soft oatmeal cream
      color = new THREE.Color(0xeee4d8);
      roughness = 0.92;
      metalness = 0.01;
    }

    return new THREE.MeshStandardMaterial({
      name: oldMat.name,
      color: color,
      roughness: roughness,
      metalness: metalness,
    });
  }

  // Calculate bounding box
  const initialBox = new THREE.Box3().setFromObject(obj);
  const size = initialBox.getSize(new THREE.Vector3());
  const center = initialBox.getCenter(new THREE.Vector3());

  console.log('Original dimensions (meters/units):', size);
  console.log('Original center:', center);

  // We want the sofa to sit on the floor (Y = 0) and centered on X and Z
  // Normalize scale so the largest horizontal dimension is ~2.3 meters (standard 3-seater luxury sofa)
  const maxHoriz = Math.max(size.x, size.z);
  const targetWidth = 2.3;
  const scale = targetWidth / maxHoriz;

  obj.scale.set(scale, scale, scale);

  // Recalculate after scaling
  const scaledBox = new THREE.Box3().setFromObject(obj);
  const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

  // Center object so (X=0, Z=0) is center, and Y min is 0
  obj.position.x = -scaledCenter.x;
  obj.position.z = -scaledCenter.z;
  obj.position.y = -scaledBox.min.y;

  const finalBox = new THREE.Box3().setFromObject(obj);
  console.log('Final Box Min:', finalBox.min, 'Max:', finalBox.max, 'Final Size:', finalBox.getSize(new THREE.Vector3()));

  const scene = new THREE.Scene();
  scene.add(obj);

  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (gltf) => {
      const buffer = Buffer.from(gltf);
      fs.writeFileSync('public/models/sofa.glb', buffer);
      fs.writeFileSync('public/modals/sofa.glb', buffer);
      fs.writeFileSync('public/models/premium-sofa.glb', buffer);
      console.log('SUCCESS! Exported GLB model. Size in bytes:', buffer.length);
    },
    (err) => {
      console.error('Export error:', err);
    },
    { binary: true }
  );
}

convert().catch(console.error);
