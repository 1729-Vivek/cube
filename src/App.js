import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function App() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Create a Rubik's cube
    const cubeGroup = new THREE.Group();
    const cubeSize = 1;
    const gap = 0.05;

    // Colors for each face of the cube
    const faceColors = {
      U: 0xffffff, // white
      D: 0xffff00, // yellow
      F: 0xff0000, // red
      B: 0x0000ff, // blue
      L: 0xffa500, // orange
      R: 0x00ff00  // green
    };

    // Helper function to create a smaller cube with colored faces
    const createCube = (x, y, z) => {
      const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const materials = [
        new THREE.MeshBasicMaterial({ color: faceColors.R }), // Right
        new THREE.MeshBasicMaterial({ color: faceColors.L }), // Left
        new THREE.MeshBasicMaterial({ color: faceColors.U }), // Up
        new THREE.MeshBasicMaterial({ color: faceColors.D }), // Down
        new THREE.MeshBasicMaterial({ color: faceColors.F }), // Front
        new THREE.MeshBasicMaterial({ color: faceColors.B }), // Back
      ];

      const cube = new THREE.Mesh(geometry, materials);
      cube.position.set(x, y, z);
      return cube;
    };

    // Create a 3x3 Rubik's cube
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const smallCube = createCube((cubeSize + gap) * x, (cubeSize + gap) * y, (cubeSize + gap) * z);
          cubeGroup.add(smallCube);
        }
      }
    }

    scene.add(cubeGroup);

    // Rotate a specific layer of the cube
    const rotateLayer = (layer, axis, angle) => {
      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(axis, angle);

      cubeGroup.children.forEach(cube => {
        const position = cube.position;

        // Check which layer to rotate based on the axis
        if (axis.equals(new THREE.Vector3(0, 1, 0)) && Math.abs(position.y - layer) < gap) {
          // Rotate around the Y-axis (top/bottom layer)
          cube.position.applyQuaternion(quaternion);
          cube.rotation.y += angle; // Update rotation on the Y-axis
        } else if (axis.equals(new THREE.Vector3(1, 0, 0)) && Math.abs(position.x - layer) < gap) {
          // Rotate around the X-axis (left/right layer)
          cube.position.applyQuaternion(quaternion);
          cube.rotation.x += angle; // Update rotation on the X-axis
        } else if (axis.equals(new THREE.Vector3(0, 0, 1)) && Math.abs(position.z - layer) < gap) {
          // Rotate around the Z-axis (front/back layer)
          cube.position.applyQuaternion(quaternion);
          cube.rotation.z += angle; // Update rotation on the Z-axis
        }
      });
    };

    // Key bindings to rotate layers
    document.addEventListener('keydown', (event) => {
      event.preventDefault(); // Prevent default behavior for keys
    
      console.log(`Key pressed: ${event.code}`); // Log the key pressed
    
      switch (event.code) {
        case 'KeyU': // Rotate top layer
          rotateLayer(1, new THREE.Vector3(0, 1, 0), Math.PI / 2);
          break;
        case 'KeyD': // Rotate bottom layer
          rotateLayer(-1, new THREE.Vector3(0, 1, 0), -Math.PI / 2);
          break;
        case 'KeyL': // Rotate left layer
          rotateLayer(-1, new THREE.Vector3(1, 0, 0), Math.PI / 2);
          break;
        case 'KeyR': // Rotate right layer
          rotateLayer(1, new THREE.Vector3(1, 0, 0), -Math.PI / 2);
          break;
        case 'KeyF': // Rotate front layer
          rotateLayer(-1, new THREE.Vector3(0, 0, 1), Math.PI / 2);
          break;
        case 'KeyB': // Rotate back layer
          rotateLayer(1, new THREE.Vector3(0, 0, 1), -Math.PI / 2);
          break;
        default:
          break;
      }
    });
    
    // Add a light for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animate the scene
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Clean up the renderer and controls when the component is unmounted
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef}></div>;
}

export default App;
