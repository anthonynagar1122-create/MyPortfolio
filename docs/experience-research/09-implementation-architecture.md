# Implementation Architecture for RouteMaster Experience

## Tech Stack Decision

### Frontend Framework
- **Framework:** Next.js 16 (keep existing)
- **Rendering:** Server Components + Client Components
- **State:** React Context + Zustand (optional)

### 3D & Animation
| Need | Technology | Why |
|------|-----------|-----|
| **3D Scenes** | Three.js (not React Three Fiber) | Full control, performance |
| **Animations** | GSAP + Framer Motion | GSAP for 3D/scroll, Framer for UI |
| **Scroll Triggers** | GSAP ScrollTrigger | Industry standard, battle-tested |
| **Camera Control** | Three.js native | Manual control for cinematic moves |

### Why NOT React Three Fiber?
- More abstraction overhead
- Harder to coordinate GSAP with Fiber updates
- Performance overhead for complex scenes
- Cinematic camera movements easier with vanilla Three.js

### CSS & Styling
- **Tailwind CSS v4** (keep existing)
- **CSS Modules** for 3D canvas container
- **CSS Animations** only for simple UI (not 3D)

---

## Project Structure

```
portfolio/
├── docs/experience-research/      ← You are here
│   ├── 01-reference-overview.md
│   ├── 02-interaction-inventory.md
│   ├── 03-motion-specifications.md
│   ├── 08-routemaster-creative-direction.md
│   └── 09-implementation-architecture.md
│
├── app/
│   ├── page.tsx                   ← Keep existing homepage
│   ├── experience/                ← NEW: 3D experience
│   │   └── page.tsx               ← Experience entry point
│   │
│   ├── layout.tsx                 ← Existing layout
│   └── ... (existing routes)
│
├── components/
│   ├── core/                      ← Keep existing
│   │   ├── AnimatedCard.tsx
│   │   ├── AnimatedCounter.tsx
│   │   └── ...
│   │
│   └── experience/                ← NEW: 3D components
│       ├── Scene3D.tsx            ← Main 3D canvas container
│       ├── THREE/
│       │   ├── scenes/
│       │   │   ├── Headquarters.ts
│       │   │   ├── Routemaster.ts
│       │   │   ├── Fufaji.ts
│       │   │   └── FundsForFamily.ts
│       │   ├── controls/
│       │   │   ├── CameraController.ts
│       │   │   └── InteractionManager.ts
│       │   ├── loaders/
│       │   │   ├── modelLoader.ts
│       │   │   └── textureLoader.ts
│       │   └── utils/
│       │       ├── geometry.ts
│       │       ├── lighting.ts
│       │       └── particles.ts
│       │
│       └── UI/
│           ├── HUD.tsx            ← Heads-up display overlay
│           ├── Navigation.tsx      ← World selector
│           └── Details.tsx         ← Scroll-driven content
│
├── lib/
│   ├── animations.ts              ← Keep existing Framer Motion variants
│   ├── three-setup.ts             ← NEW: Three.js initialization
│   ├── gsap-config.ts             ← NEW: GSAP animation registry
│   └── experience-state.ts         ← NEW: Experience state management
│
├── public/
│   ├── models/                    ← NEW: 3D models
│   │   ├── sphere-routemaster.gltf
│   │   ├── sphere-fufaji.gltf
│   │   ├── sphere-funds.gltf
│   │   └── details/
│   │
│   ├── textures/                  ← NEW: 3D textures
│   │   ├── networks/
│   │   ├── environments/
│   │   └── ui/
│   │
│   └── audio/                     ← NEW: Ambient sounds (optional)
│       ├── ambient-hq.mp3
│       ├── whoosh-transition.mp3
│       └── ...
│
├── styles/
│   └── experience.module.css       ← NEW: 3D canvas styles
│
└── package.json
```

---

## Component Architecture

### Layer 1: Page Component (`app/experience/page.tsx`)

```typescript
import Scene3D from '@/components/experience/Scene3D';

export default function ExperiencePage() {
  return (
    <main>
      <Scene3D />
    </main>
  );
}
```

**Responsibility:**
- Entry point for experience
- Route definition
- Metadata

---

### Layer 2: Scene Container (`components/experience/Scene3D.tsx`)

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { ExperienceManager } from '@/lib/experience-manager';
import HUD from './UI/HUD';
import Navigation from './UI/Navigation';

export default function Scene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<ExperienceManager | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize 3D experience
    experienceRef.current = new ExperienceManager(containerRef.current);
    experienceRef.current.init();

    return () => {
      experienceRef.current?.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas className={styles.canvas} />
      <HUD />
      <Navigation />
      <Details />
    </div>
  );
}
```

**Responsibility:**
- Create canvas container
- Initialize ExperienceManager
- Manage cleanup
- Render UI overlays

---

### Layer 3: ExperienceManager (Core Logic)

```typescript
// lib/experience-manager.ts

export class ExperienceManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationId: number = 0;
  
  private currentWorld: 'hq' | 'routemaster' | 'fufaji' | 'funds' = 'hq';
  private headquarters: Headquarters;
  private worlds: Map<string, World>;
  private cameraController: CameraController;
  private gsapTimeline: gsap.timeline.Timeline;

  constructor(container: HTMLDivElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 10000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    // Setup
    this.setupRenderer();
    this.setupLighting();
    this.setupWorlds();
    this.cameraController = new CameraController(this.camera);
    this.gsapTimeline = gsap.timeline();
    
    this.renderer.domElement.addEventListener('resize', () => this.onWindowResize());
  }

  init() {
    // Load assets
    // Setup initial scene (HQ)
    this.loadHeadquarters();
    // Start animation loop
    this.animate();
  }

  transitionToWorld(worldName: 'routemaster' | 'fufaji' | 'funds') {
    // Animate camera transition
    // Fade current world out
    // Load new world
    // Fade new world in
    this.currentWorld = worldName;
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    
    // Update animations
    TWEEN.update();
    this.cameraController.update();
    
    // Render
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }
}
```

**Responsibility:**
- Three.js scene management
- World transitions
- Camera control
- Animation orchestration
- Performance monitoring

---

### Layer 4: World Components

Each world (Headquarters, RouteMaster, Fufaji, Funds-for-Family) is a self-contained module:

```typescript
// components/THREE/scenes/RouteMaster.ts

export class RoutemasterWorld {
  private scene: THREE.Group;
  private networkGraph: NetworkVisualization;
  private trains: Train[];
  private interactionManager: InteractionManager;

  constructor(scene: THREE.Scene) {
    this.scene = new THREE.Group();
    scene.add(this.scene);
    
    this.createEnvironment();
    this.createNetwork();
    this.createTrains();
    this.setupInteractions();
  }

  private createEnvironment() {
    // Dark cinematic background
    // Volumetric fog
    // Lighting setup
  }

  private createNetwork() {
    // Railway lines (THREE.Line)
    // Station nodes (THREE.Mesh spheres)
    // Connection glow effects (shaders)
  }

  private createTrains() {
    // Animated train models
    // Smooth path following
    // Lighting effects
  }

  public transitionIn(duration: number) {
    // GSAP animation: fade in scene
  }

  public transitionOut(duration: number) {
    // GSAP animation: fade out scene
  }

  public update(deltaTime: number) {
    // Update animations
    this.trains.forEach(train => train.update(deltaTime));
    this.networkGraph.update();
  }
}
```

**Responsibility:**
- Scene composition
- 3D model setup
- Animation management
- Interaction handling
- Performance optimization (LOD, culling)

---

### Layer 5: UI Overlay Components

**HUD.tsx** — Real-time overlays
```typescript
// components/experience/UI/HUD.tsx
// Shows FPS, loading state, hints
// Animated counters for data
// Status information
```

**Navigation.tsx** — World selector
```typescript
// components/experience/UI/Navigation.tsx
// 3D sphere selector visualization
// Click handlers
// Hover tooltips
```

**Details.tsx** — Scroll-driven content
```typescript
// components/experience/UI/Details.tsx
// Scroll-linked narrative
// Project information
// Interactive controls
// Scroll progress indicator
```

---

## State Management Pattern

```typescript
// lib/experience-state.ts

export interface ExperienceState {
  currentWorld: 'hq' | 'routemaster' | 'fufaji' | 'funds';
  isLoading: boolean;
  cameraMode: 'orbital' | 'cinematic' | 'interactive';
  soundEnabled: boolean;
  scrollPosition: number;
  selectedProject?: string;
}

// Using Zustand (optional, can use Context)
export const useExperienceStore = create<ExperienceState>((set) => ({
  currentWorld: 'hq',
  isLoading: false,
  cameraMode: 'orbital',
  soundEnabled: true,
  scrollPosition: 0,
  
  setWorld: (world) => set({ currentWorld: world }),
  setLoading: (loading) => set({ isLoading: loading }),
  // ... other setters
}));
```

---

## Animation Coordination

### GSAP Timeline Registry

```typescript
// lib/gsap-config.ts

export const animationRegistry = {
  // Transition animations
  transitionEnter: (duration: number) => ({
    duration,
    ease: "power2.out",
    opacity: { from: 0, to: 1 },
  }),

  transitionExit: (duration: number) => ({
    duration,
    ease: "power2.out",
    opacity: { from: 1, to: 0 },
  }),

  cameraZoom: (duration: number) => ({
    duration,
    ease: "power2.out",
    // Camera position/rotation
  }),

  staggerReveal: (count: number) => ({
    duration: 0.5,
    stagger: 0.1,
    ease: "back.out",
    opacity: { from: 0, to: 1 },
  }),
};

// Usage in scenes:
gsap.to(mesh, animationRegistry.transitionEnter(1.5));
```

---

## Performance Optimization Strategies

### 1. **Asset Loading**
```typescript
// Load only when needed
const headquartersAssets = await loadAsync('models/hq.gltf');
const routemasterAssets = await loadAsync('models/routemaster.gltf');

// Lazy load on world selection
loadWorldAssets(worldName).then(() => transitionToWorld(worldName));
```

### 2. **LOD (Level of Detail)**
```typescript
// High poly for close-up, low poly for distance
const mesh = new THREE.LOD();
mesh.addLevel(highPolyModel, 0);
mesh.addLevel(mediumPolyModel, 100);
mesh.addLevel(lowPolyModel, 500);
```

### 3. **Frustum Culling**
```typescript
// Only render visible objects
camera.updateMatrixWorld();
const frustum = new THREE.Frustum();
frustum.setFromProjectionMatrix(
  new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  )
);
```

### 4. **GPU Acceleration**
```css
/* CSS for fast 2D transforms */
will-change: transform, opacity;
transform: translate3d(0, 0, 0);
backface-visibility: hidden;
```

### 5. **Throttle/Debounce**
```typescript
// Update only on meaningful changes
const throttledUpdate = throttle(() => {
  experienceManager.update();
}, 16); // 60fps

window.addEventListener('scroll', throttledUpdate);
```

---

## Browser Compatibility & Fallbacks

### WebGL Detection
```typescript
function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

// If no WebGL: render static images + text
if (!hasWebGL()) {
  return <StaticFallbackExperience />;
}
```

### Responsive Canvas
```typescript
function resizeCanvas() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resizeCanvas);
```

---

## Testing Strategy

### Unit Tests
- Three.js scene composition
- Camera movement calculations
- Animation timing

### Integration Tests
- World transitions
- UI interactions
- State updates

### Performance Tests
- FPS monitoring
- Memory usage
- Load times

### Visual Tests
- Screenshots at breakpoints
- Animation smoothness
- Responsive layouts

---

## Deployment Considerations

### Build Optimization
```json
{
  "scripts": {
    "build": "next build && npm run optimize-assets",
    "optimize-assets": "script to compress models, textures"
  }
}
```

### CDN Strategy
```
/models/*.gltf → CDN with cache headers
/textures/*.{jpg,webp} → CDN with long cache
/audio/*.mp3 → CDN with streaming headers
```

### Performance Budget
```
JS Bundle: < 500KB (gzipped)
3D Models: < 2MB total
Textures: < 1MB total
First Paint: < 2s
Time to Interactive: < 3s
```

---

## Development Workflow

1. **Setup** → Install Three.js, GSAP, build tools
2. **Prototype** → Build Headquarters scene first
3. **Iterate** → Add RouteMaster world
4. **Optimize** → Performance tuning
5. **Test** → Cross-browser, responsive, accessibility
6. **Deploy** → Progressive enhancement active

---

## Success Criteria

- [ ] Homepage works without 3D (graceful degradation)
- [ ] 3D experience loads < 3s on 4G
- [ ] 60fps on desktop, 45fps on mobile
- [ ] All interactions keyboard-accessible
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Mobile viewport optimized
- [ ] No layout shifts (CLS < 0.1)
- [ ] Scroll animations feel responsive
- [ ] Hover states obvious on desktop
- [ ] Fallback experience is complete
