import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-sky-clouds-background',
  standalone: true,
  templateUrl: './sky-clouds-background.component.html',
  styleUrl: './sky-clouds-background.component.scss',
})
export class SkyCloudsBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasHost', { static: true }) canvasHost!: ElementRef<HTMLDivElement>;

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private frameId?: number;
  private resizeHandler?: () => void;
  private scrollHandler?: () => void;

  private readonly disposeList: Array<{ geometry?: THREE.BufferGeometry; material?: THREE.Material; texture?: THREE.Texture }> = [];
  private cloudGroup = new THREE.Group();
  private particlePoints?: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private sunGlow?: THREE.Sprite;

  private targetDepth = 0;
  private depth = 0;
  private running = false;
  private reducedMotion = false;
  private quality: 'desktop' | 'mobile' = 'desktop';

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reducedMotion) {
      return;
    }

    this.quality = window.innerWidth < 900 ? 'mobile' : 'desktop';
    this.running = true;
    this.initScene();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xd6efff, this.quality === 'desktop' ? 0.022 : 0.028);
    this.scene.background = new THREE.Color(0xcfeaff);

    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 0.2, 10);

    // Use non-alpha renderer so sky always visible.
    this.renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.canvasHost.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setClearColor(0xcfeaff, 1);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const sun = new THREE.DirectionalLight(0xffe2be, 1.25);
    sun.position.set(-3.5, 6.5, 6);
    this.scene.add(sun);
    const rim = new THREE.DirectionalLight(0xbfe6ff, 0.55);
    rim.position.set(4, 3, 2);
    this.scene.add(rim);

    this.addSunGlow();

    this.buildCloudLayers();
    if (this.quality === 'desktop') {
      this.buildFloatingParticles();
    }

    this.resizeHandler = () => {
      if (!this.camera || !this.renderer) {
        return;
      }
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', this.resizeHandler, { passive: true });

    this.scrollHandler = () => {
      const y = window.scrollY || 0;
      const vh = Math.max(1, window.innerHeight);
      const normalized = y / vh;
      this.targetDepth = Math.min(this.quality === 'desktop' ? 70 : 40, normalized * 18);
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.scrollHandler();

    this.animate();
  }

  private buildCloudLayers(): void {
    if (!this.scene) {
      return;
    }

    this.cloudGroup.clear();

    const cloudTexture = this.makeCloudTexture(512);
    const spriteMat = new THREE.SpriteMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
    });
    this.disposeList.push({ material: spriteMat, texture: cloudTexture });

    const layerCount = this.quality === 'desktop' ? 92 : 44;
    for (let i = 0; i < layerCount; i += 1) {
      const depth = Math.random();
      const cloud = new THREE.Sprite(spriteMat);
      cloud.position.set((Math.random() - 0.5) * 22, -3.2 + Math.random() * 7.2, -(depth * depth) * 95);
      const s = 1.5 + Math.random() * (this.quality === 'desktop' ? 3.6 : 2.6);
      cloud.scale.set(s * 6.0, s * 3.6, 1);
      // subtle per-cloud movement seed
      (cloud as unknown as { userData: { drift: number; sway: number } }).userData = {
        drift: Math.random() * 2 + 0.4,
        sway: Math.random() * 2 + 0.4,
      };
      this.cloudGroup.add(cloud);
    }

    this.scene.add(this.cloudGroup);
  }

  private buildFloatingParticles(): void {
    if (!this.scene) {
      return;
    }

    const geometry = new THREE.BufferGeometry();
    const count = 900;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const idx = i * 3;
      pos[idx] = (Math.random() - 0.5) * 30;
      pos[idx + 1] = (Math.random() - 0.5) * 14;
      pos[idx + 2] = -Math.random() * 70;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.03,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });

    this.particlePoints = new THREE.Points(geometry, material);
    this.scene.add(this.particlePoints);
    this.disposeList.push({ geometry, material });
  }

  private makeCloudTexture(size: number): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return new THREE.Texture();
    }

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = 'rgba(255,255,255,0)';
    ctx.fillRect(0, 0, size, size);

    // Soft “fluffy” blobs.
    const blobCount = Math.floor(70 + size / 10);
    for (let i = 0; i < blobCount; i += 1) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 22 + Math.random() * 74;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.24)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Slight warm highlight for sun side.
    const sun = ctx.createRadialGradient(size * 0.82, size * 0.2, 0, size * 0.82, size * 0.2, size * 0.95);
    sun.addColorStop(0, 'rgba(255,226,186,0.32)');
    sun.addColorStop(0.4, 'rgba(255,226,186,0.16)');
    sun.addColorStop(1, 'rgba(255,220,180,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private addSunGlow(): void {
    if (!this.scene) {
      return;
    }
    const tex = this.makeSunGlowTexture(256);
    const material = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(-5.6, 4.4, -18);
    sprite.scale.set(12, 12, 1);
    this.sunGlow = sprite;
    this.scene.add(sprite);
    this.disposeList.push({ material, texture: tex });
  }

  private makeSunGlowTexture(size: number): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return new THREE.Texture();
    }
    ctx.clearRect(0, 0, size, size);
    const g = ctx.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.5);
    g.addColorStop(0, 'rgba(255,245,230,0.95)');
    g.addColorStop(0.18, 'rgba(255,228,190,0.55)');
    g.addColorStop(0.45, 'rgba(255,228,190,0.22)');
    g.addColorStop(1, 'rgba(255,228,190,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  private animate = (): void => {
    if (!this.running || !this.scene || !this.camera || !this.renderer) {
      return;
    }

    // Smooth scroll depth.
    this.depth += (this.targetDepth - this.depth) * 0.05;

    const t = performance.now() * 0.0002;
    this.camera.position.z = 10 + this.depth;
    this.camera.position.x = Math.sin(t * 1.1) * 0.38;
    this.camera.position.y = 0.25 + Math.cos(t * 0.95) * 0.22;
    this.camera.lookAt(0, 0.2, -18);

    // Gentle cloud drift.
    this.cloudGroup.children.forEach((obj, i) => {
      const ud = (obj as unknown as { userData?: { drift?: number; sway?: number } }).userData;
      const drift = ud?.drift ?? 1;
      const sway = ud?.sway ?? 1;
      obj.position.x += Math.sin(t * (1.4 + drift) + i) * 0.0011;
      obj.position.y += Math.cos(t * (1.2 + sway) + i) * 0.00085;
    });

    if (this.particlePoints) {
      this.particlePoints.rotation.y += 0.00035;
      this.particlePoints.rotation.x = Math.sin(t * 1.4) * 0.02;
    }
    if (this.sunGlow) {
      this.sunGlow.material.opacity = 0.72 + (Math.sin(t * 3) + 1) * 0.06;
    }

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  };

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }

    this.scene?.remove(this.cloudGroup);
    this.cloudGroup.clear();
    if (this.particlePoints) {
      this.scene?.remove(this.particlePoints);
      this.particlePoints = undefined;
    }

    this.disposeList.forEach((entry) => {
      entry.geometry?.dispose();
      entry.material?.dispose();
      entry.texture?.dispose();
    });
    this.disposeList.length = 0;

    this.scene?.clear();
    this.renderer?.dispose();
    if (this.renderer?.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }

    this.running = false;
  }
}

