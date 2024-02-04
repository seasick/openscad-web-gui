import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export default function readFromFile(
  file: File
): Promise<THREE.BufferGeometry<THREE.NormalBufferAttributes>> {
  const promise = new Promise<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>
  >((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
      if (!event.target) {
        return;
      }

      const contents = event.target.result as ArrayBuffer;
      const loader = new STLLoader();
      const object = loader.parse(contents);

      resolve(object);
    });

    reader.addEventListener('error', (event) => {
      reject(event);
    });

    reader.readAsArrayBuffer(file);
  });

  return promise;
}
