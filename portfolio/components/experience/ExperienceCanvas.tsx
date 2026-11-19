'use client';

import { useEffect, useRef, useState } from 'react';
import { ExperienceManager, WorldName } from '@/lib/experience/experience-manager';
import styles from './experience.module.css';

interface ExperienceCanvasProps {
  onWorldChange?: (world: WorldName | 'headquarters') => void;
  initialWorld?: WorldName;
}

export function ExperienceCanvas({
  onWorldChange,
  initialWorld = 'headquarters',
}: ExperienceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const experienceRef = useRef<ExperienceManager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setHasWebGL(false);
      return;
    }

    if (!canvasRef.current) return;

    try {
      // Initialize ExperienceManager
      experienceRef.current = new ExperienceManager({
        container: canvasRef.current,
        antialias: true,
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize experience:', error);
      setHasWebGL(false);
    }

    return () => {
      experienceRef.current?.dispose();
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className={styles.fallback}>
        <div className={styles.fallbackContent}>
          <h2>3D Experience Unavailable</h2>
          <p>Your browser doesn't support WebGL. Please use a modern browser.</p>
          <a href="/" className={styles.fallbackLink}>
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ opacity: isLoading ? 0 : 1 }}
      />

      {isLoading && (
        <div className={styles.loader}>
          <div className={styles.loaderContent}>
            <div className={styles.loaderSpinner} />
            <p>Loading experience...</p>
          </div>
        </div>
      )}
    </div>
  );
}
