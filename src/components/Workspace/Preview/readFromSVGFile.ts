// Some parts copied from https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_svg.html
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

export default async function readFromSVGFile(
  file: File,
  fillColor: string,
  strokeColor: string
): Promise<THREE.Group> {
  const loader = new SVGLoader();

  const data = loader.parse(await file.text());
  const group = new THREE.Group();
  let renderOrder = 0;

  group.scale.multiplyScalar(0.01);
  group.rotation.x = -Math.PI / 2; // Z-up conversion
  group.scale.y *= -1;

  for (const path of data.paths) {
    const fillMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setStyle(fillColor),
      // opacity: path.userData.style.fillOpacity,
      // transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      wireframe: false,
    });

    const strokeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setStyle(strokeColor),
      // opacity: path.userData.style.strokeOpacity,
      // transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      wireframe: false,
    });

    const shapes = SVGLoader.createShapes(path);

    for (const shape of shapes) {
      const geometry = new THREE.ShapeGeometry(shape);
      const mesh = new THREE.Mesh(geometry, fillMaterial);
      mesh.renderOrder = renderOrder++;

      group.add(mesh);
    }

    for (const subPath of path.subPaths) {
      const geometry = SVGLoader.pointsToStroke(
        subPath.getPoints(),
        path.userData.style
      );

      if (geometry) {
        const mesh = new THREE.Mesh(geometry, strokeMaterial);
        mesh.renderOrder = renderOrder++;

        group.add(mesh);
      }
    }
  }

  return group;
}
