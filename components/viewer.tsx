"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import Model from "./model";

const Viewer = ({ modelUrl }: { modelUrl: string }) => {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Grid
        args={[10, 10]}
        // @ts-ignore
        cellSize={0.5}
        cellThickness={1}
        cellColor={"#6f6f6f"}
        sectionSize={2.5}
        sectionThickness={1.5}
        sectionColor={"#2D9BF0"}
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
      <OrbitControls />
      {modelUrl && <Model url={modelUrl} />}
    </Canvas>
  );
};

export default Viewer;
