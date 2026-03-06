import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';
import * as THREE from 'three';

/**
 * Load a 3MF file and return a THREE.Group with colored meshes
 * @param contents ArrayBuffer containing the 3MF file data
 * @returns Promise<THREE.Group> containing the model with colors
 */
export async function readFrom3MFFile(
  contents: ArrayBuffer
): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    try {
      const loader = new ThreeMFLoader();
      const group = loader.parse(contents);

      // OpenSCAD uses Z-up; Three.js uses Y-up
      group.rotation.set(-Math.PI / 2, 0, 0);

      // Center the group based on its bounding box (computed after rotation)
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      group.position.sub(center);
      
      resolve(group);
    } catch (error) {
      reject(error);
    }
  });
}
