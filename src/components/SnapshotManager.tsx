'use client';

import React, { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';

interface SnapshotManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SnapshotManager: React.FC<SnapshotManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    snapshots,
    saveSnapshot,
    loadSnapshot,
    deleteSnapshot,
    renameSnapshot,
    pins,
  } = useBoardStore();

  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleSaveSnapshot = () => {
    if (newSnapshotName.trim()) {
      saveSnapshot(newSnapshotName.trim());
      setNewSnapshotName('');
    }
  };

  const handleLoadSnapshot = (id: string) => {
    loadSnapshot(id);
    onClose();
  };

  const handleStartRename = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      renameSnapshot(id, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteSnapshot = (id: string) => {
    deleteSnapshot(id);
    setShowDeleteConfirm(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 font-display">
              Board Snapshots
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Save and restore board states
            </p>
          </div>
          <button
            className="btn btn-icon btn-ghost"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Save new snapshot */}
        <div className="p-4 bg-amber-50/50 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Save Current State ({pins.length} pins)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input flex-1"
              placeholder="Snapshot name..."
              value={newSnapshotName}
              onChange={(e) => setNewSnapshotName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveSnapshot()}
            />
            <button
              className="btn btn-primary"
              onClick={handleSaveSnapshot}
              disabled={!newSnapshotName.trim() || pins.length === 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </button>
          </div>
        </div>

        {/* Snapshots list */}
        <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
          {snapshots.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3 opacity-50">📸</div>
              <p className="text-gray-500">No snapshots yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Save your board state to restore it later
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots
                .slice()
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {editingId === snapshot.id ? (
                          <input
                            type="text"
                            className="input text-sm font-medium"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => handleSaveRename(snapshot.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(snapshot.id);
                              if (e.key === 'Escape') {
                                setEditingId(null);
                                setEditingName('');
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <h3 className="font-medium text-gray-800 truncate">
                            {snapshot.name}
                          </h3>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span>{snapshot.pins.length} pins</span>
                          <span>•</span>
                          <span>{formatDate(snapshot.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="btn btn-icon btn-ghost text-gray-500 hover:text-amber-600"
                          onClick={() => handleStartRename(snapshot.id, snapshot.name)}
                          title="Rename"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {showDeleteConfirm === snapshot.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              className="btn btn-icon text-red-600 hover:bg-red-100"
                              onClick={() => handleDeleteSnapshot(snapshot.id)}
                              title="Confirm delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              className="btn btn-icon text-gray-500 hover:bg-gray-100"
                              onClick={() => setShowDeleteConfirm(null)}
                              title="Cancel"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-icon btn-ghost text-gray-500 hover:text-red-500"
                            onClick={() => setShowDeleteConfirm(snapshot.id)}
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary w-full mt-3"
                      onClick={() => handleLoadSnapshot(snapshot.id)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Restore this snapshot
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnapshotManager;

