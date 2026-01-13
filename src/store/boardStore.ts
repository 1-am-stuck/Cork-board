import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { BoardStore, Pin, Snapshot, ListItem } from '@/types';

const STORAGE_KEY = 'cork-board-state';
const SNAPSHOTS_KEY = 'cork-board-snapshots';

const PIN_COLORS = [
  '#fef3c7', // amber-100
  '#fce7f3', // pink-100
  '#dbeafe', // blue-100
  '#dcfce7', // green-100
  '#f3e8ff', // purple-100
  '#ffedd5', // orange-100
  '#e0e7ff', // indigo-100
  '#fae8ff', // fuchsia-100
];

const getRandomColor = () => PIN_COLORS[Math.floor(Math.random() * PIN_COLORS.length)];

const createInitialState = () => ({
  pins: [] as Pin[],
  snapshots: [] as Snapshot[],
  history: [[]] as Pin[][],
  historyIndex: 0,
  maxHistory: 50,
  zoom: 1,
  panX: 0,
  panY: 0,
  selectedPinId: null as string | null,
  highestZIndex: 0,
});

export const useBoardStore = create<BoardStore>((set, get) => ({
  ...createInitialState(),

  // Helper to save history
  saveHistory: (pins: Pin[]) => {
    const { history, historyIndex, maxHistory } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(pins)));
    
    if (newHistory.length > maxHistory) {
      newHistory.shift();
    }
    
    return {
      history: newHistory,
      historyIndex: newHistory.length - 1,
    };
  },

  addPin: (pinData) => {
    const id = uuidv4();
    const { highestZIndex, pins } = get();
    const newZIndex = highestZIndex + 1;
    
    const newPin: Pin = {
      ...pinData,
      id,
      zIndex: newZIndex,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      color: pinData.color || getRandomColor(),
      tags: pinData.tags || [],
    };
    
    const newPins = [...pins, newPin];
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newPins)));
    
    set({
      pins: newPins,
      highestZIndex: newZIndex,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedPinId: id,
    });
    
    get().saveToStorage();
  },

  updatePin: (id, updates) => {
    const { pins } = get();
    const newPins = pins.map((pin) =>
      pin.id === id
        ? { ...pin, ...updates, updatedAt: Date.now() }
        : pin
    );
    
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newPins)));
    
    set({
      pins: newPins,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
    
    get().saveToStorage();
  },

  deletePin: (id) => {
    const { pins, selectedPinId } = get();
    const newPins = pins.filter((pin) => pin.id !== id);
    
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newPins)));
    
    set({
      pins: newPins,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedPinId: selectedPinId === id ? null : selectedPinId,
    });
    
    get().saveToStorage();
  },

  movePin: (id, x, y) => {
    const { pins } = get();
    const newPins = pins.map((pin) =>
      pin.id === id ? { ...pin, x, y, updatedAt: Date.now() } : pin
    );
    
    set({ pins: newPins });
    get().saveToStorage();
  },

  resizePin: (id, width, height) => {
    const { pins } = get();
    const pin = pins.find((p) => p.id === id);
    
    if (pin) {
      const minWidth = pin.imageMinWidth || 150;
      const minHeight = pin.imageMinHeight || 100;
      
      const newWidth = Math.max(width, minWidth);
      const newHeight = Math.max(height, minHeight);
      
      const newPins = pins.map((p) =>
        p.id === id
          ? { ...p, width: newWidth, height: newHeight, updatedAt: Date.now() }
          : p
      );
      
      set({ pins: newPins });
      get().saveToStorage();
    }
  },

  bringToFront: (id) => {
    const { pins, highestZIndex } = get();
    const newZIndex = highestZIndex + 1;
    
    const newPins = pins.map((pin) =>
      pin.id === id ? { ...pin, zIndex: newZIndex } : pin
    );
    
    set({ pins: newPins, highestZIndex: newZIndex });
    get().saveToStorage();
  },

  selectPin: (id) => {
    set({ selectedPinId: id });
    if (id) {
      get().bringToFront(id);
    }
  },

  duplicatePin: (id) => {
    const { pins } = get();
    const pin = pins.find((p) => p.id === id);
    
    if (pin) {
      get().addPin({
        ...pin,
        x: pin.x + 30,
        y: pin.y + 30,
      });
    }
  },

  // List-specific actions
  addListItem: (pinId, text) => {
    const { pins } = get();
    const newItem: ListItem = {
      id: uuidv4(),
      text,
      completed: false,
    };
    
    const newPins = pins.map((pin) =>
      pin.id === pinId
        ? {
            ...pin,
            listItems: [...(pin.listItems || []), newItem],
            updatedAt: Date.now(),
          }
        : pin
    );
    
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newPins)));
    
    set({
      pins: newPins,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
    
    get().saveToStorage();
  },

  updateListItem: (pinId, itemId, updates) => {
    const { pins } = get();
    const newPins = pins.map((pin) =>
      pin.id === pinId
        ? {
            ...pin,
            listItems: pin.listItems?.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
            updatedAt: Date.now(),
          }
        : pin
    );
    
    set({ pins: newPins });
    get().saveToStorage();
  },

  deleteListItem: (pinId, itemId) => {
    const { pins } = get();
    const newPins = pins.map((pin) =>
      pin.id === pinId
        ? {
            ...pin,
            listItems: pin.listItems?.filter((item) => item.id !== itemId),
            updatedAt: Date.now(),
          }
        : pin
    );
    
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newPins)));
    
    set({
      pins: newPins,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
    
    get().saveToStorage();
  },

  toggleListItem: (pinId, itemId) => {
    const { pins } = get();
    const newPins = pins.map((pin) =>
      pin.id === pinId
        ? {
            ...pin,
            listItems: pin.listItems?.map((item) =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
            updatedAt: Date.now(),
          }
        : pin
    );
    
    set({ pins: newPins });
    get().saveToStorage();
  },

  // Tag actions
  addTag: (pinId, tag) => {
    const { pins } = get();
    const newPins = pins.map((pin) =>
      pin.id === pinId && !pin.tags.includes(tag)
        ? { ...pin, tags: [...pin.tags, tag], updatedAt: Date.now() }
        : pin
    );
    
    set({ pins: newPins });
    get().saveToStorage();
  },

  removeTag: (pinId, tag) => {
    const { pins } = get();
    const newPins = pins.map((pin) =>
      pin.id === pinId
        ? { ...pin, tags: pin.tags.filter((t) => t !== tag), updatedAt: Date.now() }
        : pin
    );
    
    set({ pins: newPins });
    get().saveToStorage();
  },

  // Zoom/Pan
  setZoom: (zoom) => {
    const clampedZoom = Math.min(Math.max(zoom, 0.25), 3);
    set({ zoom: clampedZoom });
    get().saveToStorage();
  },

  setPan: (x, y) => {
    set({ panX: x, panY: y });
    get().saveToStorage();
  },

  resetView: () => {
    set({ zoom: 1, panX: 0, panY: 0 });
    get().saveToStorage();
  },

  // History
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousPins = JSON.parse(JSON.stringify(history[newIndex]));
      set({ pins: previousPins, historyIndex: newIndex, selectedPinId: null });
      get().saveToStorage();
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextPins = JSON.parse(JSON.stringify(history[newIndex]));
      set({ pins: nextPins, historyIndex: newIndex, selectedPinId: null });
      get().saveToStorage();
    }
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  // Snapshots
  saveSnapshot: (name) => {
    const { pins, snapshots } = get();
    const newSnapshot: Snapshot = {
      id: uuidv4(),
      name,
      pins: JSON.parse(JSON.stringify(pins)),
      createdAt: Date.now(),
    };
    
    const newSnapshots = [...snapshots, newSnapshot];
    set({ snapshots: newSnapshots });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(newSnapshots));
    }
  },

  loadSnapshot: (id) => {
    const { snapshots, history, historyIndex } = get();
    const snapshot = snapshots.find((s) => s.id === id);
    
    if (snapshot) {
      const restoredPins = JSON.parse(JSON.stringify(snapshot.pins));
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(restoredPins);
      
      const maxZIndex = restoredPins.reduce(
        (max: number, pin: Pin) => Math.max(max, pin.zIndex),
        0
      );
      
      set({
        pins: restoredPins,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        highestZIndex: maxZIndex,
        selectedPinId: null,
      });
      
      get().saveToStorage();
    }
  },

  deleteSnapshot: (id) => {
    const { snapshots } = get();
    const newSnapshots = snapshots.filter((s) => s.id !== id);
    set({ snapshots: newSnapshots });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(newSnapshots));
    }
  },

  renameSnapshot: (id, name) => {
    const { snapshots } = get();
    const newSnapshots = snapshots.map((s) =>
      s.id === id ? { ...s, name } : s
    );
    set({ snapshots: newSnapshots });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(newSnapshots));
    }
  },

  // Persistence
  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        const savedSnapshots = localStorage.getItem(SNAPSHOTS_KEY);
        
        if (savedState) {
          const parsed = JSON.parse(savedState);
          const maxZIndex = parsed.pins?.reduce(
            (max: number, pin: Pin) => Math.max(max, pin.zIndex),
            0
          ) || 0;
          
          set({
            pins: parsed.pins || [],
            zoom: parsed.zoom || 1,
            panX: parsed.panX || 0,
            panY: parsed.panY || 0,
            highestZIndex: maxZIndex,
            history: [parsed.pins || []],
            historyIndex: 0,
          });
        }
        
        if (savedSnapshots) {
          set({ snapshots: JSON.parse(savedSnapshots) });
        }
      } catch (e) {
        console.error('Failed to load from storage:', e);
      }
    }
  },

  saveToStorage: () => {
    if (typeof window !== 'undefined') {
      const { pins, zoom, panX, panY } = get();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pins, zoom, panX, panY })
      );
    }
  },

  clearBoard: () => {
    const newState = createInitialState();
    set(newState);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
}));

