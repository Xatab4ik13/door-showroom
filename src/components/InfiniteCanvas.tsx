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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startOffset, setStartOffset] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0, t: 0 });
  const animRef = useRef<number>(0);
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [hasDragged, setHasDragged] = useState(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    setHasDragged(false);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartOffset({ ...offset });
    setVelocity({ x: 0, y: 0 });
    setLastMouse({ x: e.clientX, y: e.clientY, t: Date.now() });
    cancelAnimationFrame(animRef.current);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [offset]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) setHasDragged(true);

    const now = Date.now();
    const dt = Math.max(now - lastMouse.t, 1);
    setVelocity({
      x: (e.clientX - lastMouse.x) / dt * 16,
      y: (e.clientY - lastMouse.y) / dt * 16,
    });
    setLastMouse({ x: e.clientX, y: e.clientY, t: now });

    setOffset({
      x: startOffset.x + dx,
      y: startOffset.y + dy,
    });
  }, [dragging, dragStart, startOffset, lastMouse]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    // Inertia
    const v = { ...velocity };
    const decay = () => {
      v.x *= 0.95;
      v.y *= 0.95;
      if (Math.abs(v.x) < 0.3 && Math.abs(v.y) < 0.3) return;
      setOffset(prev => ({ x: prev.x + v.x, y: prev.y + v.y }));
      animRef.current = requestAnimationFrame(decay);
    };
    animRef.current = requestAnimationFrame(decay);
  }, [velocity]);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Calculate how many tiles to render to fill the viewport + buffer
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;

  // Normalized offset within one tile
  const modX = ((offset.x % TILE_W) + TILE_W) % TILE_W;
  const modY = ((offset.y % TILE_H) + TILE_H) % TILE_H;

  // How many tiles needed horizontally and vertically
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
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          style={{
            transform: `translate(${modX - TILE_W}px, ${modY - TILE_H}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {tiles.map(({ tx, ty }) => (
            <div
              key={`${tx}-${ty}`}
              style={{
                position: 'absolute',
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
                    className="w-full h-full overflow-hidden flex items-center justify-center relative cursor-pointer"
                    onClick={() => {
                      if (!hasDragged) setSelectedDoor(door);
                    }}
                  >
                    <img
                      src={door.image}
                      alt={door.name}
                      className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-[1.05]"
                      draggable={false}
                    />
                    {/* Hover info */}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-400 flex items-end p-3 pointer-events-none">
                      <div className="translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                        <p className="text-xs font-medium text-card drop-shadow-md">{door.name}</p>
                        <p className="text-[10px] text-card/80 drop-shadow-md">{door.collection}</p>
                      </div>
                    </div>
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
