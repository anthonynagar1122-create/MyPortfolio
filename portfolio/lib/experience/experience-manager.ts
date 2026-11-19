import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Headquarters } from './worlds/headquarters';
import { RouteMaster } from './worlds/routemaster';

gsap.registerPlugin(ScrollTrigger);

export type WorldName = 'routemaster' | 'fufaji' | 'funds' | 'headquarters';

interface ExperienceConfig {
  container: HTMLCanvasElement;
  antialias?: boolean;
  enableStats?: boolean;
}

interface World {
  update: (deltaTime: number) => void;
  show: () => void;
  hide: () => void;
  dispose: () => void;
}

export class ExperienceManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationId: number = 0;

  private currentWorld: WorldName = 'headquarters';
  private worlds: Map<string, World> = new Map();
  private clock = new THREE.Clock();

  private cameraController: CameraController;
  private gsapTimeline: gsap.core.Timeline;

  constructor(config: ExperienceConfig) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.Fog(0x0f172a, 1000, 10000);

    // Camera setup
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: config.container,
      antialias: config.antialias ?? true,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Lighting setup
    this.setupLighting();

    // Initialize worlds
    this.initializeWorlds();

    // Camera controller
    this.cameraController = new CameraController(this.camera);

    // Timeline for coordinated animations
    this.gsapTimeline = gsap.timeline();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Start animation loop
    this.animate();
  }

  private initializeWorlds() {
    // Create and register worlds
    const headquarters = new Headquarters(this.scene, this.camera);
    headquarters.onSelectWorld((world) => {
      this.loadWorld(world as WorldName);
    });
    this.worlds.set('headquarters', headquarters);
    headquarters.show();

    const routemaster = new RouteMaster(this.scene, this.camera);
    routemaster.onSelectStation(() => {
      // Handle station selection - could show info panel
    });
    this.worlds.set('routemaster', routemaster);
    routemaster.hide(); // Hide initially, show when loaded
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Directional light (moon/sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.far = 50;
    this.scene.add(dirLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x0066ff, 0.3);
    fillLight.position.set(-10, 5, -10);
    this.scene.add(fillLight);
  }


  public async loadWorld(worldName: WorldName) {
    // Skip if already on this world
    if (this.currentWorld === worldName) return;

    // Fade out current world
    await this.transitionOut(0.8);

    // Hide current world
    const currentWorld = this.worlds.get(this.currentWorld);
    if (currentWorld) {
      currentWorld.hide();
    }

    // Set new world and show it
    this.currentWorld = worldName;
    const newWorld = this.worlds.get(this.currentWorld);
    if (newWorld) {
      newWorld.show();
    }

    // Fade in new world
    await this.transitionIn(0.8);
  }

  public async transitionOut(duration: number): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this.scene, {
        duration,
        opacity: 0,
        ease: 'power2.inOut',
        onComplete: resolve,
      });
    });
  }

  public async transitionIn(duration: number): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this.scene, {
        duration,
        opacity: 1,
        ease: 'power2.inOut',
        onComplete: resolve,
      });
    });
  }

  public getTimeline(): gsap.core.Timeline {
    return this.gsapTimeline;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    const deltaTime = this.clock.getDelta();

    // Update camera controller
    this.cameraController.update();

    // Update only the active world
    const world = this.worlds.get(this.currentWorld);
    if (world) {
      world.update(deltaTime);
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  public dispose() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize);
  }
}

class CameraController {
  private camera: THREE.PerspectiveCamera;
  private targetPosition = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.targetPosition.copy(camera.position);
    this.targetLookAt.set(0, 0, 0);
  }

  public moveTo(
    position: THREE.Vector3,
    lookAt: THREE.Vector3,
    duration: number = 1.5
  ): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this.camera.position, {
        x: position.x,
        y: position.y,
        z: position.z,
        duration,
        ease: 'power2.inOut',
      });

      gsap.to(this.targetLookAt, {
        x: lookAt.x,
        y: lookAt.y,
        z: lookAt.z,
        duration,
        ease: 'power2.inOut',
        onComplete: resolve,
      });
    });
  }

  public update() {
    this.camera.lookAt(this.targetLookAt);
  }

  public getPosition(): THREE.Vector3 {
    return this.camera.position.clone();
  }
}
