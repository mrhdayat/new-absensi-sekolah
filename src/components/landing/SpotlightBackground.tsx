"use client";

import { useEffect, useRef, useState } from "react";

export function SpotlightBackground() {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!divRef.current) return;

      const div = divRef.current;
      const rect = div.getBoundingClientRect();

      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setOpacity(1);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave); // Global leave might not trigger if just leaving the specific div, but we want it page-wide

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={divRef}
      className="fixed inset-0 z-0 overflow-hidden bg-[#0B0E14] pointer-events-none"
    >
      {/* Base Noise Texture for "Digital" feel */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Spotlight Gradient */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.30), transparent 40%)`,
        }}
      />

      {/* Secondary Ambient Glow (Static) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-violet-900/10 blur-[120px] rounded-full mix-blend-screen" />
    </div>
  );
}
