'use client';

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Particles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // This runs ONLY on the client → no hydration issues
    const items = [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      xMove: Math.random() * 20 - 10,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));

    setParticles(items);
  }, []);

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, p.xMove, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay
          }}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: p.left,
            top: p.top
          }}
        />
      ))}
    </>
  );
}
