import "./emergence-life.css";

const selector = "[data-emergence-life-game]";
const mounted = new Map<HTMLElement, () => void>();

function readColor(root: HTMLElement, name: string, fallback: string) {
  return getComputedStyle(root).getPropertyValue(name).trim() || fallback;
}

function mountLifeGame(root: HTMLElement) {
  if (mounted.has(root)) return;

  const canvasNode = root.querySelector<HTMLCanvasElement>("canvas");
  const generationElement = root.querySelector<HTMLElement>(
    "[data-emergence-life-generation]",
  );
  if (!canvasNode || !generationElement) return;

  const context2d = canvasNode.getContext("2d");
  if (!context2d) return;

  const canvas: HTMLCanvasElement = canvasNode;
  const generationNode: HTMLElement = generationElement;
  const context: CanvasRenderingContext2D = context2d;
  const cols = Number(root.dataset.cols || 36);
  const rows = Number(root.dataset.rows || 20);
  const stepMs = 220;
  const index = (x: number, y: number) => y * cols + x;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let world = new Uint8Array(cols * rows);
  let generation = 1;
  let timer: number | undefined;
  let visible = true;
  let disposed = false;
  let pauseUntil = 0;

  function updateGeneration() {
    generationNode.textContent = String(generation).padStart(3, "0");
  }

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const ink = readColor(root, "--ink", "#141413");
    const hairline = readColor(root, "--hairline", "#e6dfd8");

    context.clearRect(0, 0, width, height);
    context.beginPath();
    context.strokeStyle = hairline;
    context.lineWidth = 1;

    for (let x = 1; x < cols; x += 1) {
      const px = Math.round(x * cellWidth) + 0.5;
      context.moveTo(px, 0);
      context.lineTo(px, height);
    }
    for (let y = 1; y < rows; y += 1) {
      const py = Math.round(y * cellHeight) + 0.5;
      context.moveTo(0, py);
      context.lineTo(width, py);
    }
    context.stroke();

    context.fillStyle = ink;
    const inset = Math.max(1, Math.min(cellWidth, cellHeight) * 0.16);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (!world[index(x, y)]) continue;
        context.fillRect(
          x * cellWidth + inset,
          y * cellHeight + inset,
          Math.max(1, cellWidth - inset * 2),
          Math.max(1, cellHeight - inset * 2),
        );
      }
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function seedGlider() {
    world = new Uint8Array(cols * rows);
    generation = 1;
    const originX = 3;
    const originY = 3;
    const glider = [
      [1, 0],
      [2, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ];
    glider.forEach(([dx, dy]) => {
      world[index(originX + dx, originY + dy)] = 1;
    });
    updateGeneration();
    draw();
  }

  function step() {
    const next = new Uint8Array(world.length);
    let living = 0;

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
            neighbors += world[index(nx, ny)];
          }
        }

        const alive = world[index(x, y)] === 1;
        const nextAlive = alive
          ? neighbors === 2 || neighbors === 3
          : neighbors === 3;
        next[index(x, y)] = nextAlive ? 1 : 0;
        living += next[index(x, y)];
      }
    }

    world = next;
    generation += 1;
    updateGeneration();
    draw();

    return living;
  }

  function schedule(delay = stepMs) {
    window.clearTimeout(timer);
    if (disposed || !visible || reducedMotion.matches) return;

    timer = window.setTimeout(() => {
      if (Date.now() < pauseUntil) {
        schedule(Math.max(80, pauseUntil - Date.now()));
        return;
      }

      const living = step();
      if (living === 0 || generation > 96) {
        timer = window.setTimeout(() => {
          if (disposed) return;
          seedGlider();
          schedule();
        }, 1100);
        return;
      }
      schedule();
    }, delay);
  }

  function toggleCell(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * cols);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * rows);
    if (x < 0 || x >= cols || y < 0 || y >= rows) return;

    const cell = index(x, y);
    world[cell] = world[cell] ? 0 : 1;
    pauseUntil = Date.now() + 900;
    draw();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else window.clearTimeout(timer);
    },
    { threshold: 0.1 },
  );
  intersectionObserver.observe(root);

  const themeObserver = new MutationObserver(draw);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });

  const handleReducedMotionChange = () => {
    if (reducedMotion.matches) window.clearTimeout(timer);
    else schedule();
  };

  canvas.addEventListener("pointerdown", toggleCell);
  reducedMotion.addEventListener?.("change", handleReducedMotionChange);

  seedGlider();
  resize();
  schedule();

  mounted.set(root, () => {
    disposed = true;
    window.clearTimeout(timer);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    themeObserver.disconnect();
    canvas.removeEventListener("pointerdown", toggleCell);
    reducedMotion.removeEventListener?.("change", handleReducedMotionChange);
  });
}

function scan() {
  mounted.forEach((cleanup, root) => {
    if (document.contains(root)) return;
    cleanup();
    mounted.delete(root);
  });

  document
    .querySelectorAll<HTMLElement>(selector)
    .forEach((root) => mountLifeGame(root));
}

let scanQueued = false;
function queueScan() {
  if (scanQueued) return;
  scanQueued = true;
  window.requestAnimationFrame(() => {
    scanQueued = false;
    scan();
  });
}

const observer = new MutationObserver(queueScan);
observer.observe(document.documentElement, { childList: true, subtree: true });

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scan, { once: true });
} else {
  scan();
}
