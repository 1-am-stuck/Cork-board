'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { Pin } from './Pin';

interface CanvasProps {
  onContextMenu?: (e: React.MouseEvent, position: { x: number; y: number }) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ onContextMenu }) => {
  const {
    pins,
    zoom,
    panX,
    panY,
    setZoom,
    setPan,
    selectPin,
    selectedPinId,
  } = useBoardStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Handle keyboard events for space panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        setSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle mouse wheel for zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.min(Math.max(zoom + delta, 0.25), 3);
        
        // Zoom toward mouse position
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          
          const zoomRatio = newZoom / zoom;
          const newPanX = mouseX - (mouseX - panX) * zoomRatio;
          const newPanY = mouseY - (mouseY - panY) * zoomRatio;
          
          setZoom(newZoom);
          setPan(newPanX, newPanY);
        }
      }
    },
    [zoom, panX, panY, setZoom, setPan]
  );

  // Handle pan start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Right click for context menu
      if (e.button === 2) {
        return;
      }

      // Middle mouse button or space + left click for panning
      if (e.button === 1 || (e.button === 0 && spacePressed)) {
        e.preventDefault();
        setIsPanning(true);
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          panX,
          panY,
        };
        return;
      }

      // Left click on canvas (not on pin) to deselect
      if (e.button === 0 && e.target === canvasRef.current?.querySelector('.canvas-content')) {
        selectPin(null);
      }
    },
    [spacePressed, panX, panY, selectPin]
  );

  // Handle mouse move for panning
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        setPan(panStartRef.current.panX + dx, panStartRef.current.panY + dy);
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, setPan]);

  // Handle right click for context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      
      if (canvasRef.current && onContextMenu) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - panX) / zoom;
        const y = (e.clientY - rect.top - panY) / zoom;
        onContextMenu(e, { x, y });
      }
    },
    [zoom, panX, panY, onContextMenu]
  );

  // Handle double click to add a note
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-content')) {
        if (canvasRef.current && onContextMenu) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - panX) / zoom;
          const y = (e.clientY - rect.top - panY) / zoom;
          onContextMenu(e, { x, y });
        }
      }
    },
    [zoom, panX, panY, onContextMenu]
  );

  return (
    <div
      ref={canvasRef}
      className={`absolute inset-0 overflow-hidden cork-texture ${
        isPanning || spacePressed ? 'cursor-grabbing' : 'cursor-default'
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
    >
      {/* Grid pattern for visual reference */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(139, 101, 80, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 101, 80, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: `${50 * zoom}px ${50 * zoom}px`,
          backgroundPosition: `${panX}px ${panY}px`,
        }}
      />

      {/* Canvas content with transform */}
      <div
        className="canvas-content absolute"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: '10000px',
          height: '10000px',
        }}
      >
        {pins.map((pin) => (
          <Pin key={pin.id} pin={pin} zoom={zoom} />
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 glass-panel rounded-lg px-3 py-2 text-sm text-gray-600 font-medium">
        {Math.round(zoom * 100)}%
      </div>

      {/* Help text */}
      {pins.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-30">📌</div>
            <h2 className="text-2xl font-display text-amber-900/60 mb-2">
              Your Cork Board is Empty
            </h2>
            <p className="text-amber-800/50 max-w-md">
              Right-click or double-click anywhere to create a pin, or use the toolbar above to add notes, images, and checklists.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;

