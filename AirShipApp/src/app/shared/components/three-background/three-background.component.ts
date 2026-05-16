import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, Input, OnChanges, OnDestroy, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { BackgroundSceneService, SceneMode } from '../../../core/services/background-scene.service';

export type ThreeBackgroundPreset = 'A' | 'C' | 'E';

@Component({
  selector: 'app-three-background',
  standalone: true,
  imports: [],
  templateUrl: './three-background.component.html',
  styleUrl: './three-background.component.scss',
})
export class ThreeBackgroundComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() preset: ThreeBackgroundPreset = 'C';
  @ViewChild('canvasHost', { static: true }) canvasHost!: ElementRef<HTMLDivElement>;

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private frameId?: number;
  private resizeHandler?: () => void;
  private runningHeavyScene = false;
  private initialized = false;

  private readonly disposeList: Array<{ geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] }> = [];
  private oceanParticles?: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private waveLines: THREE.Line[] = [];
  private islandGroup = new THREE.Group();
  private pinOrbitGroup = new THREE.Group();
  private beamsGroup = new THREE.Group();
  private bubbleGroup = new THREE.Group();
  private balloonGroup = new THREE.Group();
  private ribbonGroup = new THREE.Group();
  private ribbons: THREE.Mesh[] = [];
  private detailPortal?: THREE.Mesh;

  private currentDepth = 0;
  private targetDepth = 0;
  private densityCurrent = 1200;
  private densityTarget = 1200;
  private accentCurrent = new THREE.Color('#3ad8e5');
  private accentTarget = new THREE.Color('#3ad8e5');

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly sceneState: BackgroundSceneService
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.innerWidth < 1024 || reducedMotion) {
      return;
    }

    this.runningHeavyScene = true;
    this.initializeScene();
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!this.initialized || !changes['preset']) {
      return;
    }
    this.rebuildScene();
  }

  private initializeScene(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
    this.camera.position.set(0, 0.6, 16);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.canvasHost.nativeElement.appendChild(this.renderer.domElement);

    // Light, white-friendly lighting (alpha renderer, so page background stays white).
    this.scene.add(new THREE.AmbientLight(0xf4fbff, 0.92));
    const keyLight = new THREE.DirectionalLight(0xd6efff, 0.92);
    keyLight.position.set(5, 7, 9);
    const sunLight = new THREE.PointLight(0xffe5bf, 0.6, 120);
    sunLight.position.set(-10, 12, 6);
    const warmFill = new THREE.PointLight(0xf2caa0, 0.25, 90);
    warmFill.position.set(8, -2, 14);
    this.scene.add(keyLight);
    this.scene.add(sunLight, warmFill);

    this.buildPreset(this.preset);

    this.resizeHandler = () => {
      if (!this.camera || !this.renderer) {
        return;
      }
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', this.resizeHandler);
    this.animate();
  }

  private rebuildScene(): void {
    if (!this.runningHeavyScene) {
      return;
    }
    this.disposeSceneObjects();
    this.buildPreset(this.preset);
  }

  private buildPreset(preset: ThreeBackgroundPreset): void {
    switch (preset) {
      case 'A':
        this.createOceanParticlesLight();
        this.createWaveLinesLight();
        this.createUnderwaterBeamsLight();
        break;
      case 'E':
        this.createRibbonFlowLight();
        break;
      case 'C':
      default:
        this.createFloatingGlassIslandsLight();
        this.createOceanParticlesLight();
        this.createWaveLinesLight();
        this.createOrbitPinsLight();
        this.createDetailPortal();
        break;
    }
  }

  private createRibbonFlowLight(): void {
    this.ribbonGroup.clear();
    this.ribbons = [];

    const baseColors = [0x0f6eb8, 0x7a5ccf, 0xf08a5b];
    const zOffsets = [-10, -14, -18];

    for (let i = 0; i < 3; i += 1) {
      const points: THREE.Vector3[] = [];
      const phase = i * 1.6;
      for (let step = 0; step <= 220; step += 1) {
        const t = step / 220;
        const x = (t - 0.5) * 22;
        const y = Math.sin(t * Math.PI * 2 + phase) * (0.7 + i * 0.12) + (i - 1) * 0.55;
        const z = zOffsets[i] - Math.cos(t * Math.PI * 2 + phase) * (1.8 + i * 0.25);
        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 240, 0.08 + i * 0.012, 10, false);
      const material = new THREE.MeshStandardMaterial({
        color: baseColors[i],
        transparent: true,
        opacity: 0.3,
        roughness: 0.35,
        metalness: 0.15,
        emissive: new THREE.Color(baseColors[i]),
        emissiveIntensity: 0.12,
      });

      const ribbon = new THREE.Mesh(geometry, material);
      ribbon.rotation.x = 0.2;
      this.ribbonGroup.add(ribbon);
      this.ribbons.push(ribbon);
      this.disposeList.push({ geometry, material });
    }

    this.scene?.add(this.ribbonGroup);
  }

  private createUnderwaterBeamsLight(): void {
    this.beamsGroup.clear();
    for (let i = 0; i < 5; i += 1) {
      const geometry = new THREE.CylinderGeometry(0.08, 0.5, 18, 12, 1, true);
      const material = new THREE.MeshBasicMaterial({ color: 0xb9d7f3, transparent: true, opacity: 0.045, side: THREE.DoubleSide });
      const beam = new THREE.Mesh(geometry, material);
      beam.position.set((Math.random() - 0.5) * 26, -2.8, -10 - i * 10);
      beam.rotation.z = (Math.random() - 0.5) * 0.18;
      this.beamsGroup.add(beam);
      this.disposeList.push({ geometry, material });
    }
    this.scene?.add(this.beamsGroup);
  }

  private createFloatingGlassIslands(): void {
    for (let i = 0; i < 5; i += 1) {
      const geometry = new THREE.IcosahedronGeometry(1.1 + i * 0.18, 1);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xa5c7e6,
        roughness: 0.16,
        metalness: 0.45,
        transmission: 0.55,
        transparent: true,
        opacity: 0.45,
        clearcoat: 1,
      });
      const island = new THREE.Mesh(geometry, material);
      island.position.set((i - 2) * 3.2, (Math.random() - 0.5) * 2.3, -2 - i * 2.7);
      island.rotation.set(Math.random(), Math.random(), Math.random());
      this.islandGroup.add(island);
      this.disposeList.push({ geometry, material });
    }
    this.scene?.add(this.islandGroup);
  }

  private createFloatingGlassIslandsLight(): void {
    this.islandGroup.clear();
    for (let i = 0; i < 6; i += 1) {
      const geometry = new THREE.IcosahedronGeometry(1.05 + i * 0.16, 1);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xd7efff,
        roughness: 0.12,
        metalness: 0.25,
        transmission: 0.74,
        transparent: true,
        opacity: 0.28,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      });
      const island = new THREE.Mesh(geometry, material);
      island.position.set((i - 2.5) * 3.0, (Math.random() - 0.45) * 2.2, -3 - i * 2.9);
      island.rotation.set(Math.random(), Math.random(), Math.random());
      this.islandGroup.add(island);
      this.disposeList.push({ geometry, material });
    }
    this.scene?.add(this.islandGroup);
  }

  private createOceanParticles(): void {
    const geometry = new THREE.BufferGeometry();
    const points = new Float32Array(1800 * 3);
    for (let i = 0; i < points.length; i += 3) {
      points[i] = (Math.random() - 0.5) * 44;
      points[i + 1] = (Math.random() - 0.5) * 22;
      points[i + 2] = -Math.random() * 80;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.setDrawRange(0, this.densityCurrent);

    const material = new THREE.PointsMaterial({ color: 0x60b3df, size: 0.06, transparent: true, opacity: 0.54 });
    this.oceanParticles = new THREE.Points(geometry, material);
    this.scene?.add(this.oceanParticles);
    this.disposeList.push({ geometry, material });
  }

  private createOceanParticlesLight(): void {
    const geometry = new THREE.BufferGeometry();
    const points = new Float32Array(1600 * 3);
    for (let i = 0; i < points.length; i += 3) {
      points[i] = (Math.random() - 0.5) * 46;
      points[i + 1] = (Math.random() - 0.5) * 22;
      points[i + 2] = -Math.random() * 90;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.setDrawRange(0, Math.min(this.densityCurrent, 1200));

    const material = new THREE.PointsMaterial({ color: 0x88c6ea, size: 0.05, transparent: true, opacity: 0.26 });
    this.oceanParticles = new THREE.Points(geometry, material);
    this.scene?.add(this.oceanParticles);
    this.disposeList.push({ geometry, material });
  }

  private createWaveLines(): void {
    for (let i = 0; i < 4; i += 1) {
      const points: THREE.Vector3[] = [];
      for (let step = 0; step <= 130; step += 1) {
        const x = (step - 65) * 0.36;
        const y = Math.sin(step * 0.17 + i) * 0.3 + i * 0.45 - 1;
        const z = -5 - i * 4.2;
        points.push(new THREE.Vector3(x, y, z));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x85bae8, transparent: true, opacity: 0.2 });
      const line = new THREE.Line(geometry, material);
      this.waveLines.push(line);
      this.scene?.add(line);
      this.disposeList.push({ geometry, material });
    }
  }

  private createWaveLinesLight(): void {
    this.waveLines.forEach((line) => this.scene?.remove(line));
    this.waveLines = [];
    for (let i = 0; i < 3; i += 1) {
      const points: THREE.Vector3[] = [];
      for (let step = 0; step <= 120; step += 1) {
        const x = (step - 60) * 0.38;
        const y = Math.sin(step * 0.16 + i) * 0.22 + i * 0.5 - 1.1;
        const z = -6 - i * 4.6;
        points.push(new THREE.Vector3(x, y, z));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0xa6d6f2, transparent: true, opacity: 0.12 });
      const line = new THREE.Line(geometry, material);
      this.waveLines.push(line);
      this.scene?.add(line);
      this.disposeList.push({ geometry, material });
    }
  }

  private createOrbitPins(): void {
    const pinGeometry = new THREE.ConeGeometry(0.11, 0.38, 10);
    const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xe2b980, emissive: 0x7a5730, emissiveIntensity: 0.3 });

    for (let i = 0; i < 10; i += 1) {
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.set(Math.cos(i) * (2 + Math.random() * 5), Math.sin(i * 0.6) * 1.2, -4 - Math.random() * 24);
      pin.rotation.x = Math.PI;
      this.pinOrbitGroup.add(pin);
    }

    this.scene?.add(this.pinOrbitGroup);
    this.disposeList.push({ geometry: pinGeometry, material: pinMaterial });
  }

  private createOrbitPinsLight(): void {
    this.pinOrbitGroup.clear();
    const pinGeometry = new THREE.ConeGeometry(0.1, 0.34, 10);
    const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xe7c894, emissive: 0xffffff, emissiveIntensity: 0.12 });

    for (let i = 0; i < 9; i += 1) {
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.set(Math.cos(i) * (2 + Math.random() * 5), Math.sin(i * 0.6) * 1.1, -5 - Math.random() * 26);
      pin.rotation.x = Math.PI;
      this.pinOrbitGroup.add(pin);
    }

    this.scene?.add(this.pinOrbitGroup);
    this.disposeList.push({ geometry: pinGeometry, material: pinMaterial });
  }

  private createUnderwaterBeams(): void {
    for (let i = 0; i < 6; i += 1) {
      const geometry = new THREE.CylinderGeometry(0.09, 0.55, 18, 12, 1, true);
      const material = new THREE.MeshBasicMaterial({ color: 0x9fbbe8, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
      const beam = new THREE.Mesh(geometry, material);
      beam.position.set((Math.random() - 0.5) * 26, -2.6, -8 - i * 9);
      beam.rotation.z = (Math.random() - 0.5) * 0.22;
      this.beamsGroup.add(beam);
      this.disposeList.push({ geometry, material });
    }
    this.scene?.add(this.beamsGroup);
  }

  private createDetailPortal(): void {
    const geometry = new THREE.TorusGeometry(2.2, 0.08, 24, 120);
    const material = new THREE.MeshBasicMaterial({ color: 0x0f6eb8, transparent: true, opacity: 0.0 });
    this.detailPortal = new THREE.Mesh(geometry, material);
    this.detailPortal.position.set(0, 0.8, -16);
    this.scene?.add(this.detailPortal);
    this.disposeList.push({ geometry, material });
  }

  private createBubbles(): void {
    for (let i = 0; i < 18; i += 1) {
      const geometry = new THREE.SphereGeometry(0.12 + Math.random() * 0.22, 18, 18);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        transmission: 0.8,
        roughness: 0.05,
      });
      const bubble = new THREE.Mesh(geometry, material);
      bubble.position.set((Math.random() - 0.5) * 26, (Math.random() - 0.2) * 10, -6 - Math.random() * 26);
      this.bubbleGroup.add(bubble);
      this.disposeList.push({ geometry, material });
    }
    this.scene?.add(this.bubbleGroup);
  }

  private createBalloons(): void {
    for (let i = 0; i < 8; i += 1) {
      const geometry = new THREE.SphereGeometry(0.28, 18, 18);
      const material = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xf08a5b : 0x0f6eb8,
        metalness: 0.1,
        roughness: 0.4,
      });
      const balloon = new THREE.Mesh(geometry, material);
      balloon.position.set((Math.random() - 0.5) * 20, -1 + Math.random() * 6, -8 - Math.random() * 20);
      this.balloonGroup.add(balloon);
      this.disposeList.push({ geometry, material });
    }
    this.scene?.add(this.balloonGroup);
  }

  private animate = (): void => {
    if (!this.runningHeavyScene || !this.scene || !this.camera || !this.renderer) {
      return;
    }

    const depthSignal = this.sceneState.routeDepth();
    const mode = this.sceneState.sceneMode();
    this.targetDepth = depthSignal;

    const densityByDepth = 900 + Math.round(depthSignal * 850);
    this.densityTarget = densityByDepth;

    const targetAccent = this.getAccentForMode(mode);
    this.accentTarget.set(targetAccent);

    this.currentDepth += (this.targetDepth - this.currentDepth) * 0.035;
    this.densityCurrent += (this.densityTarget - this.densityCurrent) * 0.07;
    this.accentCurrent.lerp(this.accentTarget, 0.05);

    const t = performance.now() * 0.00022;
    const preset = this.preset;
    const isRibbon = preset === 'E';
    this.camera.position.z = 16 - this.currentDepth * 7.4 + Math.sin(t * 3) * 0.2;
    this.camera.position.x = Math.sin(t * 1.7) * (isRibbon ? 0.7 : 0.45);
    this.camera.position.y = 0.55 + Math.cos(t * 1.3) * (isRibbon ? 0.32 : 0.26);
    if (isRibbon) {
      this.camera.position.z = 14.2 - this.currentDepth * 4.6 + Math.sin(t * 2.2) * 0.18;
    }

    this.islandGroup.rotation.y += 0.0009;
    this.islandGroup.rotation.x = Math.sin(t * 1.8) * 0.07;
    this.pinOrbitGroup.rotation.y -= 0.0022 + this.currentDepth * 0.0016;
    this.bubbleGroup.rotation.y += 0.0014;
    this.balloonGroup.rotation.y -= 0.0012;

    this.waveLines.forEach((line, i) => {
      line.position.y = Math.sin(t * 5 + i) * 0.12;
      (line.material as THREE.LineBasicMaterial).color.lerp(this.accentCurrent, 0.045);
    });

    if (this.preset === 'E') {
      this.ribbonGroup.rotation.y += 0.0012;
      this.ribbonGroup.rotation.x = 0.12 + Math.sin(t * 4) * 0.03;
      this.ribbons.forEach((ribbon, i) => {
        ribbon.rotation.z = Math.sin(t * 4.5 + i) * 0.06;
        const material = ribbon.material as THREE.MeshStandardMaterial;
        material.opacity = 0.22 + (0.06 * (1 + Math.sin(t * 7 + i))) / 2;
      });
    }

    this.beamsGroup.children.forEach((beamObject, i) => {
      const beam = beamObject as THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
      beam.position.y = -2.8 + Math.sin(t * 6 + i) * 0.38;
      beam.material.opacity = 0.06 + this.currentDepth * 0.06;
      beam.material.color.lerp(this.accentCurrent, 0.03);
    });

    this.bubbleGroup.children.forEach((bubbleObject, i) => {
      const bubble = bubbleObject as THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>;
      bubble.position.y += Math.sin(t * 7 + i) * 0.01;
      bubble.material.color.lerp(this.accentCurrent, 0.01);
    });

    this.balloonGroup.children.forEach((balloonObject, i) => {
      balloonObject.position.y = -0.8 + Math.sin(t * 3 + i) * 1.2;
    });

    if (this.oceanParticles) {
      this.oceanParticles.rotation.y += 0.0005;
      this.oceanParticles.geometry.setDrawRange(0, Math.floor(this.densityCurrent));
      this.oceanParticles.material.color.lerp(this.accentCurrent, 0.04);
      this.oceanParticles.material.opacity = 0.48 + this.currentDepth * 0.18;
    }

    if (this.detailPortal) {
      const detailStrength = mode === 'detail' ? 1 : 0;
      const material = this.detailPortal.material as THREE.MeshBasicMaterial;
      material.opacity += (detailStrength * 0.72 - material.opacity) * 0.06;
      material.color.lerp(this.accentCurrent, 0.05);
      this.detailPortal.rotation.z += 0.0025;
      this.detailPortal.rotation.x = Math.sin(t * 2.2) * 0.08;
    }

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  };

  private getAccentForMode(mode: SceneMode): string {
    switch (mode) {
      case 'offers':
        return '#f08a5b';
      case 'contact':
        return '#1ea980';
      case 'detail':
        return '#7a5ccf';
      case 'listing':
        return '#0f6eb8';
      case 'city':
        return '#3a8fca';
      case 'transfer':
        return '#cda24f';
      default:
        return '#0f6eb8';
    }
  }

  ngOnDestroy(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    this.disposeSceneObjects();
    this.renderer?.dispose();

    if (this.renderer?.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }

  private disposeSceneObjects(): void {
    this.disposeList.forEach((entry) => {
      entry.geometry?.dispose();
      if (Array.isArray(entry.material)) {
        entry.material.forEach((material) => material.dispose());
      } else {
        entry.material?.dispose();
      }
    });
    this.disposeList.length = 0;

    this.waveLines.forEach((line) => this.scene?.remove(line));
    this.waveLines = [];
    this.oceanParticles && this.scene?.remove(this.oceanParticles);
    this.oceanParticles = undefined;
    this.scene?.remove(this.islandGroup);
    this.scene?.remove(this.pinOrbitGroup);
    this.scene?.remove(this.beamsGroup);
    this.scene?.remove(this.bubbleGroup);
    this.scene?.remove(this.balloonGroup);
    this.scene?.remove(this.ribbonGroup);
    if (this.detailPortal) {
      this.scene?.remove(this.detailPortal);
      this.detailPortal = undefined;
    }

    this.islandGroup.clear();
    this.pinOrbitGroup.clear();
    this.beamsGroup.clear();
    this.bubbleGroup.clear();
    this.balloonGroup.clear();
    this.ribbonGroup.clear();
    this.ribbons = [];
  }
}
