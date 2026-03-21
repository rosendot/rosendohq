"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronDown } from "lucide-react";
import PropertyModal from "./modals/PropertyModal";
import type {
  HomeProperty,
  HomeArea,
  HomeAppliance,
  HomeMaintenanceRecord,
  HomeMaintenanceTemplate,
  HomeSupplyItem,
  HomeSupplyStockWithItem,
  HomeContractor,
  HomeUtilityBill,
  HomeProject,
  HomeDocument,
} from "@/types/house.types";

import DashboardTab from "./components/DashboardTab";
import MaintenanceTab from "./components/MaintenanceTab";
import SuppliesTab from "./components/SuppliesTab";
import ProjectsTab from "./components/ProjectsTab";
import AreasTab from "./components/AreasTab";
import AppliancesTab from "./components/AppliancesTab";
import UtilitiesTab from "./components/UtilitiesTab";
import ContractorsTab from "./components/ContractorsTab";
import DocumentsTab from "./components/DocumentsTab";

type TabType =
  | "dashboard"
  | "maintenance"
  | "supplies"
  | "projects"
  | "areas"
  | "appliances"
  | "utilities"
  | "contractors"
  | "documents";

export default function HousePage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [loading, setLoading] = useState(true);

  // Property state
  const [properties, setProperties] = useState<HomeProperty[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // Data states
  const [areas, setAreas] = useState<HomeArea[]>([]);
  const [appliances, setAppliances] = useState<HomeAppliance[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<HomeMaintenanceRecord[]>([]);
  const [maintenanceTemplates, setMaintenanceTemplates] = useState<HomeMaintenanceTemplate[]>([]);
  const [supplyItems, setSupplyItems] = useState<HomeSupplyItem[]>([]);
  const [supplyStock, setSupplyStock] = useState<HomeSupplyStockWithItem[]>([]);
  const [contractors, setContractors] = useState<HomeContractor[]>([]);
  const [utilityBills, setUtilityBills] = useState<HomeUtilityBill[]>([]);
  const [projects, setProjects] = useState<HomeProject[]>([]);
  const [documents, setDocuments] = useState<HomeDocument[]>([]);

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
    fetchContractors();
    fetchSupplyItems();
  }, []);

  // Fetch property data when selected property changes
  useEffect(() => {
    if (selectedPropertyId) {
      fetchPropertyData(selectedPropertyId);
    }
  }, [selectedPropertyId]);

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/house/properties");
      if (!response.ok) throw new Error("Failed to fetch properties");
      const data = await response.json();
      setProperties(data);
      if (data.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContractors = async () => {
    try {
      const response = await fetch("/api/house/contractors");
      if (response.ok) {
        const data = await response.json();
        setContractors(data);
      }
    } catch (err) {
      console.error("Error fetching contractors:", err);
    }
  };

  const fetchSupplyItems = async () => {
    try {
      const response = await fetch("/api/house/supplies/items");
      if (response.ok) {
        const data = await response.json();
        setSupplyItems(data);
      }
    } catch (err) {
      console.error("Error fetching supply items:", err);
    }
  };

  const fetchPropertyData = async (propertyId: string) => {
    setLoading(true);
    try {
      const [
        areasRes,
        appliancesRes,
        recordsRes,
        templatesRes,
        stockRes,
        utilitiesRes,
        projectsRes,
        documentsRes,
      ] = await Promise.all([
        fetch(`/api/house/areas?propertyId=${propertyId}`),
        fetch(`/api/house/appliances?propertyId=${propertyId}`),
        fetch(`/api/house/maintenance/records?propertyId=${propertyId}`),
        fetch(`/api/house/maintenance/templates?propertyId=${propertyId}`),
        fetch(`/api/house/supplies/stock?propertyId=${propertyId}`),
        fetch(`/api/house/utilities?propertyId=${propertyId}`),
        fetch(`/api/house/projects?propertyId=${propertyId}`),
        fetch(`/api/house/documents?propertyId=${propertyId}`),
      ]);

      if (areasRes.ok) setAreas(await areasRes.json());
      if (appliancesRes.ok) setAppliances(await appliancesRes.json());
      if (recordsRes.ok) setMaintenanceRecords(await recordsRes.json());
      if (templatesRes.ok) setMaintenanceTemplates(await templatesRes.json());
      if (stockRes.ok) setSupplyStock(await stockRes.json());
      if (utilitiesRes.ok) setUtilityBills(await utilitiesRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (documentsRes.ok) setDocuments(await documentsRes.json());
    } catch (err) {
      console.error("Error fetching property data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedPropertyId) {
      fetchPropertyData(selectedPropertyId);
    }
    fetchContractors();
    fetchSupplyItems();
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "maintenance", label: "Maintenance" },
    { id: "supplies", label: "Supplies" },
    { id: "projects", label: "Projects" },
    { id: "areas", label: "Areas" },
    { id: "appliances", label: "Appliances" },
    { id: "utilities", label: "Utilities" },
    { id: "contractors", label: "Contractors" },
    { id: "documents", label: "Documents" },
  ];

  if (loading && properties.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-100">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">House Tracker</h1>
            <p className="text-gray-400">Manage your home maintenance, supplies, and projects</p>
          </div>

          {/* Property Selector */}
          <div className="flex items-center gap-3">
            {properties.length > 0 && (
              <div className="relative">
                <select
                  value={selectedPropertyId || ""}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="cursor-pointer appearance-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 pr-10 text-white focus:border-blue-500 focus:outline-none"
                >
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            )}
            <button
              onClick={() => setShowPropertyModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              {properties.length === 0 ? "Add Property" : "New Property"}
            </button>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
            <h2 className="mb-2 text-xl font-semibold text-white">Welcome!</h2>
            <p className="mb-6 text-gray-400">Get started by adding your first property.</p>
            <button
              onClick={() => setShowPropertyModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Add Your First Property
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-400 text-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "dashboard" && (
                <DashboardTab
                  areas={areas}
                  maintenanceRecords={maintenanceRecords}
                  supplyStock={supplyStock}
                  projects={projects}
                  utilityBills={utilityBills}
                />
              )}

              {activeTab === "maintenance" && (
                <MaintenanceTab
                  records={maintenanceRecords}
                  templates={maintenanceTemplates}
                  areas={areas}
                  propertyId={selectedPropertyId}
                  onRefresh={handleRefresh}
                />
              )}

              {activeTab === "supplies" && (
                <SuppliesTab
                  stock={supplyStock}
                  items={supplyItems}
                  areas={areas}
                  propertyId={selectedPropertyId}
                  onRefresh={handleRefresh}
                />
              )}

              {activeTab === "projects" && (
                <ProjectsTab
                  projects={projects}
                  areas={areas}
                  contractors={contractors}
                  propertyId={selectedPropertyId}
                  onRefresh={handleRefresh}
                />
              )}

              {activeTab === "areas" && (
                <AreasTab areas={areas} propertyId={selectedPropertyId} onRefresh={handleRefresh} />
              )}

              {activeTab === "appliances" && (
                <AppliancesTab
                  appliances={appliances}
                  areas={areas}
                  propertyId={selectedPropertyId}
                  onRefresh={handleRefresh}
                />
              )}

              {activeTab === "utilities" && (
                <UtilitiesTab
                  bills={utilityBills}
                  propertyId={selectedPropertyId}
                  onRefresh={handleRefresh}
                />
              )}

              {activeTab === "contractors" && (
                <ContractorsTab contractors={contractors} onRefresh={handleRefresh} />
              )}

              {activeTab === "documents" && (
                <DocumentsTab
                  documents={documents}
                  propertyId={selectedPropertyId}
                  onRefresh={handleRefresh}
                />
              )}
            </div>
          </>
        )}

        {/* Property Modal */}
        <PropertyModal
          isOpen={showPropertyModal}
          onClose={() => setShowPropertyModal(false)}
          onSuccess={() => {
            fetchProperties();
          }}
        />
      </div>
    </div>
  );
}
