"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import type { MediaItem, MediaType, MediaStatus } from "@/types/media.types";
import BaseFormModal from "@/components/BaseFormModal";

interface MediaItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MediaItem | null;
  onSuccess: (item: MediaItem, isNew: boolean) => void;
}

export default function MediaItemModal({
  isOpen,
  onClose,
  editingItem,
  onSuccess,
}: MediaItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "movie" as MediaType,
    status: "planned" as MediaStatus,
    platform: "",
    current_episode: 0,
    total_episodes: 0,
    current_season: 0,
    total_seasons: 0,
    episodes_in_season: 0,
    rating: 0,
    notes: "",
    started_at: "",
    completed_at: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      type: "movie",
      status: "planned",
      platform: "",
      current_episode: 0,
      total_episodes: 0,
      current_season: 0,
      total_seasons: 0,
      episodes_in_season: 0,
      rating: 0,
      notes: "",
      started_at: "",
      completed_at: "",
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      setFormData({
        title: editingItem.title,
        type: editingItem.type,
        status: editingItem.status,
        platform: editingItem.platform || "",
        current_episode: editingItem.current_episode || 0,
        total_episodes: editingItem.total_episodes || 0,
        current_season: editingItem.current_season || 0,
        total_seasons: editingItem.total_seasons || 0,
        episodes_in_season: editingItem.episodes_in_season || 0,
        rating: editingItem.rating || 0,
        notes: editingItem.notes || "",
        started_at: editingItem.started_at || "",
        completed_at: editingItem.completed_at || "",
      });
    } else {
      resetForm();
    }
  }, [isOpen, editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        status: formData.status,
        platform: formData.platform || null,
        current_episode: formData.current_episode || null,
        total_episodes: formData.total_episodes || null,
        current_season: formData.current_season || null,
        total_seasons: formData.total_seasons || null,
        episodes_in_season: formData.episodes_in_season || null,
        rating: formData.rating || null,
        notes: formData.notes || null,
        started_at: formData.started_at || null,
        completed_at: formData.completed_at || null,
      };

      const url = editingItem ? `/api/media/${editingItem.id}` : "/api/media";
      const method = editingItem ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save media item");

      const data = await response.json();
      onSuccess(data, !editingItem);
      onClose();
    } catch (error) {
      console.error("Error saving media item:", error);
    } finally {
      setLoading(false);
    }
  };

  const isShowOrAnime = formData.type === "show" || formData.type === "anime";

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? "Edit Media" : "Add Media"}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={editingItem ? "Update" : "Add Media"}
      submitDisabled={!formData.title.trim()}
    >
      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="Enter title"
        />
      </div>

      {/* Type + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as MediaType })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="movie">Movie</option>
            <option value="show">TV Show</option>
            <option value="anime">Anime</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as MediaStatus })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="planned">Planned</option>
            <option value="watching">Watching</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>
      </div>

      {/* Platform */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Platform</label>
        <input
          type="text"
          value={formData.platform}
          onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g., Netflix, Hulu, Crunchyroll"
        />
      </div>

      {/* Season tracking (show/anime only) */}
      {isShowOrAnime && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Current Season</label>
            <input
              type="number"
              min="0"
              value={formData.current_season}
              onChange={(e) =>
                setFormData({ ...formData, current_season: parseInt(e.target.value) || 0 })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Total Seasons</label>
            <input
              type="number"
              min="0"
              value={formData.total_seasons}
              onChange={(e) =>
                setFormData({ ...formData, total_seasons: parseInt(e.target.value) || 0 })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Episode tracking */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            {isShowOrAnime ? "Current Episode (in Season)" : "Current Episode"}
          </label>
          <input
            type="number"
            min="0"
            value={formData.current_episode}
            onChange={(e) =>
              setFormData({ ...formData, current_episode: parseInt(e.target.value) || 0 })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            {isShowOrAnime ? "Episodes in Season" : "Total Episodes"}
          </label>
          <input
            type="number"
            min="0"
            value={isShowOrAnime ? formData.episodes_in_season : formData.total_episodes}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              if (isShowOrAnime) {
                setFormData({ ...formData, episodes_in_season: val });
              } else {
                setFormData({ ...formData, total_episodes: val });
              }
            }}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Total Episodes (show/anime only, separate field) */}
      {isShowOrAnime && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Total Episodes</label>
          <input
            type="number"
            min="0"
            value={formData.total_episodes}
            onChange={(e) =>
              setFormData({ ...formData, total_episodes: parseInt(e.target.value) || 0 })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: formData.rating === star ? 0 : star })}
              className="transition-colors"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= formData.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-600"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Notes</label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="Any notes..."
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Started At</label>
          <input
            type="date"
            value={formData.started_at}
            onChange={(e) => setFormData({ ...formData, started_at: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Completed At</label>
          <input
            type="date"
            value={formData.completed_at}
            onChange={(e) => setFormData({ ...formData, completed_at: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </BaseFormModal>
  );
}
