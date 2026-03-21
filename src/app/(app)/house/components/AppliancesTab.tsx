"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import ApplianceModal from "../modals/ApplianceModal";
import type { HomeAppliance, HomeArea } from "@/types/house.types";

interface AppliancesTabProps {
  appliances: HomeAppliance[];
  areas: HomeArea[];
  propertyId: string | null;
  onRefresh: () => void;
}

export default function AppliancesTab({
  appliances,
  areas,
  propertyId,
  onRefresh,
}: AppliancesTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<HomeAppliance | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appliance?")) return;

    try {
      const response = await fetch(`/api/house/appliances/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      onRefresh();
    } catch (error) {
      console.error("Error deleting appliance:", error);
    }
  };

  const getWarrantyEndDate = (purchaseDate: string | null, warrantyMonths: number | null) => {
    if (!purchaseDate || !warrantyMonths) return null;
    const end = new Date(purchaseDate);
    end.setMonth(end.getMonth() + warrantyMonths);
    return end;
  };

  const isWarrantyExpiring = (purchaseDate: string | null, warrantyMonths: number | null) => {
    const endDate = getWarrantyEndDate(purchaseDate, warrantyMonths);
    if (!endDate) return false;
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    return endDate <= threeMonths && endDate > new Date();
  };

  const isWarrantyExpired = (purchaseDate: string | null, warrantyMonths: number | null) => {
    const endDate = getWarrantyEndDate(purchaseDate, warrantyMonths);
    if (!endDate) return false;
    return endDate < new Date();
  };

  const formatCurrency = (cents: number | null) => {
    if (!cents) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Appliances</h2>
        <button
          onClick={() => { setEditingAppliance(null); setShowModal(true); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Appliance
        </button>
      </div>

      {appliances.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
          <p className="text-gray-500">No appliances added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {appliances.map((appliance) => {
            const area = areas.find((a) => a.id === appliance.area_id);
            const warrantyExpiring = isWarrantyExpiring(
              appliance.purchase_date,
              appliance.warranty_months,
            );
            const warrantyExpired = isWarrantyExpired(
              appliance.purchase_date,
              appliance.warranty_months,
            );
            const warrantyEndDate = getWarrantyEndDate(
              appliance.purchase_date,
              appliance.warranty_months,
            );

            return (
              <div
                key={appliance.id}
                className={`rounded-lg border bg-gray-900 p-4 transition-colors ${
                  warrantyExpired
                    ? "border-red-500/30"
                    : warrantyExpiring
                      ? "border-orange-500/30"
                      : "border-gray-800"
                }`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold text-white">{appliance.name}</h3>
                      {warrantyExpired && (
                        <span className="rounded border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                          Warranty Expired
                        </span>
                      )}
                      {warrantyExpiring && !warrantyExpired && (
                        <span className="flex items-center gap-1 rounded border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-xs text-orange-400">
                          <AlertCircle className="h-3 w-3" />
                          Expiring Soon
                        </span>
                      )}
                    </div>
                    {appliance.manufacturer && (
                      <p className="text-sm text-gray-400">{appliance.manufacturer}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingAppliance(appliance); setShowModal(true); }}
                      className="p-1 text-gray-400 transition-colors hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(appliance.id)}
                      className="p-1 text-gray-400 transition-colors hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-400">
                  {area && <div>Location: {area.name}</div>}
                  {appliance.model && <div>Model: {appliance.model}</div>}
                  {appliance.serial_number && <div>Serial: {appliance.serial_number}</div>}
                  {appliance.purchase_date && (
                    <div>Purchased: {new Date(appliance.purchase_date).toLocaleDateString()}</div>
                  )}
                  {appliance.purchase_price_cents && (
                    <div>Price: {formatCurrency(appliance.purchase_price_cents)}</div>
                  )}
                  {warrantyEndDate && (
                    <div
                      className={
                        warrantyExpired ? "text-red-400" : warrantyExpiring ? "text-orange-400" : ""
                      }
                    >
                      Warranty until: {warrantyEndDate.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ApplianceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingAppliance={editingAppliance}
        areas={areas}
        propertyId={propertyId}
        onSuccess={onRefresh}
      />
    </div>
  );
}
