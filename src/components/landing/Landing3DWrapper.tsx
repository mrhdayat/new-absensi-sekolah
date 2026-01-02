"use client";

import dynamic from "next/dynamic";

const Landing3D = dynamic(() => import("./Landing3D").then((mod) => mod.Landing3D), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-gradient-to-br from-background to-blue-900/10 pointer-events-none" />
  ),
});

export function Landing3DWrapper() {
  return <Landing3D />;
}
