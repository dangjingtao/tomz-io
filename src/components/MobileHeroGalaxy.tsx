import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { SitemapGalaxyData } from "./SitemapGalaxy";

const palette = [
  0xcc785c, 0xe8a55a, 0x5db8a6, 0x6b8fb0, 0x9b8bc4,
  0xc9738f, 0xd4b16a, 0xa9583e, 0x7fae8f,
];

function fibonacciSphere(
  count: number,
  radius: number,
  center = new THREE.Vector3(),
  verticalScale = 0.72,
) {
  const points: THREE.Vector3[] = [];
  const offset = 2 / Math.max(count, 1);
  const increment = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < count; index += 1) {
    const y = index * offset - 1 + offset / 2;
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = index * increment;
    points.push(
      new THREE.Vector3(
        Math.cos(phi) * radial * radius,
        y * radius * verticalScale,
        Math.sin(phi) * radial * radius,
      ).add(center),
    );
  }

  return points;
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();

  const gradient = context.createRadialGradient(48, 48, 0, 48, 48, 48);
  gradient.addColorStop(0, "rgba(255,255,255,.9)");
  gradient.addColorStop(.35, "rgba(255,255,255,.28)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 96, 96);
  return new THREE.CanvasTexture(canvas);
}

export function MobileHeroGalaxy({
  data,
  theme = "dark",
}: {
  data: SitemapGalaxyData;
  theme?: "dark" | "light";
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
    camera.position.set(1.5, 3.2, 22);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const galaxy = new THREE.Group();
    galaxy.position.set(3.5, 0.4, 0);
    galaxy.rotation.x = -0.08;
    scene.add(galaxy);

    const ringColor = theme === "light" ? 0x141413 : 0xfaf9f5;
    const lineColor = theme === "light" ? 0x4d4a45 : 0xe8e0d2;
    const rootColor = theme === "light" ? 0x141413 : 0xffffff;

    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];

    [6, 10, 14, 18].forEach((radius) => {
      const curve = new THREE.EllipseCurve(
        0,
        0,
        radius,
        radius * 0.72,
        0,
        Math.PI * 2,
        false,
        0,
      );
      const geometry = new THREE.BufferGeometry().setFromPoints(
        curve
          .getPoints(96)
          .map((point) => new THREE.Vector3(point.x, 0, point.y)),
      );
      const material = new THREE.LineBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: theme === "light" ? 0.055 : 0.045,
      });
      const ring = new THREE.LineLoop(geometry, material);
      ring.rotation.x = 0.15;
      galaxy.add(ring);
      disposableGeometries.push(geometry);
      disposableMaterials.push(material);
    });

    const rootPosition = new THREE.Vector3();
    const sectionPositions = fibonacciSphere(data.sections.length, 7.5);
    const linePositions: number[] = [];
    const glowTexture = makeGlowTexture();
    const animatedNodes: Array<{ mesh: THREE.Mesh; glow: THREE.Sprite; phase: number }> = [];

    const addLine = (from: THREE.Vector3, to: THREE.Vector3) => {
      linePositions.push(from.x, from.y, from.z, to.x, to.y, to.z);
    };

    const addNode = (
      position: THREE.Vector3,
      color: number,
      radius: number,
      glowOpacity: number,
      phase: number,
    ) => {
      const geometry = new THREE.SphereGeometry(radius, 12, 12);
      const material = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      galaxy.add(mesh);
      disposableGeometries.push(geometry);
      disposableMaterials.push(material);

      const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color,
        transparent: true,
        opacity: glowOpacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Sprite(glowMaterial);
      const glowSize = radius * 8;
      glow.scale.set(glowSize, glowSize, 1);
      glow.position.copy(position);
      galaxy.add(glow);
      disposableMaterials.push(glowMaterial);
      animatedNodes.push({ mesh, glow, phase });
    };

    addNode(rootPosition, rootColor, 0.24, 0.5, 0);

    data.sections.forEach((section, sectionIndex) => {
      const sectionPosition = sectionPositions[sectionIndex];
      const color = palette[sectionIndex % palette.length];
      addLine(rootPosition, sectionPosition);
      addNode(sectionPosition, color, 0.18, 0.48, sectionIndex * 0.7);

      const docPositions = fibonacciSphere(
        Math.max(section.docs.length, 1),
        1.6 + Math.min(section.docs.length * 0.09, 1.6),
        sectionPosition,
      );

      section.docs.forEach((_, docIndex) => {
        const position = docPositions[docIndex];
        addLine(sectionPosition, position);
        addNode(position, color, 0.075, 0.25, sectionIndex + docIndex * 0.23);
      });
    });

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3),
    );
    const lineMaterial = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: theme === "light" ? 0.13 : 0.18,
    });
    galaxy.add(new THREE.LineSegments(lineGeometry, lineMaterial));
    disposableGeometries.push(lineGeometry);
    disposableMaterials.push(lineMaterial);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    const clock = new THREE.Clock();

    const render = () => {
      const elapsed = clock.elapsedTime;
      animatedNodes.forEach(({ mesh, glow, phase }) => {
        const pulse = 1 + Math.sin(elapsed * 0.75 + phase) * 0.07;
        mesh.scale.setScalar(pulse);
        glow.material.opacity *= 0.9998;
      });
      renderer.render(scene, camera);
    };

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      clock.getDelta();
      galaxy.rotation.y += 0.00055;
      render();
    };

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height, false);
      render();
    };

    resize();
    if (!reducedMotion) animate();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrame);
      disposableGeometries.forEach((geometry) => geometry.dispose());
      disposableMaterials.forEach((material) => material.dispose());
      glowTexture.dispose();
      renderer.dispose();
    };
  }, [data.sections, theme]);

  return (
    <div ref={stageRef} className="mobile-hero-galaxy" aria-hidden="true">
      <canvas ref={canvasRef} className="mobile-hero-galaxy-canvas" />
    </div>
  );
}
