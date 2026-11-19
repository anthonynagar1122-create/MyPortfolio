import * as THREE from 'three';
import gsap from 'gsap';

interface StationNode {
  id: string;
  name: string;
  position: THREE.Vector3;
  color: THREE.Color;
  description: string;
  capacity: string;
}

interface Train {
  id: string;
  mesh: THREE.Mesh;
  corridorIndex: number;
  progress: number;
  speed: number;
}

const STATION_NODES: Record<string, StationNode> = {
  north: {
    id: 'north',
    name: 'Northern Hub',
    position: new THREE.Vector3(-8, 2, -10),
    color: new THREE.Color(0x00d4ff),
    description: 'Railway & Express Networks',
    capacity: 'Multi-modal hub with rail, express bus connectivity',
  },
  central: {
    id: 'central',
    name: 'Central Station',
    position: new THREE.Vector3(0, 0, 0),
    color: new THREE.Color(0x1e90ff),
    description: 'Primary Interchange',
    capacity: 'Major metropolitan transport nexus',
  },
  south: {
    id: 'south',
    name: 'Southern Terminal',
    position: new THREE.Vector3(8, 2, 8),
    color: new THREE.Color(0x00bfff),
    description: 'Regional Transit Center',
    capacity: 'Long-distance and regional connectivity',
  },
};

export class RouteMaster {
  private scene: THREE.Group;
  private sceneRoot: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private stations: Map<string, THREE.Group> = new Map();
  private corridors: THREE.Line[] = [];
  private trains: Train[] = [];

  private selectedStation: string | null = null;
  private onStationSelected: ((station: string) => void) | null = null;
  private isTransitioning = false;
  private cameraTarget = new THREE.Vector3();
  private cameraVelocity = new THREE.Vector3();

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
    this.createStations();
    this.createCorridors();
    this.createTrains();
    this.setupInteraction();
    this.setupCameraAnimation();
  }

  private setupAtmosphere() {
    // Deep navy and black fog for observatory effect
    this.sceneRoot.fog = new THREE.Fog(0x0a0e27, 80, 250);
  }

  private createStations() {
    Object.entries(STATION_NODES).forEach(([key, station]) => {
      const group = new THREE.Group();
      group.position.copy(station.position);

      // Multiple glow layers for depth
      const glowLayers = [
        { radius: 1.2, opacity: 0.2 },
        { radius: 1.8, opacity: 0.1 },
      ];

      glowLayers.forEach((layer) => {
        const glowGeometry = new THREE.IcosahedronGeometry(layer.radius, 4);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: station.color,
          transparent: true,
          opacity: layer.opacity,
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glowMesh);
      });

      // Core station sphere
      const geometry = new THREE.SphereGeometry(0.8, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: station.color,
        emissive: station.color,
        emissiveIntensity: 0.5,
        metalness: 0.6,
        roughness: 0.2,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.castShadow = true;
      sphere.userData = { stationId: key, type: 'station' };
      group.add(sphere);

      // Animated station ring
      const ringGeometry = new THREE.TorusGeometry(1, 0.06, 32, 100);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: station.color,
        emissive: station.color,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.8,
      });

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 3;
      ring.userData = { rotationSpeed: 0.5 };
      group.add(ring);

      sphere.userData.groupRef = group;
      this.stations.set(key, group);
      this.scene.add(group);

      sphere.userData.originalScale = { x: 1, y: 1, z: 1 };
      sphere.userData.originalEmissiveIntensity = 0.5;
    });
  }

  private createCorridors() {
    const corridorConfigs = [
      { from: 'north', to: 'central', color: 0x00ffaa },
      { from: 'central', to: 'south', color: 0xffaa00 },
      { from: 'north', to: 'south', color: 0xaa00ff },
    ];

    corridorConfigs.forEach((config) => {
      const fromPos = STATION_NODES[config.from].position;
      const toPos = STATION_NODES[config.to].position;

      // Glowing corridor
      const points = [fromPos, toPos];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: config.color,
        linewidth: 2,
        fog: true,
      });

      const line = new THREE.Line(geometry, material);
      line.userData = { type: 'corridor', color: config.color };
      this.scene.add(line);
      this.corridors.push(line);

      // Add glowing tube effect using cylinder
      const distance = fromPos.distanceTo(toPos);
      const midpoint = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);
      const direction = new THREE.Vector3().subVectors(toPos, fromPos).normalize();

      const tubeGeometry = new THREE.CylinderGeometry(0.15, 0.15, distance, 16);
      const tubeMaterial = new THREE.MeshStandardMaterial({
        color: config.color,
        emissive: config.color,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.3,
      });

      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      tube.position.copy(midpoint);
      tube.lookAt(toPos);
      tube.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
      this.scene.add(tube);
    });
  }

  private createTrains() {
    const trainConfigs = [
      { corridorIndex: 0, startPos: 0.1, speed: 0.15 },
      { corridorIndex: 1, startPos: 0.3, speed: 0.12 },
      { corridorIndex: 2, startPos: 0.5, speed: 0.18 },
    ];

    trainConfigs.forEach((config, index) => {
      const trainGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.6);
      const trainMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 0.7,
        metalness: 0.5,
        roughness: 0.3,
      });

      const trainMesh = new THREE.Mesh(trainGeometry, trainMaterial);
      trainMesh.castShadow = true;

      this.trains.push({
        id: `train-${index}`,
        mesh: trainMesh,
        corridorIndex: config.corridorIndex,
        progress: config.startPos,
        speed: config.speed,
      });

      this.scene.add(trainMesh);
    });
  }

  private setupInteraction() {
    const onMouseMove = (event: MouseEvent) => {
      if (this.isTransitioning) return;

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Subtle camera following
      this.cameraTarget.x = this.camera.position.x + this.mouse.x * 1.5;
      this.cameraTarget.z = this.camera.position.z + this.mouse.y * 1.5;

      this.updateHoverStates();
    };

    const onClick = (event: MouseEvent) => {
      if (this.isTransitioning) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      const objects: THREE.Object3D[] = [];
      this.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.userData.type === 'station') {
          objects.push(obj);
        }
      });

      const intersects = this.raycaster.intersectObjects(objects);

      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Object3D;
        const stationId = (obj.userData as Record<string, string>).stationId;
        this.selectStation(stationId);
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        onMouseMove(mouseEvent as unknown as MouseEvent);
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const mouseEvent = new MouseEvent('click', {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        onClick(mouseEvent as unknown as MouseEvent);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    this._onMouseMove = onMouseMove;
    this._onClick = onClick;
    this._onTouchMove = onTouchMove;
    this._onTouchEnd = onTouchEnd;
  }

  private updateHoverStates() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const objects: THREE.Object3D[] = [];
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.userData.type === 'station') {
        objects.push(obj);
      }
    });

    const intersects = this.raycaster.intersectObjects(objects);
    const hoveredId = intersects.length > 0
      ? ((intersects[0].object as THREE.Object3D).userData as Record<string, string>).stationId
      : null;

    this.stations.forEach((group, key) => {
      const sphere = group.children[2] as THREE.Mesh;
      const isHovered = key === hoveredId;

      if (isHovered) {
        gsap.to(sphere.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.4, ease: 'back.out' });
        const sphereMat = sphere.material as THREE.MeshStandardMaterial;
        gsap.to(sphereMat, { emissiveIntensity: 1, duration: 0.4 });

        for (let i = 0; i < 2; i++) {
          const glowLayer = group.children[i] as THREE.Mesh;
          const glowMat = glowLayer.material as THREE.MeshBasicMaterial;
          gsap.to(glowMat, { opacity: 0.4, duration: 0.4 });
        }

        const ring = group.children[3] as THREE.Mesh;
        gsap.to(ring.userData, { rotationSpeed: 2, duration: 0.4 });

        document.body.style.cursor = 'pointer';
      } else {
        gsap.to(sphere.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out' });
        const sphereMat = sphere.material as THREE.MeshStandardMaterial;
        gsap.to(sphereMat, { emissiveIntensity: 0.5, duration: 0.4 });

        for (let i = 0; i < 2; i++) {
          const glowLayer = group.children[i] as THREE.Mesh;
          const glowMat = glowLayer.material as THREE.MeshBasicMaterial;
          const targetOpacity = i === 0 ? 0.2 : 0.1;
          gsap.to(glowMat, { opacity: targetOpacity, duration: 0.4 });
        }

        const ring = group.children[3] as THREE.Mesh;
        gsap.to(ring.userData, { rotationSpeed: 0.5, duration: 0.4 });

        document.body.style.cursor = 'default';
      }
    });
  }

  private setupCameraAnimation() {
    const orbitLoop = () => {
      if (!this.isTransitioning) {
        const time = Date.now() * 0.0002;
        const orbitX = Math.cos(time) * 20;
        const orbitZ = Math.sin(time) * 20;

        this.cameraTarget.x = orbitX + this.mouse.x * 0.8;
        this.cameraTarget.z = orbitZ + this.mouse.y * 0.8;
        this.cameraTarget.y = 8 + Math.sin(time * 0.4) * 1.5;
      }
      requestAnimationFrame(orbitLoop);
    };
    orbitLoop();
  }

  private selectStation(stationId: string) {
    if (this.selectedStation === stationId || this.isTransitioning) return;
    this.selectedStation = stationId;
    this.isTransitioning = true;

    const station = STATION_NODES[stationId];
    const stationGroup = this.stations.get(stationId);

    if (stationGroup && station) {
      const sphere = stationGroup.children[2] as THREE.Mesh;

      gsap.to(sphere.scale, {
        x: 1.6,
        y: 1.6,
        z: 1.6,
        duration: 0.6,
        ease: 'back.out',
      });

      const sphereMat = sphere.material as THREE.MeshStandardMaterial;
      gsap.to(sphereMat, { emissiveIntensity: 1.2, duration: 0.6 });

      // Camera focus on selected station
      const targetPos = new THREE.Vector3().copy(station.position);
      targetPos.z += 6;
      targetPos.y += 3;

      gsap.to(this.camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          if (this.onStationSelected) {
            this.onStationSelected(stationId);
          }
        },
      });

      // Fade non-selected stations
      this.stations.forEach((group, key) => {
        if (key !== stationId) {
          group.children.forEach((child) => {
            const childMesh = child as THREE.Mesh;
            if (childMesh.material && 'opacity' in childMesh.material) {
              gsap.to(childMesh.material, { opacity: 0, duration: 0.8 });
            }
          });
        }
      });
    }
  }

  public onSelectStation(callback: (station: string) => void) {
    this.onStationSelected = callback;
  }

  public getSelectedStation(): StationNode | null {
    return this.selectedStation ? STATION_NODES[this.selectedStation] : null;
  }

  public update(deltaTime: number) {
    // Smooth camera following
    this.camera.position.lerp(this.cameraTarget, 0.08);
    this.camera.lookAt(0, 2, 0);

    // Animate station rings
    this.stations.forEach((group) => {
      const ring = group.children[3] as THREE.Mesh;
      if (ring && ring.userData.rotationSpeed !== undefined) {
        const baseSpeed = 0.5;
        const rotationSpeed = (ring.userData as Record<string, number>).rotationSpeed || baseSpeed;
        ring.rotation.z += deltaTime * rotationSpeed;
        ring.rotation.x += deltaTime * 0.08;
      }
    });

    // Gentle station bob animation
    this.stations.forEach((group, key) => {
      const startY = STATION_NODES[key].position.y;
      const phaseShift = Object.keys(STATION_NODES).indexOf(key) * 2;
      group.position.y = startY + Math.sin(Date.now() * 0.0007 + phaseShift) * 0.3;
    });

    // Pulsing station glow
    this.stations.forEach((group) => {
      const sphere = group.children[2] as THREE.Mesh;
      if (!this.isTransitioning) {
        const pulse = Math.sin(Date.now() * 0.003) * 0.15 + 0.5;
        const sphereMat = sphere.material as THREE.MeshStandardMaterial;
        sphereMat.emissiveIntensity = pulse;
      }
    });

    // Animate trains along corridors
    this.trains.forEach((train) => {
      train.progress += deltaTime * train.speed;

      // Loop train movement
      if (train.progress > 1) {
        train.progress = 0;
      }

      const corridorConfig = [
        { from: 'north', to: 'central' },
        { from: 'central', to: 'south' },
        { from: 'north', to: 'south' },
      ][train.corridorIndex];

      if (corridorConfig) {
        const fromPos = STATION_NODES[corridorConfig.from].position;
        const toPos = STATION_NODES[corridorConfig.to].position;

        // Interpolate train position
        train.mesh.position.lerpVectors(fromPos, toPos, train.progress);

        // Orient train toward destination
        const direction = new THREE.Vector3().subVectors(toPos, fromPos);
        train.mesh.lookAt(train.mesh.position.clone().add(direction));
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
    if (this._onMouseMove) window.removeEventListener('mousemove', this._onMouseMove);
    if (this._onClick) window.removeEventListener('click', this._onClick);
    if (this._onTouchMove) window.removeEventListener('touchmove', this._onTouchMove);
    if (this._onTouchEnd) window.removeEventListener('touchend', this._onTouchEnd);
  }
}
