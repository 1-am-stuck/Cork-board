'use client';

import React, { useState, useRef } from 'react';
import { useBoardStore } from '@/store/boardStore';

interface ToolbarProps {
  onAddPin: (type: 'text' | 'image' | 'list', imageData?: { url: string; width: number; height: number }) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAddPin }) => {
  const {
    zoom,
    setZoom,
    resetView,
    undo,
    redo,
    canUndo,
    canRedo,
    clearBoard,
    pins,
  } = useBoardStore();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          onAddPin('image', {
            url: event.target?.result as string,
            width: Math.min(img.width, 400),
            height: Math.min(img.height, 400),
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-xl px-4 py-3 flex items-center gap-3">
      {/* Add pin buttons */}
      <div className="flex items-center gap-2">
        <button
          className="btn btn-primary"
          onClick={() => onAddPin('text')}
          title="Add text note"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Note
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          title="Add image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Image
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => onAddPin('list')}
          title="Add checklist"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          List
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-amber-200" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          className={`btn btn-icon btn-ghost ${!canUndo() ? 'opacity-40 cursor-not-allowed' : ''}`}
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        <button
          className={`btn btn-icon btn-ghost ${!canRedo() ? 'opacity-40 cursor-not-allowed' : ''}`}
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-amber-200" />

      {/* Zoom controls */}
      <div className="flex items-center gap-2">
        <button
          className="btn btn-icon btn-ghost"
          onClick={() => setZoom(zoom - 0.25)}
          disabled={zoom <= 0.25}
          title="Zoom out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>

        <span className="text-sm font-medium text-gray-600 min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          className="btn btn-icon btn-ghost"
          onClick={() => setZoom(zoom + 0.25)}
          disabled={zoom >= 3}
          title="Zoom in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>

        <button
          className="btn btn-icon btn-ghost"
          onClick={resetView}
          title="Reset view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-amber-200" />

      {/* Pin count */}
      <div className="text-sm text-gray-500">
        <span className="font-semibold text-amber-700">{pins.length}</span> pins
      </div>

      {/* Clear board */}
      {pins.length > 0 && (
        <>
          <div className="w-px h-8 bg-amber-200" />
          
          {showClearConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">Clear all?</span>
              <button
                className="btn btn-icon text-red-600 hover:bg-red-100"
                onClick={() => {
                  clearBoard();
                  setShowClearConfirm(false);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                className="btn btn-icon text-gray-500 hover:bg-gray-100"
                onClick={() => setShowClearConfirm(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              className="btn btn-icon btn-ghost text-gray-500 hover:text-red-500"
              onClick={() => setShowClearConfirm(true)}
              title="Clear board"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Toolbar;

