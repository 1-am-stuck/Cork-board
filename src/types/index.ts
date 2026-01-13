export type PinType = 'text' | 'image' | 'list';

export interface ListItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Pin {
  id: string;
  type: PinType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  listItems?: ListItem[];
  imageUrl?: string;
  imageMinWidth?: number;
  imageMinHeight?: number;
  color: string;
  tags: string[];
  zIndex: number;
  createdAt: number;
  updatedAt: number;
}

export interface Snapshot {
  id: string;
  name: string;
  pins: Pin[];
  createdAt: number;
}

export interface BoardState {
  pins: Pin[];
  snapshots: Snapshot[];
  history: Pin[][];
  historyIndex: number;
  maxHistory: number;
  zoom: number;
  panX: number;
  panY: number;
  selectedPinId: string | null;
  highestZIndex: number;
}

export interface BoardActions {
  // Pin actions
  addPin: (pin: Omit<Pin, 'id' | 'createdAt' | 'updatedAt' | 'zIndex'>) => void;
  updatePin: (id: string, updates: Partial<Pin>) => void;
  deletePin: (id: string) => void;
  movePin: (id: string, x: number, y: number) => void;
  resizePin: (id: string, width: number, height: number) => void;
  bringToFront: (id: string) => void;
  selectPin: (id: string | null) => void;
  duplicatePin: (id: string) => void;
  
  // List-specific actions
  addListItem: (pinId: string, text: string) => void;
  updateListItem: (pinId: string, itemId: string, updates: Partial<ListItem>) => void;
  deleteListItem: (pinId: string, itemId: string) => void;
  toggleListItem: (pinId: string, itemId: string) => void;
  
  // Tag actions
  addTag: (pinId: string, tag: string) => void;
  removeTag: (pinId: string, tag: string) => void;
  
  // Zoom/Pan
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Snapshots
  saveSnapshot: (name: string) => void;
  loadSnapshot: (id: string) => void;
  deleteSnapshot: (id: string) => void;
  renameSnapshot: (id: string, name: string) => void;
  
  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
  clearBoard: () => void;
}

export type BoardStore = BoardState & BoardActions;

