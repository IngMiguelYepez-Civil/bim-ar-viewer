"use client";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import * as THREE from "three";

const Model = ({ url }: { url: string }) => {
  const extension = url.split(".").pop()?.toLowerCase();

  let model;

  if (extension === "glb" || extension === "gltf") {
    const gltf = useLoader(GLTFLoader, url);
    model = <primitive object={gltf.scene} />;
  } else if (extension === "fbx") {
    const fbx = useLoader(FBXLoader, url);
    model = <primitive object={fbx} />;
  } else if (extension === "obj") {
    const obj = useLoader(OBJLoader, url);
    model = <primitive object={obj} />;
  } else if (extension === "ifc") {
    const ifcLoader = new IFCLoader();
    ifcLoader.ifcManager.setWasmPath("/wasm/");
    const ifc = useLoader(ifcLoader, url);
    model = <primitive object={ifc} />;
  }

  return model || null;
};

export default Model;
