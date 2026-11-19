# Interaction Inventory: Nathan's Website

## Scene Map & Navigation Destinations

### SCENE 01: Digital Cockpit (Hero/Landing)
**Purpose:** Immersive introduction and primary navigation hub

| Element | Behavior | Animation Details |
|---------|----------|------------------|
| **Vehicle 3D Model** | Static display with ambient rotation | Rotation: 0.5-1 deg/frame, smooth easing |
| **Cockpit Interior** | Visible through transparent canopy | No animation, lighting only |
| **Status HUD** | Shows vehicle stats, coordinates, status | Fade-in on load, 0.6s duration |
| **Paint Selection** | 6 color swatches for vehicle customization | Instant swap on click, 0.3s fade |
| **Sound Toggle** | Mute/unmute SFX (not music) | Icon animation on click |
| **Music Deck** | Track selection and playback | Animated waveform, real-time response |
| **Game Mode Button** | Enter interactive game (dodge holograms) | Hover scale 1.1, click transition |
| **Navigation Labels** | Cases, About, Plugins, Index | Fade-in stagger, 0.2s between |
| **Enter Button** | Cinematic camera zoom into project explorer | 1.5-2s transition, ease-out |

**Timing:** Page load → 0.5s delay → HUD fade in (0.6s) → labels stagger (0.2s each)

**Responsive:** Mobile hides some HUD elements, maintains core navigation

---

### SCENE 02: Project Explorer (Destination Grid)
**Purpose:** Visual project index with preview selection

| Element | Behavior | Animation Details |
|---------|----------|------------------|
| **Project Thumbnails** | 11 clickable destination cards | Fade in staggered, grid animation |
| **Thumbnail Hover** | Scale and glow effect | Scale: 1.05, glow blur 20px, 0.3s |
| **Selection Highlight** | Active project gets border/glow | Instant, persistent until deselect |
| **Index Numbers** | Shows project position in list | Fade with thumbnails |
| **Camera Transition** | Zoom from cockpit → destination grid | 1-1.5s, smooth camera movement |
| **Previous Button** | Navigate to previous project | Fade-in/out of button, 0.3s |
| **Next Button** | Navigate to next project | Fade-in/out of button, 0.3s |
| **Back to Cockpit** | Exit to hero scene | Reverse camera zoom, 1.5s |

**Timing:** 
- Cockpit → Explorer: 1.5s camera transition
- Thumbnails appear during transition
- Hover effects: instant, 0.3s feedback

**Layout:** Grid varies by screen size (1 col mobile, 2-3 cols tablet, 3-4 cols desktop)

---

### SCENE 03: Case Study / Project Details
**Purpose:** Detailed project narrative with scroll-driven storytelling

| Element | Behavior | Animation Details |
|---------|----------|------------------|
| **Glass Elevator Entrance** | Camera reveals environment | Fade-in background, 1s duration |
| **Floor/Chapter Transitions** | Scroll triggers scene changes | Scroll-linked, smooth camera pan |
| **Illustrated Background** | Parallax depth effect | Depth scrolling, speed varies by layer |
| **Project Description Text** | Fades in as you scroll | Fade threshold at viewport center |
| **Image Assets** | Scale and fade as scrolled into view | Scale 0.95→1.0, opacity 0→1 |
| **Call-to-Action Buttons** | Fixed or sticky during scroll | Sticky positioning, fade-in at bottom |
| **Return Navigation** | Go back to project list | Fade-out content, reverse camera move |

**Timing:**
- Entrance: 1-1.5s
- Scroll interactions: continuous, responsive to scroll speed
- Text reveals: staggered, 0.3-0.5s fade duration
- Exit: 1-1.5s reverse transition

**Scroll-Driven Details:**
- Project intro visible immediately (100vh)
- Features reveal every 150-200vh scroll
- CTA button "sticky" enters at 70% down
- Scroll velocity affects camera speed (faster scroll = faster pan)

---

### SCENE 04: About Section
**Purpose:** Designer introduction and capabilities showcase

| Element | Behavior | Animation Details |
|---------|----------|------------------|
| **Scene Background** | Cinematic environment change | Fade to new backdrop, 1s |
| **Designer Avatar** | Introduction reveal | Scale and fade-in, 0.8s |
| **Bio Text** | Line-by-line progressive reveal | Staggered fade, 0.2s per line |
| **Capability Cards** | Interactive skill showcase | Fade-in staggered, 0.15s between |
| **Card Hover** | Scale and shadow effect | Scale 1.08, shadow blur 15px, 0.3s |
| **Credits Section** | Attribution and acknowledgments | Fade-in at bottom, 0.6s delay |
| **Back to Navigation** | Return to main menu | Fade-out, return to cockpit view |

**Timing:**
- Scene transition: 1s
- Avatar reveal: 0.8s
- Bio stagger: 0.2s between lines
- Card stagger: 0.15s between cards
- Credits: 0.6s delay, then 0.6s fade

---

### SCENE 05: Plugin Laboratory
**Purpose:** Interactive demonstrations of capabilities/plugins

| Element | Behavior | Animation Details |
|---------|----------|------------------|
| **Plugin Container** | Main display area for demo | Fade-in on selection, 0.5s |
| **Device Mode Toggle** | Switch between desktop/mobile/tablet views | Container scale/reposition, 0.4s |
| **Sample Data Input** | Interactive form fields | Focus states, error animations |
| **Live Preview** | Real-time update of demo | Instant visual feedback |
| **Plugin Navigation** | Carousel or list of available plugins | Slide transition between plugins, 0.5s |
| **Reset Button** | Restore demo to default state | Fade animation, 0.3s |
| **Plugin Tabs** | Switch between different demonstrations | Tab highlight slide, content fade, 0.4s |

**Timing:**
- Plugin load: 0.5s fade-in
- Mode switch: 0.4s transition
- Data input: instant visual feedback
- Navigation: 0.5s slide between items
- Tab switch: 0.4s fade

**Interaction Loop:**
1. Select plugin (0.5s load)
2. Choose device mode (0.4s resize)
3. Interact with demo (instant)
4. View results (real-time)
5. Reset demo (0.3s)

---

## Hover & Focus States

| Element | Desktop Hover | Mobile Touch | Keyboard Focus |
|---------|---------------|--------------|-----------------|
| Buttons | Scale 1.1, color shift | None (touch-only) | Outline + color |
| Cards | Glow effect, scale 1.05 | Highlight on tap | Ring focus |
| Text Links | Underline, fade effect | Highlight + underline | Ring + underline |
| Navigation Items | Color change, scale 1.02 | Highlight | Ring focus |

---

## Keyboard Navigation

**Assumed implementations:**
- Tab: Cycle through interactive elements
- Enter/Space: Activate button/link
- Escape: Exit modals/popups
- Arrow Keys: Navigate project carousel
- Cmd/Ctrl + K: Open command palette (assumed)

---

## Mobile Adaptations

**Portrait (< 640px):**
- Simplified 3D scene or static background
- Full-screen menu overlay
- Touch-friendly button sizes (48px min)
- Vertical project grid (1 column)
- Reduced animation complexity
- No hover states, focus states emphasized

**Landscape (640-1024px):**
- Medium complexity 3D
- 2-column project grid
- Optimized canvas resolution
- Standard touch interactions

**Desktop (> 1024px):**
- Full 3D experience
- 3-4 column project grid
- All hover states active
- Complex scroll interactions
- Maximum animation fidelity

---

## Performance Triggers

| Interaction | Performance Cost | Optimization |
|-------------|-----------------|--------------|
| Scene transition | High (camera move + fade) | 1-2s debounce between transitions |
| Scroll interaction | Medium (continuous) | Throttle at 60fps, skip frames if needed |
| Hover effects | Low (CSS transforms) | GPU-accelerated transforms |
| 3D rotation | Medium | LOD (level of detail) for mobile |
| Particle effects | High | Disabled on mobile, reduced on tablet |

---

## State Management

**Global States:**
- Current scene (cockpit, explorer, case study, about, plugins)
- Selected project (index 0-10)
- Sound enabled (boolean)
- Music playing (boolean)
- Color selection (0-5 paint options)
- Device mode (desktop, tablet, mobile)

**Local States per Scene:**
- Scroll position (cases only)
- Hover element (all)
- Focus element (all)
- Animation frame count (continuous)

---

## Accessibility Fallbacks

**Missing 3D (WebGL unsupported):**
- Static background image
- Text-only content display
- Simple fade transitions (no camera moves)
- Reduced animation

**Motion sensitivity (prefers-reduced-motion):**
- Instant transitions instead of 1-2s animations
- No parallax scrolling
- Static hover states instead of scale/glow
- No continuous rotations

**Low power device:**
- 1-column layout
- No particle effects
- Reduced texture quality
- Smaller canvas resolution
