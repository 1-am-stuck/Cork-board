'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { Canvas, Toolbar, SnapshotManager, ContextMenu } from '@/components';

interface ContextMenuState {
  x: number;
  y: number;
  canvasPosition: { x: number; y: number };
}

export default function Home() {
  const { addPin, loadFromStorage, zoom, panX, panY, undo, redo, canUndo, canRedo } = useBoardStore();
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved state on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        if (canRedo()) redo();
      }

      // Open snapshots: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowSnapshots(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // Handle adding pins
  const handleAddPin = useCallback(
    (
      type: 'text' | 'image' | 'list',
      imageData?: { url: string; width: number; height: number },
      position?: { x: number; y: number }
    ) => {
      const defaultPosition = position || {
        x: (window.innerWidth / 2 - panX) / zoom - 100,
        y: (window.innerHeight / 2 - panY) / zoom - 100,
      };

      const pinBase = {
        x: defaultPosition.x,
        y: defaultPosition.y,
        color: '',
        tags: [],
      };

      if (type === 'text') {
        addPin({
          ...pinBase,
          type: 'text',
          width: 250,
          height: 180,
          content: '',
        });
      } else if (type === 'image' && imageData) {
        addPin({
          ...pinBase,
          type: 'image',
          width: Math.max(imageData.width, 200),
          height: Math.max(imageData.height, 150) + 60,
          content: '',
          imageUrl: imageData.url,
          imageMinWidth: imageData.width,
          imageMinHeight: imageData.height + 60,
        });
      } else if (type === 'list') {
        addPin({
          ...pinBase,
          type: 'list',
          width: 250,
          height: 200,
          content: 'New Checklist',
          listItems: [],
        });
      }

      setContextMenu(null);
    },
    [addPin, zoom, panX, panY]
  );

  // Handle image upload from context menu
  const handleImageUploadFromContext = useCallback(() => {
    if (fileInputRef.current && contextMenu) {
      const position = contextMenu.canvasPosition;
      fileInputRef.current.onclick = null;
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              handleAddPin(
                'image',
                {
                  url: event.target?.result as string,
                  width: Math.min(img.width, 400),
                  height: Math.min(img.height, 400),
                },
                position
              );
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      fileInputRef.current.click();
    }
  }, [contextMenu, handleAddPin]);

  // Handle context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, position: { x: number; y: number }) => {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        canvasPosition: position,
      });
    },
    []
  );

  // Context menu items
  const contextMenuItems = contextMenu
    ? [
        {
          label: 'Add Note',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          ),
          onClick: () => handleAddPin('text', undefined, contextMenu.canvasPosition),
        },
        {
          label: 'Add Image',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
          onClick: handleImageUploadFromContext,
        },
        {
          label: 'Add Checklist',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          ),
          onClick: () => handleAddPin('list', undefined, contextMenu.canvasPosition),
        },
      ]
    : [];

  return (
    <main className="h-screen w-screen overflow-hidden relative">
      {/* Toolbar */}
      <Toolbar
        onAddPin={(type, imageData) => handleAddPin(type, imageData)}
      />

      {/* Sidebar toggle for snapshots */}
      <button
        className="absolute top-4 right-4 z-50 glass-panel rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-amber-700 transition-colors"
        onClick={() => setShowSnapshots(true)}
        title="Manage snapshots (Ctrl+S)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        Snapshots
      </button>

      {/* Canvas */}
      <Canvas onContextMenu={handleContextMenu} />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Snapshot Manager Modal */}
      <SnapshotManager
        isOpen={showSnapshots}
        onClose={() => setShowSnapshots(false)}
      />

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />

      {/* Keyboard shortcuts help */}
      <div className="absolute bottom-4 right-4 glass-panel rounded-lg px-4 py-3 text-xs text-gray-500 space-y-1">
        <div className="font-semibold text-gray-600 mb-2">Shortcuts</div>
        <div className="flex justify-between gap-4">
          <span>Undo</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Ctrl+Z</kbd>
        </div>
        <div className="flex justify-between gap-4">
          <span>Redo</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Ctrl+Y</kbd>
        </div>
        <div className="flex justify-between gap-4">
          <span>Zoom</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Ctrl+Scroll</kbd>
        </div>
        <div className="flex justify-between gap-4">
          <span>Pan</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Space+Drag</kbd>
        </div>
      </div>
    </main>
  );
}

