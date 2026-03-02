import { useRef, useState, useCallback, useEffect } from 'react';
import { doors, type Door } from '@/data/doors';
import DoorPreviewModal from './DoorPreviewModal';

const COLS = 6;
const ROWS = 4;
const CELL_W = 242;
const CELL_H = 418;
const GAP = 14;
const TILE_W = COLS * (CELL_W + GAP);
const TILE_H = ROWS * (CELL_H + GAP);

// Build a tile of doors arranged in grid
const tileDoors = (() => {
  const arr: { door: Door; col: number; row: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = (r * COLS + c) % doors.length;
      arr.push({ door: doors[idx], col: c, row: r });
    }
  }
  return arr;
})();

const InfiniteCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const [, forceRender] = useState(0);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0, t: 0 });
  const animRef = useRef<number>(0);
  const hasDraggedRef = useRef(false);
  const rafPending = useRef(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [cursorGrabbing, setCursorGrabbing] = useState(false);

  const applyTransform = useCallback(() => {
    if (!innerRef.current) return;
    const o = offsetRef.current;
    const modX = ((o.x % TILE_W) + TILE_W) % TILE_W;
    const modY = ((o.y % TILE_H) + TILE_H) % TILE_H;
    innerRef.current.style.transform = `translate(${modX - TILE_W}px, ${modY - TILE_H}px)`;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    hasDraggedRef.current = false;
    setCursorGrabbing(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    startOffsetRef.current = { ...offsetRef.current };
    velocityRef.current = { x: 0, y: 0 };
    lastMouseRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    cancelAnimationFrame(animRef.current);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDraggedRef.current = true;

    const now = Date.now();
    const dt = Math.max(now - lastMouseRef.current.t, 1);
    velocityRef.current = {
      x: (e.clientX - lastMouseRef.current.x) / dt * 16,
      y: (e.clientY - lastMouseRef.current.y) / dt * 16,
    };
    lastMouseRef.current = { x: e.clientX, y: e.clientY, t: now };

    offsetRef.current = {
      x: startOffsetRef.current.x + dx,
      y: startOffsetRef.current.y + dy,
    };

    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(() => {
        rafPending.current = false;
        applyTransform();
      });
    }
  }, [applyTransform]);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
    setCursorGrabbing(false);
    const v = { ...velocityRef.current };
    const decay = () => {
      v.x *= 0.95;
      v.y *= 0.95;
      if (Math.abs(v.x) < 0.3 && Math.abs(v.y) < 0.3) return;
      offsetRef.current = {
        x: offsetRef.current.x + v.x,
        y: offsetRef.current.y + v.y,
      };
      applyTransform();
      animRef.current = requestAnimationFrame(decay);
    };
    animRef.current = requestAnimationFrame(decay);
  }, [applyTransform]);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Initial render: set tiles count based on viewport
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const tilesX = Math.ceil(vw / TILE_W) + 2;
  const tilesY = Math.ceil(vh / TILE_H) + 2;

  const tiles: { tx: number; ty: number }[] = [];
  for (let ty = -1; ty < tilesY; ty++) {
    for (let tx = -1; tx < tilesX; tx++) {
      tiles.push({ tx, ty });
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 overflow-hidden select-none"
        style={{ cursor: cursorGrabbing ? 'grabbing' : 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={innerRef}
          className="absolute top-0 left-0 will-change-transform"
        >
          {tiles.map(({ tx, ty }) => (
            <div
              key={`${tx}-${ty}`}
              className="absolute"
              style={{
                left: tx * TILE_W,
                top: ty * TILE_H,
                width: TILE_W,
                height: TILE_H,
              }}
            >
              {tileDoors.map(({ door, col, row }, i) => (
                <div
                  key={i}
                  className="absolute group"
                  style={{
                    left: col * (CELL_W + GAP),
                    top: row * (CELL_H + GAP),
                    width: CELL_W,
                    height: CELL_H,
                  }}
                >
                  <div
                    className="w-full h-full overflow-hidden flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      if (!hasDraggedRef.current) setSelectedDoor(door);
                    }}
                  >
                    <img
                      src={door.image}
                      alt={door.name}
                      className="h-full w-auto object-contain transition-all duration-700 ease-out group-hover:scale-[1.06] group-hover:brightness-110"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <DoorPreviewModal door={selectedDoor} onClose={() => setSelectedDoor(null)} />
    </>
  );
};

export default InfiniteCanvas;
