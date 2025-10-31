"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Home as HomeIcon,
  FileText,
  GitGraph,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Viewer from "@/components/viewer";

export default function Home() {
  const [modelUrl, setModelUrl] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
    }
  };

  const links = [
    {
      label: "Inicio",
      href: "#",
      icon: (
        <HomeIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      action: () => setModelUrl(""),
    },
    {
      label: "IFC: Sample House",
      href: "#",
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      action: () =>
        setModelUrl(
          "https-cors.vercel.app/api?url=https://raw.githubusercontent.com/IFCjs/test-ifc-files/main/packages/ifc-test-files/ifc/2023-11-20-IfcOpenHouse4/IfcOpenHouse4.ifc"
        ),
    },
    {
      label: "OBJ: Pocket Watch",
      href: "#",
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      action: () =>
        setModelUrl(
          "https-cors.vercel.app/api?url=https://raw.githubusercontent.com/hiteshsubnani/BIM-AR-viewer-Next/main/public/models/pocket-watch/pocket-watch.obj"
        ),
    },
    {
      label: "FBX: Mercedes Benz",
      href: "#",
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      action: () =>
        setModelUrl(
          "https-cors.vercel.app/api?url=https://raw.githubusercontent.com/hiteshsubnani/BIM-AR-viewer-Next/main/public/models/mercedes-benz/source/Mercedes-Benz.fbx"
        ),
    },
    {
      label: "GLB: Avocado",
      href: "#",
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      action: () =>
        setModelUrl(
          "https-cors.vercel.app/api?url=https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb"
        ),
    },
    {
      label: "Subir Archivo",
      href: "#",
      icon: (
        <Upload className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      action: () => fileInputRef.current?.click(),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 h-screen mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden"
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".glb,.gltf,.fbx,.obj,.ifc"
      />
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Soy el Ing. Miguel Yepez",
                href: "https://www.linkedin.com/in/ing-miguel-yepez/",
                icon: (
                  <Image
                    src="https://media.licdn.com/dms/image/D4E03AQGg-0G_ex-78g/profile-displayphoto-shrink_400_400/0/1715013066391?e=1722470400&v=beta&t=3w1I2b_aZ-L2b-v9XfJ0b-Z5aZ-b-z5a-Z5a-Z5"
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
            <SidebarLink
              link={{
                label: "Brindame un cafe",
                href: "https://www.patreon.com/posts/invitame-un-cafe-142422413",
                icon: (
                  <GitGraph className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
          <Viewer modelUrl={modelUrl} />
        </div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        BIM AR Viewer
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
