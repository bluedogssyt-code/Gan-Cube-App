import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './Cube3D.css';

const Cube3D = ({ moves = [], onMoveComplete = null, autoRotate = true, showStats = false }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const cubiesRef = useRef([]);
  const isAnimatingRef = useRef(false);
  const moveQueueRef = useRef([]);
  const [isReady, setIsReady] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2;
    controls.minDistance = 4;
    controls.maxDistance = 15;
    controlsRef.current = controls;

    // Create the 3x3x3 cube
    createCube(scene);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
    setIsReady(true);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [autoRotate]);

  // Create 3x3x3 cube with individual cubies
  const createCube = (scene) => {
    const cubeSize = 1;
    const spacing = 0.05;
    const cubies = [];

    const colors = {
      white: 0xffffff,
      yellow: 0xffff00,
      red: 0xff0000,
      orange: 0xffa500,
      blue: 0x0000ff,
      green: 0x00aa00,
      black: 0x222222,
    };

    // Create each cubie (1x1x1 cube)
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const cubie = createCubie(cubeSize, colors);
          
          // Position the cubie
          const posX = x * (cubeSize + spacing);
          const posY = y * (cubeSize + spacing);
          const posZ = z * (cubeSize + spacing);
          
          cubie.position.set(posX, posY, posZ);
          cubie.userData = {
            originalPosition: { x: posX, y: posY, z: posZ },
            gridPosition: { x, y, z },
            index: cubies.length,
          };

          scene.add(cubie);
          cubies.push(cubie);
        }
      }
    }

    cubiesRef.current = cubies;
  };

  // Create individual cubie with stickers
  const createCubie = (size, colors) => {
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(size, size, size);
    
    const materials = [
      new THREE.MeshStandardMaterial({ color: colors.orange }), // right (red side)
      new THREE.MeshStandardMaterial({ color: colors.red }), // left
      new THREE.MeshStandardMaterial({ color: colors.white }), // top
      new THREE.MeshStandardMaterial({ color: colors.yellow }), // bottom
      new THREE.MeshStandardMaterial({ color: colors.blue }), // front
      new THREE.MeshStandardMaterial({ color: colors.green }), // back
    ];

    materials.forEach((mat) => {
      mat.roughness = 0.4;
      mat.metalness = 0.1;
    });

    const cube = new THREE.Mesh(geometry, materials);
    cube.castShadow = true;
    cube.receiveShadow = true;

    // Add black outline/edge
    const edges = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: colors.black, linewidth: 2 })
    );
    cube.add(wireframe);

    group.add(cube);
    return group;
  };

  // Execute a move on the cube
  const executeMove = useCallback(
    async (moveNotation) => {
      if (isAnimatingRef.current || !isReady) {
        moveQueueRef.current.push(moveNotation);
        return;
      }

      isAnimatingRef.current = true;

      try {
        await animateMove(moveNotation);
      } catch (error) {
        console.error('Error executing move:', error);
      } finally {
        isAnimatingRef.current = false;

        // Process queued moves
        if (moveQueueRef.current.length > 0) {
          const nextMove = moveQueueRef.current.shift();
          executeMove(nextMove);
        } else if (onMoveComplete) {
          onMoveComplete();
        }
      }
    },
    [isReady, onMoveComplete]
  );

  // Animate a single move
  const animateMove = (moveNotation) => {
    return new Promise((resolve) => {
      const {
        axis,
        direction,
        layer,
        duration = 600,
      } = parseMoveNotation(moveNotation);

      const startTime = Date.now();
      const targetRotation = direction * (Math.PI / 2);

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeProgress = smoothstep(0, 1, progress);

        // Get affected cubies and rotate them
        const affectedCubies = getAffectedCubies(axis, layer);
        const rotationAmount = targetRotation * easeProgress;

        affectedCubies.forEach((cubie) => {
          const originalPos = cubie.userData.originalPosition;
          
          // Create a temporary group for rotation
          if (!cubie.userData.rotationGroup) {
            cubie.userData.rotationAxis = axis;
            cubie.userData.rotationAmount = 0;
          }

          // Apply rotation based on axis
          switch (axis) {
            case 'x':
              cubie.rotation.x = rotationAmount;
              break;
            case 'y':
              cubie.rotation.y = rotationAmount;
              break;
            case 'z':
              cubie.rotation.z = rotationAmount;
              break;
          }
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Finalize positions after animation
          affectedCubies.forEach((cubie) => {
            updateCubiePosition(cubie, axis, layer, direction);
            cubie.rotation.set(0, 0, 0);
          });

          resolve();
        }
      };

      animate();
    });
  };

  // Parse move notation (e.g., "R", "L'", "U2")
  const parseMoveNotation = (notation) => {
    const match = notation.match(/^([RLUDFB])(['2]?)$/);
    if (!match) return null;

    const faceMap = {
      R: { axis: 'x', direction: 1, layer: 1 },
      L: { axis: 'x', direction: -1, layer: -1 },
      U: { axis: 'y', direction: 1, layer: 1 },
      D: { axis: 'y', direction: -1, layer: -1 },
      F: { axis: 'z', direction: 1, layer: 1 },
      B: { axis: 'z', direction: -1, layer: -1 },
    };

    const move = faceMap[notation[0]];
    let direction = move.direction;
    let rotations = 1;

    if (match[2] === "'") {
      direction *= -1;
    } else if (match[2] === "2") {
      rotations = 2;
    }

    return {
      axis: move.axis,
      direction,
      layer: move.layer,
      duration: 300 * rotations,
    };
  };

  // Get cubies affected by a move
  const getAffectedCubies = (axis, layer) => {
    return cubiesRef.current.filter((cubie) => {
      const gridPos = cubie.userData.gridPosition;
      switch (axis) {
        case 'x':
          return gridPos.x === layer;
        case 'y':
          return gridPos.y === layer;
        case 'z':
          return gridPos.z === layer;
        default:
          return false;
      }
    });
  };

  // Update cubie position and grid position after rotation
  const updateCubiePosition = (cubie, axis, layer, direction) => {
    const gridPos = cubie.userData.gridPosition;
    const { x, y, z } = gridPos;
    let newGridPos = { x, y, z };

    // Rotate grid position
    if (axis === 'x') {
      newGridPos = {
        x,
        y: direction > 0 ? -z : z,
        z: direction > 0 ? y : -y,
      };
    } else if (axis === 'y') {
      newGridPos = {
        x: direction > 0 ? z : -z,
        y,
        z: direction > 0 ? -x : x,
      };
    } else if (axis === 'z') {
      newGridPos = {
        x: direction > 0 ? y : -y,
        y: direction > 0 ? -x : x,
        z,
      };
    }

    // Update grid position
    cubie.userData.gridPosition = newGridPos;

    // Update physical position
    const cubeSize = 1;
    const spacing = 0.05;
    const newPosX = newGridPos.x * (cubeSize + spacing);
    const newPosY = newGridPos.y * (cubeSize + spacing);
    const newPosZ = newGridPos.z * (cubeSize + spacing);

    cubie.position.set(newPosX, newPosY, newPosZ);
    cubie.userData.originalPosition = { x: newPosX, y: newPosY, z: newPosZ };
  };

  // Smoothstep easing function
  const smoothstep = (edge0, edge1, x) => {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };

  // Apply moves from props
  useEffect(() => {
    if (isReady && moves && moves.length > 0) {
      moves.forEach((move) => {
        executeMove(move);
      });
    }
  }, [moves, isReady, executeMove]);

  // Reset cube to solved state
  const resetCube = useCallback(() => {
    cubiesRef.current.forEach((cubie) => {
      cubie.position.set(
        cubie.userData.originalPosition.x,
        cubie.userData.originalPosition.y,
        cubie.userData.originalPosition.z
      );
      cubie.rotation.set(0, 0, 0);
      cubie.userData.gridPosition = {
        x: Math.round(cubie.userData.originalPosition.x / 1.05),
        y: Math.round(cubie.userData.originalPosition.y / 1.05),
        z: Math.round(cubie.userData.originalPosition.z / 1.05),
      };
    });
  }, []);

  return (
    <div className="cube-3d-container" ref={containerRef}>
      <div className="cube-controls">
        <button onClick={resetCube} className="control-button">
          Reset
        </button>
      </div>
      {!isReady && <div className="loading">Loading 3D Cube...</div>}
    </div>
  );
};

export default Cube3D;
