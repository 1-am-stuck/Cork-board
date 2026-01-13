'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pin as PinType, ListItem } from '@/types';
import { useBoardStore } from '@/store/boardStore';

interface PinProps {
  pin: PinType;
  zoom: number;
}

const PIN_COLORS = [
  { name: 'Cream', value: '#fef3c7' },
  { name: 'Pink', value: '#fce7f3' },
  { name: 'Blue', value: '#dbeafe' },
  { name: 'Green', value: '#dcfce7' },
  { name: 'Purple', value: '#f3e8ff' },
  { name: 'Orange', value: '#ffedd5' },
  { name: 'Indigo', value: '#e0e7ff' },
  { name: 'Fuchsia', value: '#fae8ff' },
];

export const Pin: React.FC<PinProps> = ({ pin, zoom }) => {
  const {
    updatePin,
    deletePin,
    movePin,
    resizePin,
    selectPin,
    bringToFront,
    duplicatePin,
    addListItem,
    toggleListItem,
    deleteListItem,
    updateListItem,
    addTag,
    removeTag,
    selectedPinId,
  } = useBoardStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(pin.content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newListItem, setNewListItem] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

  const pinRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, pinX: 0, pinY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const isSelected = selectedPinId === pin.id;

  // Handle drag start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        (e.target as HTMLElement).closest('.no-drag') ||
        (e.target as HTMLElement).closest('input') ||
        (e.target as HTMLElement).closest('textarea') ||
        (e.target as HTMLElement).closest('button')
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      
      selectPin(pin.id);
      bringToFront(pin.id);
      
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        pinX: pin.x,
        pinY: pin.y,
      };
    },
    [pin.id, pin.x, pin.y, selectPin, bringToFront]
  );

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsResizing(true);
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: pin.width,
        height: pin.height,
      };
    },
    [pin.width, pin.height]
  );

  // Handle mouse move for drag and resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = (e.clientX - dragStartRef.current.x) / zoom;
        const dy = (e.clientY - dragStartRef.current.y) / zoom;
        
        movePin(
          pin.id,
          dragStartRef.current.pinX + dx,
          dragStartRef.current.pinY + dy
        );
      }

      if (isResizing) {
        const dx = (e.clientX - resizeStartRef.current.x) / zoom;
        const dy = (e.clientY - resizeStartRef.current.y) / zoom;
        
        resizePin(
          pin.id,
          resizeStartRef.current.width + dx,
          resizeStartRef.current.height + dy
        );
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Save to history after drag ends
        const store = useBoardStore.getState();
        store.saveToStorage();
      }
      if (isResizing) {
        setIsResizing(false);
        const store = useBoardStore.getState();
        store.saveToStorage();
      }
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, pin.id, zoom, movePin, resizePin]);

  // Handle double click to edit
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (pin.type === 'text') {
      e.stopPropagation();
      setIsEditing(true);
      setEditContent(pin.content);
    }
  }, [pin.type, pin.content]);

  // Save edited content
  const handleSaveEdit = useCallback(() => {
    updatePin(pin.id, { content: editContent });
    setIsEditing(false);
  }, [pin.id, editContent, updatePin]);

  // Handle adding list item
  const handleAddListItem = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && newListItem.trim()) {
        addListItem(pin.id, newListItem.trim());
        setNewListItem('');
      }
    },
    [pin.id, newListItem, addListItem]
  );

  // Handle adding tag
  const handleAddTag = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && newTag.trim()) {
        addTag(pin.id, newTag.trim());
        setNewTag('');
        setShowTagInput(false);
      }
    },
    [pin.id, newTag, addTag]
  );

  // Handle editing list item
  const handleStartEditItem = (item: ListItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
  };

  const handleSaveItemEdit = (itemId: string) => {
    if (editingItemText.trim()) {
      updateListItem(pin.id, itemId, { text: editingItemText.trim() });
    }
    setEditingItemId(null);
    setEditingItemText('');
  };

  // Render content based on pin type
  const renderContent = () => {
    switch (pin.type) {
      case 'text':
        if (isEditing) {
          return (
            <textarea
              className="w-full h-full min-h-[80px] p-2 bg-transparent border-none outline-none resize-none text-gray-800 text-sm no-drag"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditContent(pin.content);
                }
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSaveEdit();
                }
              }}
              autoFocus
              placeholder="Type your note here..."
            />
          );
        }
        return (
          <div
            className="p-3 text-gray-800 text-sm whitespace-pre-wrap break-words min-h-[60px] cursor-text"
            onDoubleClick={handleDoubleClick}
          >
            {pin.content || (
              <span className="text-gray-400 italic">Double-click to edit...</span>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="p-2">
            {pin.imageUrl ? (
              <img
                src={pin.imageUrl}
                alt={pin.content || 'Pin image'}
                className="w-full h-auto rounded object-contain"
                style={{ maxHeight: pin.height - 80 }}
              />
            ) : (
              <div className="flex items-center justify-center h-32 bg-gray-100 rounded text-gray-400 text-sm">
                No image
              </div>
            )}
            {pin.content && (
              <p className="mt-2 text-gray-700 text-sm">{pin.content}</p>
            )}
          </div>
        );

      case 'list':
        return (
          <div className="p-3">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">
              {pin.content || 'Checklist'}
            </h3>
            <ul className="space-y-2">
              {pin.listItems?.map((item) => (
                <li key={item.id} className="flex items-start gap-2 group">
                  <input
                    type="checkbox"
                    className="checkbox mt-0.5 no-drag"
                    checked={item.completed}
                    onChange={() => toggleListItem(pin.id, item.id)}
                  />
                  {editingItemId === item.id ? (
                    <input
                      type="text"
                      className="flex-1 bg-white/50 px-2 py-0.5 rounded text-sm border border-amber-200 outline-none no-drag"
                      value={editingItemText}
                      onChange={(e) => setEditingItemText(e.target.value)}
                      onBlur={() => handleSaveItemEdit(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveItemEdit(item.id);
                        if (e.key === 'Escape') {
                          setEditingItemId(null);
                          setEditingItemText('');
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`flex-1 text-sm cursor-pointer ${
                        item.completed
                          ? 'text-gray-400 line-through'
                          : 'text-gray-700'
                      }`}
                      onDoubleClick={() => handleStartEditItem(item)}
                    >
                      {item.text}
                    </span>
                  )}
                  <button
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs no-drag transition-opacity"
                    onClick={() => deleteListItem(pin.id, item.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <input
                type="text"
                className="w-full bg-white/50 px-2 py-1.5 rounded text-sm border border-dashed border-amber-200 outline-none no-drag placeholder-gray-400"
                placeholder="+ Add item..."
                value={newListItem}
                onChange={(e) => setNewListItem(e.target.value)}
                onKeyDown={handleAddListItem}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={pinRef}
      className={`absolute pin-card rounded-lg overflow-hidden pin-animate-in ${
        isDragging ? 'dragging cursor-grabbing' : 'cursor-grab'
      } ${isSelected ? 'selected' : ''}`}
      style={{
        left: pin.x,
        top: pin.y,
        width: pin.width,
        minHeight: pin.height,
        backgroundColor: pin.color,
        zIndex: pin.zIndex,
        transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Push pin decoration */}
      <div className="push-pin" />

      {/* Pin header */}
      <div className="flex items-center justify-between px-3 pt-4 pb-1">
        <div className="flex items-center gap-1 flex-wrap flex-1 no-drag">
          {pin.tags.map((tag) => (
            <span
              key={tag}
              className="tag cursor-pointer"
              onClick={() => removeTag(pin.id, tag)}
              title="Click to remove"
            >
              {tag}
              <span className="text-xs opacity-60 ml-1">×</span>
            </span>
          ))}
          {showTagInput ? (
            <input
              type="text"
              className="w-20 text-xs px-2 py-0.5 rounded border border-amber-200 outline-none bg-white/80"
              placeholder="Tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              onBlur={() => {
                setShowTagInput(false);
                setNewTag('');
              }}
              autoFocus
            />
          ) : (
            <button
              className="text-xs text-amber-600/60 hover:text-amber-600 px-1 no-drag"
              onClick={() => setShowTagInput(true)}
            >
              + tag
            </button>
          )}
        </div>
        
        {/* Pin actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-drag">
          <button
            className="p-1 text-gray-500 hover:text-amber-600 rounded no-drag relative"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Change color"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            className="p-1 text-gray-500 hover:text-amber-600 rounded no-drag"
            onClick={() => duplicatePin(pin.id)}
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            className="p-1 text-gray-500 hover:text-red-500 rounded no-drag"
            onClick={() => deletePin(pin.id)}
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Color picker dropdown */}
      {showColorPicker && (
        <div className="absolute top-12 right-2 bg-white rounded-lg shadow-lg p-2 z-50 no-drag grid grid-cols-4 gap-1">
          {PIN_COLORS.map((color) => (
            <button
              key={color.value}
              className="w-6 h-6 rounded-full border-2 border-white hover:scale-110 transition-transform"
              style={{ backgroundColor: color.value }}
              onClick={() => {
                updatePin(pin.id, { color: color.value });
                setShowColorPicker(false);
              }}
              title={color.name}
            />
          ))}
        </div>
      )}

      {/* Pin content */}
      {renderContent()}

      {/* Resize handle */}
      <div className="resize-handle no-drag" onMouseDown={handleResizeStart} />
    </div>
  );
};

export default Pin;

