import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinService } from '../../services/coin.service';
import { CoinImageResponse, CoinSide, MetalType, CoinResponse, CoinShape } from '../../models/coin.model';
import * as THREE from 'three';

@Component({
  selector: 'app-coin-viewer-3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full">
      <!-- 3D Viewer -->
      <div #viewer class="w-full h-full bg-bg-tertiary rounded-xl overflow-hidden"></div>

      <!-- Loading Overlay -->
      @if (loading) {
        <div class="absolute inset-0 bg-bg-tertiary/80 flex items-center justify-center rounded-xl">
          <div class="spinner"></div>
        </div>
      }

      <!-- Controls -->
      @if (showControls && !loading) {
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            (click)="flipCoin()"
            class="btn btn-secondary px-3 py-1.5 text-xs"
            title="Flip coin"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"/>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
          </button>
          <button
            (click)="toggleRotation()"
            class="btn btn-secondary px-3 py-1.5 text-xs"
            [class.bg-accent]="currentAutoRotate"
            [class.text-bg-primary]="currentAutoRotate"
            title="Toggle auto-rotate"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
            </svg>
          </button>
          <button
            (click)="resetView()"
            class="btn btn-secondary px-3 py-1.5 text-xs"
            title="Reset view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: []
})
export class CoinViewer3dComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('viewer', { static: false }) viewerRef!: ElementRef<HTMLDivElement>;

  @Input() coinId!: string;
  @Input() coin: CoinResponse | null = null;
  @Input() size: 'small' | 'large' = 'large';
  @Input() interactive = true;
  @Input() autoRotate = true;
  @Input() showControls = true;
  @Input() metalType: MetalType | null = null;
  @Input() rarityScore: number | null = null;

  private coinService = inject(CoinService);

  images: CoinImageResponse[] | null = null;
  loading = true;

  // Three.js properties
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private coinGroup!: THREE.Group;
  private coinMesh: THREE.Group | null = null;
  private particles: THREE.Points | null = null;
  private particleVelocities: THREE.Vector3[] = [];
  private animationId: number | null = null;
  private textureLoader = new THREE.TextureLoader();
  private sceneInitialized = false;
  private pendingCoinBuild: { frontUrl: string | null; backUrl: string | null } | null = null;

  // Interaction state
  isDragging = false;
  prevMouse = { x: 0, y: 0 };
  targetRot = { x: 0, y: 0 };
  currentAutoRotate = true;

  ngOnInit(): void {
    this.currentAutoRotate = this.autoRotate;
    if (this.coinId) {
      this.loadImages(this.coinId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['coinId'] && !changes['coinId'].firstChange && this.coinId) {
      this.loadImages(this.coinId);
    }
    if (changes['rarityScore'] && this.sceneInitialized && !changes['rarityScore'].firstChange) {
      this.updateSceneBackground();
      if (this.images) {
        const obverseImage = this.images.find(img => img.side === CoinSide.OBVERSE);
        const reverseImage = this.images.find(img => img.side === CoinSide.REVERSE);
        const frontUrl = obverseImage ? this.coinService.getCoinImageUrl(this.coinId, obverseImage.id) : null;
        const backUrl = reverseImage ? this.coinService.getCoinImageUrl(this.coinId, reverseImage.id) : null;
        this.buildCoin(frontUrl, backUrl);
      }
    }
  }

  ngAfterViewInit(): void {
    const initialized = this.initThreeJS();

    if (initialized) {
      this.sceneInitialized = true;

      if (this.pendingCoinBuild) {
        this.buildCoin(this.pendingCoinBuild.frontUrl, this.pendingCoinBuild.backUrl);
        this.pendingCoinBuild = null;
      }

      this.animate();
    }
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private loadImages(coinId: string): void {
    this.loading = true;
    this.coinService.getCoinImages(coinId).subscribe({
      next: (images) => {
        this.images = images;
        this.loading = false;

        const obverseImage = images.find(img => img.side === CoinSide.OBVERSE);
        const reverseImage = images.find(img => img.side === CoinSide.REVERSE);

        const frontUrl = obverseImage
          ? this.coinService.getCoinImageUrl(coinId, obverseImage.id)
          : null;
        const backUrl = reverseImage
          ? this.coinService.getCoinImageUrl(coinId, reverseImage.id)
          : null;

        if (this.sceneInitialized) {
          this.buildCoin(frontUrl, backUrl);
        } else {
          this.pendingCoinBuild = { frontUrl, backUrl };
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading images:', err);
        if (this.sceneInitialized) {
          this.buildCoin(null, null);
        } else {
          this.pendingCoinBuild = { frontUrl: null, backUrl: null };
        }
      }
    });
  }

  private initThreeJS(): boolean {
    if (!this.viewerRef) {
      console.error('Viewer element not found');
      return false;
    }

    const container = this.viewerRef.nativeElement;

    // Scene
    this.scene = new THREE.Scene();
    this.updateSceneBackground();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = this.size === 'small' ? 3.5 : 4.5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // Lighting
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 5, 5);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8899aa, 1.3);
    fillLight.position.set(-5, 0, -5);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, -5, 0);
    this.scene.add(rimLight);

    // Coin Group
    this.coinGroup = new THREE.Group();
    this.scene.add(this.coinGroup);

    // Add event listeners only if interactive
    if (this.interactive) {
      this.addEventListeners();
    }

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
      }
    });
    resizeObserver.observe(container);

    return true;
  }

  private buildCoin(frontUrl: string | null, backUrl: string | null): void {
    if (this.coinMesh) {
      this.coinGroup.remove(this.coinMesh);
      this.coinMesh.traverse(child => {
        if ((child as THREE.Mesh).geometry) {
          (child as THREE.Mesh).geometry.dispose();
        }
        if ((child as THREE.Mesh).material) {
          const material = (child as THREE.Mesh).material;
          const standardMat = material as THREE.MeshStandardMaterial;
          if (standardMat.map) {
            standardMat.map.dispose();
          }
          if (Array.isArray(material)) {
            material.forEach(mat => mat.dispose());
          } else {
            material.dispose();
          }
        }
      });
    }

    // Remove existing particles
    if (this.particles) {
      this.scene.remove(this.particles);
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
      this.particles = null;
    }

    const loadTexture = (url: string | null): Promise<THREE.Texture | null> => {
      return new Promise(resolve => {
        if (!url) {
          resolve(this.createDefaultTexture());
          return;
        }

        this.textureLoader.load(
          url,
          texture => {
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.center.set(0.5, 0.5);
            resolve(texture);
          },
          undefined,
          () => resolve(this.createDefaultTexture())
        );
      });
    };

    Promise.all([
      loadTexture(frontUrl),
      loadTexture(backUrl || frontUrl)
    ]).then(([frontTex, backTex]) => {
      const radius = this.size === 'small' ? 1 : 1.4;
      const thickness = this.size === 'small' ? 0.08 : 0.1;
      const segments = this.size === 'small' ? 64 : 128;

      const edgeMat = this.createEdgeMaterial();
      const frontMat = this.createCoinMaterial(frontTex);
      const backMat = this.createCoinMaterial(backTex || frontTex);

      const edgeGeo = this.createEdgeGeometry(radius, thickness, segments);
      const edge = new THREE.Mesh(edgeGeo, edgeMat);

      const frontGeo = this.createCoinFaceGeometry(radius * 0.99, segments);
      const front = new THREE.Mesh(frontGeo, frontMat);
      front.position.z = thickness / 2 + 0.001;

      const backGeo = this.createCoinFaceGeometry(radius * 0.99, segments);
      const back = new THREE.Mesh(backGeo, backMat);
      back.position.z = -thickness / 2 - 0.001;
      back.rotation.y = Math.PI;

      this.coinMesh = new THREE.Group();
      this.coinMesh.add(edge, front, back);
      this.coinGroup.add(this.coinMesh);

      this.createParticles();
    });
  }

  private createParticles(): void {
    // Only create particles for high rarity coins (score >= 90)
    if (!this.rarityScore || this.rarityScore < 90) {
      return;
    }

    const particleColor = new THREE.Color(0xffd700);
    const particleCount = 80;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    this.particleVelocities = [];

    const radius = this.size === 'small' ? 2 : 2.5;
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = radius * (0.7 + Math.random() * 0.3);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = -Math.abs(r * Math.cos(phi));

      this.particleVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002
        )
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      color: particleColor,
      size: this.size === 'small' ? 0.08 : 0.12,
      map: texture,
      opacity: 0.3,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private createDefaultTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, '#d8d8d8');
    grad.addColorStop(0.5, '#c0c0c0');
    grad.addColorStop(1, '#a0a0a0');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  private createPerfectPolygon(sides: number, radius: number): THREE.Shape {
    const shape = new THREE.Shape();
    const angleOffset = Math.PI / 2;
    const cornerRadius = radius * 0.05;

    const vertices: THREE.Vector2[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = angleOffset + (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      vertices.push(new THREE.Vector2(x, y));
    }

    const firstVertex = vertices[0];
    const lastVertex = vertices[vertices.length - 1];

    const startDir = new THREE.Vector2().subVectors(lastVertex, firstVertex).normalize();
    const startPoint = new THREE.Vector2().addVectors(firstVertex, startDir.multiplyScalar(cornerRadius));
    shape.moveTo(startPoint.x, startPoint.y);

    for (let i = 0; i < vertices.length; i++) {
      const current = vertices[i];
      const next = vertices[(i + 1) % vertices.length];
      const prev = vertices[(i - 1 + vertices.length) % vertices.length];

      const dirToCurrent = new THREE.Vector2().subVectors(current, prev).normalize();
      const dirToNext = new THREE.Vector2().subVectors(next, current).normalize();

      const beforeCorner = new THREE.Vector2().addVectors(current, dirToCurrent.clone().multiplyScalar(-cornerRadius));
      const afterCorner = new THREE.Vector2().addVectors(current, dirToNext.clone().multiplyScalar(cornerRadius));

      shape.lineTo(beforeCorner.x, beforeCorner.y);
      shape.quadraticCurveTo(current.x, current.y, afterCorner.x, afterCorner.y);
    }

    shape.closePath();
    return shape;
  }

  private createEdgeGeometry(radius: number, thickness: number, segments: number): THREE.BufferGeometry {
    const shape = this.coin?.shape;
    if (!shape || shape === CoinShape.UNKNOWN || shape === CoinShape.CIRCULAR) {
      const geo = new THREE.CylinderGeometry(radius, radius, thickness, segments);
      geo.rotateX(Math.PI / 2);
      return geo;
    }

    let threeShape: THREE.Shape;

    switch (shape) {
      case CoinShape.SQUARE:
        threeShape = this.createPerfectPolygon(4, radius);
        break;
      case CoinShape.PENTAGON:
        threeShape = this.createPerfectPolygon(5, radius);
        break;
      case CoinShape.HEXAGON:
        threeShape = this.createPerfectPolygon(6, radius);
        break;
      case CoinShape.HEPTAGON:
        threeShape = this.createPerfectPolygon(7, radius);
        break;
      case CoinShape.OCTAGON:
        threeShape = this.createPerfectPolygon(8, radius);
        break;
      case CoinShape.DODECAGON:
        threeShape = this.createPerfectPolygon(12, radius);
        break;
      default:
        const geo = new THREE.CylinderGeometry(radius, radius, thickness, segments);
        geo.rotateX(Math.PI / 2);
        return geo;
    }

    const extrudeSettings = { depth: thickness, bevelEnabled: false };
    const geo = new THREE.ExtrudeGeometry(threeShape, extrudeSettings);
    geo.translate(0, 0, -thickness / 2);
    return geo;
  }

  private fixPolygonUVs(geometry: THREE.BufferGeometry, radius: number): void {
    const positions = geometry.attributes['position'];
    const uvs = new Float32Array(positions.count * 2);
    const textureScale = 1.0;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const u = (x / radius) * (0.5 / textureScale) + 0.5;
      const v = (y / radius) * (0.5 / textureScale) + 0.5;
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
    }

    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  }

  private createCoinFaceGeometry(radius: number, segments: number): THREE.BufferGeometry {
    const shape = this.coin?.shape;
    if (!shape || shape === CoinShape.UNKNOWN || shape === CoinShape.CIRCULAR) {
      return new THREE.CircleGeometry(radius, segments);
    }

    let threeShape: THREE.Shape;
    let geometry: THREE.BufferGeometry;

    switch (shape) {
      case CoinShape.SQUARE:
        threeShape = this.createPerfectPolygon(4, radius);
        break;
      case CoinShape.PENTAGON:
        threeShape = this.createPerfectPolygon(5, radius);
        break;
      case CoinShape.HEXAGON:
        threeShape = this.createPerfectPolygon(6, radius);
        break;
      case CoinShape.HEPTAGON:
        threeShape = this.createPerfectPolygon(7, radius);
        break;
      case CoinShape.OCTAGON:
        threeShape = this.createPerfectPolygon(8, radius);
        break;
      case CoinShape.DODECAGON:
        threeShape = this.createPerfectPolygon(12, radius);
        break;
      default:
        return new THREE.CircleGeometry(radius, segments);
    }

    geometry = new THREE.ShapeGeometry(threeShape, Math.max(segments / 4, 8));
    this.fixPolygonUVs(geometry, radius);
    return geometry;
  }

  private getMetalColor(): number {
    if (this.metalType === MetalType.GOLD) {
      return 0xE8D8B0;
    }
    return 0xFFFFFF;
  }

  private createCoinMaterial(baseTexture: THREE.Texture | null): THREE.MeshStandardMaterial {
    const baseColor = this.getMetalColor();
    return new THREE.MeshStandardMaterial({
      map: baseTexture,
      color: baseColor,
      metalness: 0.95,
      roughness: 0.3
    });
  }

  private createEdgeMaterial(): THREE.MeshStandardMaterial {
    const baseColor = this.getMetalColor();
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      metalness: 0.99,
      roughness: 0.2
    });
  }

  private updateSceneBackground(): void {
    if (!this.scene) return;
    this.scene.background = null;
  }

  private addEventListeners(): void {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.targetRot.y += (e.clientX - this.prevMouse.x) * 0.01;
      this.targetRot.x += (e.clientY - this.prevMouse.y) * 0.01;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mouseup', () => this.isDragging = false);
    canvas.addEventListener('mouseleave', () => this.isDragging = false);

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camera.position.z = Math.max(2, Math.min(8, this.camera.position.z + e.deltaY * 0.005));
    }, { passive: false });
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    if (!this.coinGroup || !this.renderer || !this.scene || !this.camera) {
      return;
    }

    if (this.currentAutoRotate && !this.isDragging) {
      this.targetRot.y += this.size === 'small' ? 0.008 : 0.004;
    }

    this.coinGroup.rotation.y += (this.targetRot.y - this.coinGroup.rotation.y) * 0.08;
    this.coinGroup.rotation.x += (this.targetRot.x - this.coinGroup.rotation.x) * 0.08;

    // Animate particles
    if (this.particles) {
      const positions = this.particles.geometry.attributes['position'].array as Float32Array;
      const radius = this.size === 'small' ? 2 : 2.5;

      for (let i = 0; i < this.particleVelocities.length; i++) {
        positions[i * 3] += this.particleVelocities[i].x;
        positions[i * 3 + 1] += this.particleVelocities[i].y;
        positions[i * 3 + 2] += this.particleVelocities[i].z;

        if (positions[i * 3 + 2] > -0.1) {
          positions[i * 3 + 2] = -0.1;
          this.particleVelocities[i].z = -Math.abs(this.particleVelocities[i].z);
        }

        const distance = Math.sqrt(
          positions[i * 3] ** 2 +
          positions[i * 3 + 1] ** 2 +
          positions[i * 3 + 2] ** 2
        );

        if (distance > radius || distance < radius * 0.5) {
          this.particleVelocities[i].multiplyScalar(-1);
        }
      }

      this.particles.geometry.attributes['position'].needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  };

  toggleRotation(): void {
    this.currentAutoRotate = !this.currentAutoRotate;
  }

  flipCoin(): void {
    const start = this.coinGroup.rotation.x;
    const startTime = performance.now();

    const animateFlip = (time: number) => {
      const progress = Math.min((time - startTime) / 800, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      this.coinGroup.rotation.x = start + Math.PI * ease;
      this.targetRot.x = this.coinGroup.rotation.x;
      if (progress < 1) {
        requestAnimationFrame(animateFlip);
      }
    };

    requestAnimationFrame(animateFlip);
  }

  resetView(): void {
    this.targetRot = { x: 0, y: 0 };
    this.coinGroup.rotation.set(0, 0, 0);
    this.camera.position.z = this.size === 'small' ? 3.5 : 4.5;
  }
}
