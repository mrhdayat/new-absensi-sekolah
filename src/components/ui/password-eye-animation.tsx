"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface PasswordEyeAnimationProps {
  isVisible: boolean;
}

export function PasswordEyeAnimation({ isVisible }: PasswordEyeAnimationProps) {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
      >
        {/* Head/Face Circle */}
        <circle cx="50" cy="50" r="35" fill="#6366f1" />

        {/* Ears */}
        <circle cx="20" cy="35" r="8" fill="#6366f1" />
        <circle cx="80" cy="35" r="8" fill="#6366f1" />

        {/* Inner ears */}
        <circle cx="20" cy="35" r="4" fill="#818cf8" />
        <circle cx="80" cy="35" r="4" fill="#818cf8" />

        {/* Eyes - Animate scale for blinking effect */}
        <motion.g
          animate={{
            scaleY: isVisible ? 1 : 0.1,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
          style={{ transformOrigin: "50% 45%" }}
        >
          {/* Left Eye White */}
          <ellipse cx="38" cy="45" rx="8" ry="10" fill="white" />
          {/* Right Eye White */}
          <ellipse cx="62" cy="45" rx="8" ry="10" fill="white" />

          {/* Left Pupil */}
          <circle cx="38" cy="45" r="5" fill="#1e293b" />
          {/* Right Pupil */}
          <circle cx="62" cy="45" r="5" fill="#1e293b" />

          {/* Eye shine */}
          <circle cx="40" cy="43" r="2" fill="white" opacity="0.8" />
          <circle cx="64" cy="43" r="2" fill="white" opacity="0.8" />
        </motion.g>

        {/* Hands covering eyes when password is hidden */}
        <motion.g
          animate={{
            y: isVisible ? -30 : 0,
            opacity: isVisible ? 0 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
        >
          {/* Left Hand */}
          <ellipse cx="38" cy="45" rx="14" ry="10" fill="#4f46e5" />
          <ellipse cx="38" cy="45" rx="10" ry="7" fill="#6366f1" />

          {/* Right Hand */}
          <ellipse cx="62" cy="45" rx="14" ry="10" fill="#4f46e5" />
          <ellipse cx="62" cy="45" rx="10" ry="7" fill="#6366f1" />
        </motion.g>

        {/* Nose */}
        <ellipse cx="50" cy="55" rx="3" ry="4" fill="#4f46e5" />

        {/* Mouth - Changes based on visibility */}
        <motion.path
          d={isVisible ? "M 40 65 Q 50 70 60 65" : "M 40 65 Q 50 62 60 65"}
          stroke="#4f46e5"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: isVisible ? "M 40 65 Q 50 70 60 65" : "M 40 65 Q 50 62 60 65"
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Cheeks - Blush when eyes are open */}
        <motion.g
          animate={{
            opacity: isVisible ? 0.6 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <circle cx="25" cy="55" r="5" fill="#f87171" opacity="0.5" />
          <circle cx="75" cy="55" r="5" fill="#f87171" opacity="0.5" />
        </motion.g>
      </svg>

      {/* Floating particles when eyes open */}
      {isVisible && (
        <>
          <motion.div
            className="absolute top-0 left-1/4 w-1 h-1 bg-yellow-400 rounded-full"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -20 }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute top-0 right-1/4 w-1 h-1 bg-yellow-400 rounded-full"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -20 }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
    </div>
  );
}
