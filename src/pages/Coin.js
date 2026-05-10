import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function SpinningBrain() {
  const brainRef = useRef();
  const gltf = useGLTF("/glucocoin.glb");

  useFrame(() => {
    if (brainRef.current) {
      brainRef.current.rotation.y += 0.003;
    }
  });

  return (
    <primitive
      ref={brainRef}
      object={gltf.scene}
      rotation={[-Math.PI / 6, -Math.PI / 2, 0]}
      scale={1}
      position={[0, -50, 0]}
      onClick={() => {
        window.location.href = "/social";
      }}
    />
  );
}

export default function BrainCanvas() {
  return (
    <Canvas
      className="fixed top-0 left-0 w-full h-full z-10 pointer-events-none"
      camera={{ position: [0, -20, 20], fov: 30 }}
      gl={{ alpha: true }} // ✅ enables canvas transparency
    >
      <TransparentBackground />
      <ambientLight intensity={1} />
      <directionalLight position={[0, 5, 5]} intensity={1} />
      <axesHelper args={[2]} />
      <gridHelper args={[10, 10]} />
      <SpinningBrain />
      <OrbitControls target={[0, -50, 0]} enableZoom={false} enablePan={false} />
    </Canvas>
  );
}

// ✅ Set WebGL background to transparent
function TransparentBackground() {
  useThree(({ gl, scene }) => {
    gl.setClearColor(0x000000, 0); // fully transparent
    scene.background = null;
  });
  return null;
}