'use client';

import { useState, useEffect } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import type {
    HomeProperty,
    HomePropertyInsert,
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
} from '@/types/database.types';

import DashboardTab from './components/DashboardTab';
import MaintenanceTab from './components/MaintenanceTab';
import SuppliesTab from './components/SuppliesTab';
import ProjectsTab from './components/ProjectsTab';
import AreasTab from './components/AreasTab';
import AppliancesTab from './components/AppliancesTab';
import UtilitiesTab from './components/UtilitiesTab';
import ContractorsTab from './components/ContractorsTab';
import DocumentsTab from './components/DocumentsTab';

type TabType =
    | 'dashboard'
    | 'maintenance'
    | 'supplies'
    | 'projects'
    | 'areas'
    | 'appliances'
    | 'utilities'
    | 'contractors'
    | 'documents';

export default function HousePage() {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [loading, setLoading] = useState(true);

    // Property state
    const [properties, setProperties] = useState<HomeProperty[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [propertyLoading, setPropertyLoading] = useState(false);

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

    // Property form
    const [propertyFormData, setPropertyFormData] = useState<HomePropertyInsert>({
        name: '',
        address1: null,
        address2: null,
        city: null,
        state: null,
        postal_code: null,
        country: null,
        notes: null,
    });

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
            const response = await fetch('/api/house/properties');
            if (!response.ok) throw new Error('Failed to fetch properties');
            const data = await response.json();
            setProperties(data);
            if (data.length > 0 && !selectedPropertyId) {
                setSelectedPropertyId(data[0].id);
            }
        } catch (err) {
            console.error('Error fetching properties:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchContractors = async () => {
        try {
            const response = await fetch('/api/house/contractors');
            if (response.ok) {
                const data = await response.json();
                setContractors(data);
            }
        } catch (err) {
            console.error('Error fetching contractors:', err);
        }
    };

    const fetchSupplyItems = async () => {
        try {
            const response = await fetch('/api/house/supplies/items');
            if (response.ok) {
                const data = await response.json();
                setSupplyItems(data);
            }
        } catch (err) {
            console.error('Error fetching supply items:', err);
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
            console.error('Error fetching property data:', err);
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

    const handlePropertySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!propertyFormData.name.trim()) return;
        setPropertyLoading(true);

        try {
            const response = await fetch('/api/house/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(propertyFormData),
            });

            if (!response.ok) throw new Error('Failed to create property');

            const newProperty = await response.json();
            setProperties([...properties, newProperty]);
            setSelectedPropertyId(newProperty.id);
            setShowPropertyModal(false);
            setPropertyFormData({
                name: '',
                address1: null,
                address2: null,
                city: null,
                state: null,
                postal_code: null,
                country: null,
                notes: null,
            });
        } catch (err) {
            console.error('Error creating property:', err);
        } finally {
            setPropertyLoading(false);
        }
    };

    const tabs: { id: TabType; label: string }[] = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'maintenance', label: 'Maintenance' },
        { id: 'supplies', label: 'Supplies' },
        { id: 'projects', label: 'Projects' },
        { id: 'areas', label: 'Areas' },
        { id: 'appliances', label: 'Appliances' },
        { id: 'utilities', label: 'Utilities' },
        { id: 'contractors', label: 'Contractors' },
        { id: 'documents', label: 'Documents' },
    ];

    if (loading && properties.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">House Tracker</h1>
                        <p className="text-gray-400">
                            Manage your home maintenance, supplies, and projects
                        </p>
                    </div>

                    {/* Property Selector */}
                    <div className="flex items-center gap-3">
                        {properties.length > 0 && (
                            <div className="relative">
                                <select
                                    value={selectedPropertyId || ''}
                                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                                    className="appearance-none px-4 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                                >
                                    {properties.map((property) => (
                                        <option key={property.id} value={property.id}>
                                            {property.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        )}
                        <button
                            onClick={() => setShowPropertyModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            {properties.length === 0 ? 'Add Property' : 'New Property'}
                        </button>
                    </div>
                </div>

                {properties.length === 0 ? (
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                        <h2 className="text-xl font-semibold text-white mb-2">Welcome!</h2>
                        <p className="text-gray-400 mb-6">
                            Get started by adding your first property.
                        </p>
                        <button
                            onClick={() => setShowPropertyModal(true)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First Property
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex gap-1 mb-6 border-b border-gray-800 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'text-blue-400 border-blue-400'
                                            : 'text-gray-400 border-transparent hover:text-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div>
                            {activeTab === 'dashboard' && (
                                <DashboardTab
                                    areas={areas}
                                    maintenanceRecords={maintenanceRecords}
                                    supplyStock={supplyStock}
                                    projects={projects}
                                    utilityBills={utilityBills}
                                />
                            )}

                            {activeTab === 'maintenance' && (
                                <MaintenanceTab
                                    records={maintenanceRecords}
                                    templates={maintenanceTemplates}
                                    areas={areas}
                                    propertyId={selectedPropertyId}
                                    onRefresh={handleRefresh}
                                />
                            )}

                            {activeTab === 'supplies' && (
                                <SuppliesTab
                                    stock={supplyStock}
                                    items={supplyItems}
                                    areas={areas}
                                    propertyId={selectedPropertyId}
                                    onRefresh={handleRefresh}
                                />
                            )}

                            {activeTab === 'projects' && (
                                <ProjectsTab
                                    projects={projects}
                                    areas={areas}
                                    contractors={contractors}
                                    propertyId={selectedPropertyId}
                                    onRefresh={handleRefresh}
                                />
                            )}

                            {activeTab === 'areas' && (
                                <AreasTab
                                    areas={areas}
                                    propertyId={selectedPropertyId}
                                    onRefresh={handleRefresh}
                                />
                            )}

                            {activeTab === 'appliances' && (
                                <AppliancesTab
                                    appliances={appliances}
                                    areas={areas}
                                    propertyId={selectedPropertyId}
                                    onRefresh={handleRefresh}
                                />
                            )}

                            {activeTab === 'utilities' && (
                                <UtilitiesTab
                                    bills={utilityBills}
                                    propertyId={selectedPropertyId}
                                    onRefresh={handleRefresh}
                                />
                            )}

                            {activeTab === 'contractors' && (
                                <ContractorsTab
                                    contractors={contractors}
                                    onRefresh={handleRefresh}
                                />
                            )}

                            {activeTab === 'documents' && (
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
                {showPropertyModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-white">Add Property</h2>
                                <button
                                    onClick={() => setShowPropertyModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handlePropertySubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Property Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={propertyFormData.name}
                                        onChange={(e) =>
                                            setPropertyFormData({
                                                ...propertyFormData,
                                                name: e.target.value,
                                            })
                                        }
                                        required
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g., Main House"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Address Line 1
                                    </label>
                                    <input
                                        type="text"
                                        value={propertyFormData.address1 || ''}
                                        onChange={(e) =>
                                            setPropertyFormData({
                                                ...propertyFormData,
                                                address1: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Address Line 2
                                    </label>
                                    <input
                                        type="text"
                                        value={propertyFormData.address2 || ''}
                                        onChange={(e) =>
                                            setPropertyFormData({
                                                ...propertyFormData,
                                                address2: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Apt, Suite, etc."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={propertyFormData.city || ''}
                                            onChange={(e) =>
                                                setPropertyFormData({
                                                    ...propertyFormData,
                                                    city: e.target.value || null,
                                                })
                                            }
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            value={propertyFormData.state || ''}
                                            onChange={(e) =>
                                                setPropertyFormData({
                                                    ...propertyFormData,
                                                    state: e.target.value || null,
                                                })
                                            }
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            value={propertyFormData.postal_code || ''}
                                            onChange={(e) =>
                                                setPropertyFormData({
                                                    ...propertyFormData,
                                                    postal_code: e.target.value || null,
                                                })
                                            }
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            value={propertyFormData.country || ''}
                                            onChange={(e) =>
                                                setPropertyFormData({
                                                    ...propertyFormData,
                                                    country: e.target.value || null,
                                                })
                                            }
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={propertyFormData.notes || ''}
                                        onChange={(e) =>
                                            setPropertyFormData({
                                                ...propertyFormData,
                                                notes: e.target.value || null,
                                            })
                                        }
                                        rows={2}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPropertyModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={propertyLoading || !propertyFormData.name.trim()}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {propertyLoading ? 'Creating...' : 'Create Property'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
