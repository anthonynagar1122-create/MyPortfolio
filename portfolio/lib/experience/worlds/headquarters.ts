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
  private spheres: Map<string, THREE.Group> = new Map();
  private camera: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private selectedWorld: string | null = null;
  private onWorldSelected: ((world: string) => void) | null = null;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = new THREE.Group();
    scene.add(this.scene);
    this.camera = camera;

    this.createPortals();
    this.setupInteraction();
    this.setupCameraAnimation();
  }

  private createPortals() {
    Object.entries(WORLD_PORTALS).forEach(([key, portal]) => {
      const group = new THREE.Group();
      group.position.copy(portal.position);

      // Core sphere
      const geometry = new THREE.IcosahedronGeometry(2, 5);
      const material = new THREE.MeshStandardMaterial({
        color: portal.color,
        emissive: portal.color,
        emissiveIntensity: 0.3,
        metalness: 0.6,
        roughness: 0.2,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.castShadow = true;
      sphere.userData = { worldKey: key, type: 'portal' };
      group.add(sphere);

      // Glow sphere
      const glowGeometry = new THREE.IcosahedronGeometry(2.3, 5);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: portal.color,
        transparent: true,
        opacity: 0.2,
      });

      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.scale.set(1, 1, 1);
      group.add(glow);

      // Orbital ring
      const ringGeometry = new THREE.TorusGeometry(2.5, 0.1, 32, 100);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: portal.color,
        emissive: portal.color,
        emissiveIntensity: 0.4,
      });

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.z = Math.random() * Math.PI;
      group.add(ring);

      this.spheres.set(key, group);
      this.scene.add(group);

      // Hover animation setup
      sphere.userData.originalScale = { x: 1, y: 1, z: 1 };
      sphere.userData.originalEmissiveIntensity = 0.3;
    });
  }

  private setupInteraction() {
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.updateHoverStates();
    });

    window.addEventListener('click', (event) => {
      this.raycaster.setFromCamera(this.mouse, this.camera);

      const objects: THREE.Object3D[] = [];
      this.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.userData.type === 'portal') {
          objects.push(obj);
        }
      });

      const intersects = this.raycaster.intersectObjects(objects);

      if (intersects.length > 0) {
        const worldKey = (intersects[0].object as any).userData.worldKey;
        this.selectWorld(worldKey);
      }
    });
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
      ? (intersects[0].object as any).userData.worldKey
      : null;

    // Update all spheres
    this.spheres.forEach((group, key) => {
      const sphere = group.children[0] as THREE.Mesh;
      const glow = group.children[1] as THREE.Mesh;
      const ring = group.children[2] as THREE.Mesh;

      if (key === hoveredKey) {
        // Hover state
        gsap.to(sphere.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3, ease: 'back.out' });
        gsap.to((sphere.material as any), { emissiveIntensity: 0.6, duration: 0.3 });
        gsap.to((glow.material as any), { opacity: 0.4, duration: 0.3 });
        document.body.style.cursor = 'pointer';
      } else {
        // Normal state
        gsap.to(sphere.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'back.out' });
        gsap.to((sphere.material as any), { emissiveIntensity: 0.3, duration: 0.3 });
        gsap.to((glow.material as any), { opacity: 0.2, duration: 0.3 });
        document.body.style.cursor = 'default';
      }
    });
  }

  private setupCameraAnimation() {
    // Camera orbits around headquarters
    gsap.to(this.camera.position, {
      x: Math.sin(Date.now() * 0.0001) * 20,
      y: 8,
      z: 20,
      duration: 60,
      repeat: -1,
      ease: 'none',
    });
  }

  private selectWorld(worldKey: string) {
    if (this.selectedWorld === worldKey) return;
    this.selectedWorld = worldKey;

    // Animate selected sphere
    const selectedGroup = this.spheres.get(worldKey);
    if (selectedGroup) {
      gsap.to(selectedGroup.position, {
        y: selectedGroup.position.y - 3,
        duration: 1.5,
        ease: 'back.out',
      });

      // Call callback
      if (this.onWorldSelected) {
        this.onWorldSelected(worldKey);
      }
    }
  }

  public onSelectWorld(callback: (world: string) => void) {
    this.onWorldSelected = callback;
  }

  public update(deltaTime: number) {
    // Rotate rings
    this.spheres.forEach((group) => {
      const ring = group.children[2] as THREE.Mesh;
      ring.rotation.z += deltaTime * 0.3;
    });

    // Gentle bob animation
    this.spheres.forEach((group, key) => {
      const startY = WORLD_PORTALS[key].position.y;
      group.position.y = startY + Math.sin(Date.now() * 0.001 + key.length) * 0.3;
    });
  }

  public dispose() {
    window.removeEventListener('mousemove', this.updateHoverStates);
    window.removeEventListener('click', this.selectWorld);
  }
}
