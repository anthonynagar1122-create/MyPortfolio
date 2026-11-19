'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

interface CinematicHeroProps {
  title: string;
  subtitle: string;
  description: string;
  primaryCTA: {
    label: string;
    href: string;
  };
  secondaryCTA?: {
    label: string;
    href: string;
  };
  accentColor?: string;
  children?: ReactNode;
}

export function CinematicHero({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  accentColor = '#3563f6',
  children,
}: CinematicHeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-20">
      {/* Animated Background Grid */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{
          backgroundImage:
            'linear-gradient(45deg, #3563f6 1px, transparent 1px), linear-gradient(-45deg, #3563f6 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Gradient Orb Effects */}
      <motion.div
        className="absolute -top-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          y: [0, 50, 0],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{ background: accentColor }}
      />

      <motion.div
        className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          y: [0, -50, 0],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{ background: '#f59e0b' }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Subtitle */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm text-sm font-semibold uppercase tracking-widest"
            style={{
              borderColor: accentColor,
              color: accentColor,
              backgroundColor: `${accentColor}08`,
            }}
          >
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: accentColor }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            {subtitle}
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-700 text-center text-white mb-6 leading-tight tracking-tight"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-300 text-center max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={primaryCTA.href}
              className="px-8 py-4 rounded-lg font-semibold text-white text-lg transition-all duration-300 relative group overflow-hidden"
              style={{ background: accentColor }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-20"
                style={{ background: 'white' }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative flex items-center gap-2">
                {primaryCTA.label}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  →
                </motion.span>
              </span>
            </Link>
          </motion.div>

          {secondaryCTA && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={secondaryCTA.href}
                className="px-8 py-4 rounded-lg font-semibold text-white text-lg border-2 border-slate-400 hover:border-white transition-all duration-300 backdrop-blur-sm"
              >
                {secondaryCTA.label}
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Additional Content */}
        {children && (
          <motion.div
            variants={itemVariants}
            className="mt-16"
          >
            {children}
          </motion.div>
        )}
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <span className="text-sm font-medium">Scroll to explore</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
