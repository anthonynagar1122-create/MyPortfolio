"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({
  children,
  delay = 0,
  className = "",
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut",
      }}
      viewport={{ once: true, margin: "-50px" }}
      className={`rounded-xl transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
}
