"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Home } from "lucide-react";
import AreaModal from "../modals/AreaModal";
import type { HomeArea } from "@/types/house.types";

interface AreasTabProps {
  areas: HomeArea[];
  propertyId: string | null;
  onRefresh: () => void;
}

export default function AreasTab({ areas, propertyId, onRefresh }: AreasTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState<HomeArea | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this area?")) return;

    try {
      const response = await fetch(`/api/house/areas/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      onRefresh();
    } catch (error) {
      console.error("Error deleting area:", error);
    }
  };

  const areaTypes = [
    "bedroom",
    "bathroom",
    "kitchen",
    "living_room",
    "dining_room",
    "office",
    "garage",
    "basement",
    "attic",
    "laundry",
    "closet",
    "hallway",
    "patio",
    "deck",
    "yard",
    "other",
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Areas & Rooms</h2>
        <button
          onClick={() => {
            setEditingArea(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Area
        </button>
      </div>

      {areas.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
          <p className="text-gray-500">No areas added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <div
              key={area.id}
              className="rounded-lg border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-gray-700"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <Home className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{area.name}</h3>
                    {area.type && (
                      <p className="text-sm text-gray-400 capitalize">
                        {area.type.replace("_", " ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingArea(area);
                      setShowModal(true);
                    }}
                    className="p-1 text-gray-400 transition-colors hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(area.id)}
                    className="p-1 text-gray-400 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {area.notes && <div className="text-sm text-gray-500">{area.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AreaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingArea={editingArea}
        propertyId={propertyId}
        onSuccess={onRefresh}
      />
    </div>
  );
}
