# Motion Specifications: Animation Timing & Easing

## Easing Functions Used

```typescript
// GSAP easing presets observed

// Smooth, natural ease-out (most common)
ease: "power2.out"      // Deceleration, natural feel
// Duration: 0.6-1.5s
// Use: Camera movements, scene transitions, fades

// Tight, bouncy ease-out
ease: "back.out"        // Slight overshoot, premium feel
// Duration: 0.3-0.5s
// Use: Hover effects, card reveals, button clicks

// Linear with easing
ease: "linear"          // Constant speed (rare, mostly scroll)
// Duration: variable based on distance
// Use: Scroll-linked animations only

// Elastic ease for emphasis
ease: "elastic.out"     // Bouncy, playful
// Duration: 0.5-0.8s
// Use: Special emphasis moments, game interactions
```

## Standard Timing Durations

| Duration | Use Case | Easing |
|----------|----------|--------|
| **0.3s** | Hover states, quick feedback | back.out, power1.out |
| **0.5s** | UI state changes, fades | power2.out |
| **0.6s** | HUD elements appear/disappear | power2.out |
| **0.8s** | Avatar/character reveals | back.out, power2.out |
| **1.0s** | Medium scene transitions | power2.out |
| **1.5s** | Large camera movements | power2.out |
| **2.0s** | Slow reveals, emphasis | power2.out |

## Stagger Timing

```
Sequential reveals with stagger pattern:
- Item 1: 0s
- Item 2: +0.1-0.2s
- Item 3: +0.1-0.2s
- ...

Total stagger for 5 items: 0.4-0.8s
Perceived as: smooth cascade, not jarring
```

## Scroll-Linked Animations

```typescript
// GSAP ScrollTrigger pattern observed

gsap.to(element, {
  scrollTrigger: {
    trigger: element,
    start: "top center",      // Animation starts when element hits center
    end: "bottom center",     // Animation ends when element exits center
    scrub: 1,                 // 1s smoothing lag for organic feel
    markers: false
  },
  // ... animation properties
});
```

**Parameters:**
- Start: "top center" (element top at viewport center)
- End: "bottom center" (element bottom at viewport center)
- Scrub: 1 (1 second smoothing delay)
- Markers: false (remove in production)

---

## Camera Animation Specifications

### Cockpit to Project Explorer (Entry)
```
Duration: 1.5s
Easing: power2.out
Camera moves:
  - Z position: -10 → -25 (move closer)
  - Rotation: 0° → -15° (tilt down)
  - FOV: 75° → 85° (slight zoom)
  - Look at: (0, 0, 0) → (0, 2, 0) (shift focus)
```

### Project Card Zoom
```
Duration: 1s
Easing: power2.out
Camera moves:
  - Z: -25 → -40 (zoom in on card)
  - Rotation: 0° → 5° (slight tilt to card)
  - Scale: 1 → 1.1 (card grows)
```

### Case Study Entrance (Glass Elevator)
```
Duration: 1.5s
Easing: power2.out
Camera moves:
  - Z: variable (enter building)
  - Rotation: 0° → 10-20° (look up)
  - FOV: 85° → 60° (narrow view, cinematic)
  - Look at: (0, 0, 0) → (0, 10, 0) (look up)
```

### Scroll-Driven Camera Pan (During Case Study)
```
Scroll linked with scrub: 1
Camera pans across scene:
  - Start: left side view
  - End: right side view
  - X rotation: 0° → 15°
  - Y position: varies by chapter
  - Speed: 1px scroll ≈ 0.3° camera rotation
```

---

## Opacity/Fade Animations

| Element | From | To | Duration | Delay | Easing |
|---------|------|-----|----------|-------|--------|
| HUD overlay | 0 | 1 | 0.6s | 0.5s | power2.out |
| Navigation labels | 0 | 1 | 0.5s | 0.2-0.6s staggered | power2.out |
| Background images | 0.5 | 1 | 1.0s | 0 | power2.out |
| Project cards | 0 | 1 | 0.5s | 0.1-0.5s staggered | power2.out |
| Text content | 0 | 1 | 0.6s | scroll-linked | power2.out |

---

## Scale/Transform Animations

### Hover Effects
```typescript
// Card hover
scale: 1 → 1.05
duration: 0.3s
easing: back.out
filter: drop-shadow(0 10px 30px rgba(0, 255, 255, 0.3))

// Button hover
scale: 1 → 1.1
duration: 0.3s
easing: power1.out
color: shift by 10%

// Project thumbnail hover
scale: 1 → 1.08
duration: 0.3s
easing: back.out
glow: blur(20px) brightness(1.2)
```

### Entrance Animations
```typescript
// Avatar reveal
scale: 0.8 → 1
opacity: 0 → 1
duration: 0.8s
easing: back.out

// Card cascade
scale: 0.95 → 1
opacity: 0 → 1
duration: 0.5s
easing: back.out
stagger: 0.1s between cards
```

---

## Rotation Animations

### Ambient Rotation (Cockpit Vehicle)
```typescript
// Continuous, non-linear
rotationY: 360° loop
duration: 8-12s per full rotation
easing: none (linear)
direction: counterclockwise
pause on: hover (optional)
```

### Interactive Rotation (Plugin Viewer)
```typescript
// User-triggered, smooth
rotationX: 0° → 180°
rotationY: 0° → 360°
duration: 1.5s
easing: power2.inOut
on click/drag: responsive to user input
```

---

## Color/Light Animations

### Neon Glow Effects
```
// Hover glow on cards
filter: drop-shadow(0 0 20px #00ffff)
animation duration: 0.3s fade
color options:
  - Cyan: #00ffff
  - Purple: #9966ff
  - Gold: #ffcc00
```

### Light Intensity Changes
```
// Scene lighting shift
intensity: 0.5 → 0.8
duration: 1.5s
easing: power2.out
direction: on scene load
```

---

## Particle & Effect Animations

### Hologram Particles (Game Mode)
```
Spawn rate: 10-20 per second
Life: 0.5-1.5s
Scale: 1 → 0
Opacity: 1 → 0
Rotation: random
Color: cyan, purple, white
Physics: upward drift, gravity
```

### Trail Effects (Camera Movement)
```
Trail particles follow camera
Fade: quick (0.3s)
Color: match scene lighting
Density: high during rapid transitions
Disable on mobile
```

---

## UI Animation Patterns

### Loading Indicator
```
// Progress bar animation
width: 0% → 100%
duration: variable (matches actual load)
easing: power1.out
color: gradient cyan → gold
```

### Status HUD Update
```
// Number count-up
duration: 0.5s
easing: power2.out
stagger: 0.1s between values
example: 0 → 42 (count-up style)
```

### Modal/Overlay Transitions
```
Fade in:
  opacity: 0 → 1
  duration: 0.4s
  easing: power2.out
  backdrop blur: 0px → 10px

Slide in (from side):
  x: -100% → 0%
  duration: 0.5s
  easing: power2.out
```

---

## Mobile Animation Adaptations

| Animation | Desktop | Mobile | Reason |
|-----------|---------|--------|--------|
| Camera moves | 1.5s | 1.0s | Faster on slower devices |
| Fades | 0.6s | 0.4s | Reduce perceived lag |
| Hovers | Active | Disabled | No hover on touch |
| Scroll effects | Full | Simplified | Reduce jank |
| Particles | Enabled | Disabled | Performance |
| Glow effects | Full blur | Reduced | Power efficiency |
| Stagger | 0.1-0.2s | 0.05s | Faster cascade |

---

## Performance Optimization Techniques

### GPU Acceleration (Critical)
```css
/* Force GPU acceleration */
will-change: transform, opacity;
transform: translate3d(0, 0, 0);
backface-visibility: hidden;
perspective: 1000px;
```

### Animation Throttling
```javascript
// Scroll animations throttled to 60fps
requestAnimationFrame(updateAnimation);
// Debounce: 16ms between updates (60fps)
```

### Lazy Loading
```javascript
// Load 3D models only when needed
const model = await THREE.load('model.gltf');
// Load project images on project selection
// Load plugin demo code only when tab active
```

---

## Testing Checklist

- [ ] All transitions smooth at 60fps on desktop
- [ ] Mobile animations complete in <1s
- [ ] Hover states respond within 100ms
- [ ] Scroll interactions feel responsive (no lag)
- [ ] GPU acceleration enabled (check DevTools)
- [ ] No layout shifts during animations
- [ ] Prefers-reduced-motion respected
- [ ] Particle effects disabled on mobile
- [ ] Camera movements use power2.out easing
- [ ] Stagger timing 0.1-0.2s between items
