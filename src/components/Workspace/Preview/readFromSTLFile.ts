import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export default function readFromSTLFile(
  file: File,
  color: string
): Promise<THREE.Group> {
  const promise = new Promise<THREE.Group>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
      if (!event.target) {
        return;
      }

      const group = new THREE.Group();
      const contents = event.target.result as ArrayBuffer;
      const loader = new STLLoader();
      const geometry = loader.parse(contents);

      const material = new THREE.MeshLambertMaterial({
        color,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.set(-Math.PI / 2, 0, 0); // z-up conversion

      // Objects are way too big, scale them down.
      mesh.scale.set(0.01, 0.01, 0.01);

      mesh.traverse(function (child) {
        child.castShadow = true;
        child.receiveShadow = true;
      });

      group.add(mesh);

      resolve(group);
    });

    reader.addEventListener('error', (event) => {
      reject(event);
    });

    reader.readAsArrayBuffer(file);
  });

  return promise;
}
