import * as THREE from 'three';
import gsap from 'gsap';

export interface WorldPortal {
  name: string;
  position: THREE.Vector3;
  color: THREE.Color;
  glowColor: string;
  description: string;
}

export const WORLD_PORTALS: Record<string, WorldPortal> = {
  routemaster: {
    name: 'RouteMaster',
    position: new THREE.Vector3(-8, 0, 0),
    color: new THREE.Color(0x3563f6),
    glowColor: '#3563f6',
    description: 'The Mobility Universe',
  },
  fufaji: {
    name: "Fufaji's",
    position: new THREE.Vector3(0, 0, 10),
    color: new THREE.Color(0xf59e0b),
    glowColor: '#f59e0b',
    description: 'The Digital Marketplace',
  },
  funds: {
    name: 'Funds-for-Family',
    position: new THREE.Vector3(8, 0, 0),
    color: new THREE.Color(0xfbbf24),
    glowColor: '#fbbf24',
    description: 'The Connection Network',
  },
};

export class Headquarters {
  private scene: THREE.Group;
  private sceneRoot: THREE.Scene;
  private spheres: Map<string, THREE.Group> = new Map();
  private labels: Map<string, { group: THREE.Group; isVisible: boolean }> = new Map();
  private camera: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private canvasElement: HTMLCanvasElement | null = null;

  private selectedWorld: string | null = null;
  private onWorldSelected: ((world: string) => void) | null = null;
  private isTransitioning = false;
  private cameraVelocity = new THREE.Vector3();
  private cameraTarget = new THREE.Vector3();

  private _onMouseMove?: (event: MouseEvent) => void;
  private _onClick?: (event: MouseEvent) => void;
  private _onTouchMove?: (event: TouchEvent) => void;
  private _onTouchEnd?: (event: TouchEvent) => void;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.sceneRoot = scene;
    this.scene = new THREE.Group();
    scene.add(this.scene);
    this.camera = camera;
    this.cameraTarget.copy(camera.position);

    this.setupAtmosphere();
    this.createPortals();
    this.setupInteraction();
    this.setupCameraAnimation();
  }

  private setupAtmosphere() {
    // Add subtle nebula effect with fog
    this.sceneRoot.fog = new THREE.Fog(0x0a0e27, 100, 200);
  }

  private createPortals() {
    Object.entries(WORLD_PORTALS).forEach(([key, portal]) => {
      const group = new THREE.Group();
      group.position.copy(portal.position);

      // Multiple glow layers for depth
      const glowLayers = [
        { radius: 2.8, opacity: 0.15 },
        { radius: 3.5, opacity: 0.08 },
      ];

      glowLayers.forEach((layer) => {
        const glowGeometry = new THREE.IcosahedronGeometry(layer.radius, 5);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: portal.color,
          transparent: true,
          opacity: layer.opacity,
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glowMesh);
      });

      // Core sphere - premium material
      const geometry = new THREE.IcosahedronGeometry(2, 6);
      const material = new THREE.MeshStandardMaterial({
        color: portal.color,
        emissive: portal.color,
        emissiveIntensity: 0.4,
        metalness: 0.4,
        roughness: 0.1,
        wireframe: false,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.castShadow = true;
      sphere.userData = { worldKey: key, type: 'portal' };
      group.add(sphere);

      // Animated orbital rings (multiple)
      for (let i = 0; i < 2; i++) {
        const ringGeometry = new THREE.TorusGeometry(2.5 + i * 0.4, 0.08, 32, 100);
        const ringMaterial = new THREE.MeshStandardMaterial({
          color: portal.color,
          emissive: portal.color,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.6,
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.z = Math.random() * Math.PI;
        ring.rotation.x = Math.random() * 0.5;
        ring.userData = { ringIndex: i, rotationSpeed: 0.3 + i * 0.2 };
        group.add(ring);
      }

      // Store sphere for interactions
      sphere.userData.groupRef = group;
      this.spheres.set(key, group);
      this.scene.add(group);

      // Setup animation state
      sphere.userData.originalScale = { x: 1, y: 1, z: 1 };
      sphere.userData.originalEmissiveIntensity = 0.4;
    });
  }

  private setupInteraction() {
    const onMouseMove = (event: MouseEvent) => {
      if (this.isTransitioning) return;

      const rect = this.canvasElement?.getBoundingClientRect();
      if (rect) {
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      } else {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      }

      this.updateHoverStates();
    };

    const onClick = (event: MouseEvent) => {
      if (this.isTransitioning) return;

      const rect = this.canvasElement?.getBoundingClientRect();
      if (rect) {
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
      } else {
        this.raycaster.setFromCamera(this.mouse, this.camera);
      }

      const objects: THREE.Object3D[] = [];
      this.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.userData.type === 'portal') {
          objects.push(obj);
        }
      });

      const intersects = this.raycaster.intersectObjects(objects);

      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Object3D;
        const worldKey = (obj.userData as Record<string, string>).worldKey;
        this.selectWorld(worldKey);
      }
    };

    // Touch support for mobile
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const rect = this.canvasElement?.getBoundingClientRect();
        if (rect) {
          this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        } else {
          this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
          this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        }
        this.updateHoverStates();
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const rect = this.canvasElement?.getBoundingClientRect();
        const x = rect
          ? ((touch.clientX - rect.left) / rect.width) * 2 - 1
          : (touch.clientX / window.innerWidth) * 2 - 1;
        const y = rect
          ? -((touch.clientY - rect.top) / rect.height) * 2 + 1
          : -(touch.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

        const objects: THREE.Object3D[] = [];
        this.scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh && obj.userData.type === 'portal') {
            objects.push(obj);
          }
        });

        const intersects = this.raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
          const obj = intersects[0].object as THREE.Object3D;
          const worldKey = (obj.userData as Record<string, string>).worldKey;
          this.selectWorld(worldKey);
        }
      }
    };

    // Event listeners will be attached once canvas is set via setCanvasElement
    this._onMouseMove = onMouseMove;
    this._onClick = onClick;
    this._onTouchMove = onTouchMove;
    this._onTouchEnd = onTouchEnd;
  }

  public setCanvasElement(canvas: HTMLCanvasElement) {
    this.canvasElement = canvas;
    if (this._onMouseMove) canvas.addEventListener('mousemove', this._onMouseMove);
    if (this._onClick) canvas.addEventListener('click', this._onClick);
    if (this._onTouchMove) canvas.addEventListener('touchmove', this._onTouchMove, { passive: true });
    if (this._onTouchEnd) canvas.addEventListener('touchend', this._onTouchEnd, { passive: true });
  }

  private updateHoverStates() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const objects: THREE.Object3D[] = [];
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.userData.type === 'portal') {
        objects.push(obj);
      }
    });

    const intersects = this.raycaster.intersectObjects(objects);
    const hoveredKey = intersects.length > 0
      ? ((intersects[0].object as THREE.Object3D).userData as Record<string, string>).worldKey
      : null;

    // Update all spheres
    this.spheres.forEach((group, key) => {
      const sphere = group.children[2] as THREE.Mesh; // Core sphere is now at index 2 (after 2 glow layers)
      const isHovered = key === hoveredKey;

      if (isHovered) {
        // Hover state - more dramatic
        gsap.to(sphere.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.4, ease: 'back.out' });
        const sphereMat = sphere.material as THREE.MeshStandardMaterial;
        gsap.to(sphereMat, { emissiveIntensity: 0.8, duration: 0.4 });

        // Enhance all glow layers
        for (let i = 0; i < 2; i++) {
          const glowLayer = group.children[i] as THREE.Mesh;
          const glowMat = glowLayer.material as THREE.MeshBasicMaterial;
          gsap.to(glowMat, { opacity: 0.3, duration: 0.4 });
        }

        // Speed up ring rotation
        for (let i = 2; i < group.children.length; i++) {
          const ring = group.children[i] as THREE.Mesh;
          if (ring.userData.ringIndex !== undefined) {
            gsap.to(ring.userData, { rotationSpeed: 2, duration: 0.4 });
          }
        }

        document.body.style.cursor = 'pointer';
      } else {
        // Normal state
        gsap.to(sphere.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out' });
        const sphereMat = sphere.material as THREE.MeshStandardMaterial;
        gsap.to(sphereMat, { emissiveIntensity: 0.4, duration: 0.4 });

        // Reset glow layers
        for (let i = 0; i < 2; i++) {
          const glowLayer = group.children[i] as THREE.Mesh;
          const glowMat = glowLayer.material as THREE.MeshBasicMaterial;
          const targetOpacity = i === 0 ? 0.15 : 0.08;
          gsap.to(glowMat, { opacity: targetOpacity, duration: 0.4 });
        }

        // Reset ring rotation speed
        for (let i = 2; i < group.children.length; i++) {
          const ring = group.children[i] as THREE.Mesh;
          if (ring.userData.ringIndex !== undefined) {
            gsap.to(ring.userData, { rotationSpeed: 0.5, duration: 0.4 });
          }
        }

        document.body.style.cursor = 'default';
      }
    });
  }

  private setupCameraAnimation() {
    // Camera animation will happen in update() - no independent RAF loop
  }

  private selectWorld(worldKey: string) {
    if (this.selectedWorld === worldKey || this.isTransitioning) return;
    this.selectedWorld = worldKey;
    this.isTransitioning = true;

    const selectedGroup = this.spheres.get(worldKey);
    const selectedPortal = WORLD_PORTALS[worldKey];

    if (selectedGroup && selectedPortal) {
      // Pulseoutward effect on sphere
      const sphere = selectedGroup.children[2] as THREE.Mesh;

      gsap.to(sphere.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.6,
        ease: 'back.out',
      });

      const sphereMat = sphere.material as THREE.MeshStandardMaterial;
      gsap.to(sphereMat, {
        emissiveIntensity: 1,
        duration: 0.6,
      });

      // Dramatic camera zoom-in toward portal
      const targetPos = new THREE.Vector3().copy(selectedPortal.position);
      targetPos.z += 8;
      targetPos.y += 2;

      gsap.to(this.camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.2,
        ease: 'power2.inOut',
        onComplete: () => {
          if (this.onWorldSelected) {
            this.onWorldSelected(worldKey);
          }
        },
      });

      // Fade out other portals
      this.spheres.forEach((group, key) => {
        if (key !== worldKey) {
          group.children.forEach((child) => {
            const childMesh = child as THREE.Mesh;
            if (childMesh.material && 'opacity' in childMesh.material) {
              gsap.to(childMesh.material, { opacity: 0, duration: 1 });
            }
          });
        }
      });
    }
  }

  public onSelectWorld(callback: (world: string) => void) {
    this.onWorldSelected = callback;
  }

  public update(deltaTime: number) {
    // Orbital camera animation with mouse parallax
    if (!this.isTransitioning) {
      const time = Date.now() * 0.0003;
      const orbitX = Math.cos(time) * 18;
      const orbitZ = Math.sin(time) * 18;

      this.cameraTarget.x = orbitX + this.mouse.x * 1;
      this.cameraTarget.z = orbitZ + this.mouse.y * 1;
      this.cameraTarget.y = 7 + Math.sin(time * 0.5) * 1;
    }

    // Smooth camera following
    this.camera.position.lerp(this.cameraTarget, 0.08);
    this.camera.lookAt(0, 2, 0);

    // Rotate multiple rings at different speeds
    this.spheres.forEach((group) => {
      const rings = group.children.filter((child) => child instanceof THREE.Mesh && child.userData.ringIndex !== undefined);

      rings.forEach((ring) => {
        const meshRing = ring as THREE.Mesh;
        const baseSpeed = 0.3 + rings.indexOf(ring) * 0.2;
        const rotationSpeed = (meshRing.userData as Record<string, number>).rotationSpeed || baseSpeed;
        meshRing.rotation.z += deltaTime * rotationSpeed;
        meshRing.rotation.x += deltaTime * 0.1;
      });
    });

    // Gentle orbital bob animation with phase shift
    this.spheres.forEach((group, key) => {
      const startY = WORLD_PORTALS[key].position.y;
      const phaseShift = Object.keys(WORLD_PORTALS).indexOf(key) * 2;
      group.position.y = startY + Math.sin(Date.now() * 0.0008 + phaseShift) * 0.4;
    });

    // Pulsing glow effect
    this.spheres.forEach((group) => {
      const sphere = group.children[2] as THREE.Mesh;
      if (!this.isTransitioning) {
        const pulse = Math.sin(Date.now() * 0.003) * 0.1 + 0.4;
        const sphereMat = sphere.material as THREE.MeshStandardMaterial;
        sphereMat.emissiveIntensity = pulse;
      }
    });
  }

  public show() {
    this.scene.visible = true;
  }

  public hide() {
    this.scene.visible = false;
  }

  public dispose() {
    // Kill all GSAP animations
    this.spheres.forEach((group) => {
      const sphere = group.children[2] as THREE.Mesh;
      gsap.killTweensOf(sphere.scale);
      gsap.killTweensOf(sphere.material);
      group.children.forEach((child) => {
        gsap.killTweensOf(child);
      });
    });
    gsap.killTweensOf(this.camera.position);

    // Remove event listeners from canvas
    if (this.canvasElement) {
      if (this._onMouseMove) this.canvasElement.removeEventListener('mousemove', this._onMouseMove);
      if (this._onClick) this.canvasElement.removeEventListener('click', this._onClick);
      if (this._onTouchMove) this.canvasElement.removeEventListener('touchmove', this._onTouchMove);
      if (this._onTouchEnd) this.canvasElement.removeEventListener('touchend', this._onTouchEnd);
    }

    // Dispose geometries and materials
    this.spheres.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        }
      });
    });
  }
}
