// components/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingCart,
    Heart,
    Home,
    Package,
    Car,
    DollarSign,
    Apple,
    BookOpen,
    Film,
    Target,
    Plane,
    StickyNote,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

interface NavGroup {
    name: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        name: 'Overview',
        items: [
            { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        ],
    },
    {
        name: 'Shopping & Lists',
        items: [
            { name: 'Shopping Lists', href: '/shopping', icon: ShoppingCart },
            { name: 'Wishlist', href: '/wishlist', icon: Heart },
        ],
    },
    {
        name: 'Home & Assets',
        items: [
            { name: 'House Tracker', href: '/house', icon: Home },
            { name: 'Inventory', href: '/inventory', icon: Package },
            { name: 'Car Tracker', href: '/car', icon: Car },
        ],
    },
    {
        name: 'Finance & Health',
        items: [
            { name: 'Finance', href: '/finance', icon: DollarSign },
            { name: 'Nutrition', href: '/nutrition', icon: Apple },
        ],
    },
    {
        name: 'Personal Growth',
        items: [
            { name: 'Reading Tracker', href: '/reading', icon: BookOpen },
            { name: 'Media Tracker', href: '/media', icon: Film },
            { name: 'Habits & Goals', href: '/habits', icon: Target },
        ],
    },
    {
        name: 'Planning',
        items: [
            { name: 'Travel Planner', href: '/travel', icon: Plane },
            { name: 'Notes', href: '/notes', icon: StickyNote },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    const toggleGroup = (groupName: string) => {
        setCollapsedGroups((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(groupName)) {
                newSet.delete(groupName);
            } else {
                newSet.add(groupName);
            }
            return newSet;
        });
    };

    return (
        <aside
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className={`fixed left-0 top-0 z-40 h-screen border-r border-gray-800 bg-[#0a0a0a] transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'
                }`}
        >
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center border-b border-gray-800 px-4">
                    {isExpanded ? (
                        <h1 className="text-xl font-bold text-gray-100">Personal Hub</h1>
                    ) : (
                        <LayoutDashboard className="h-6 w-6 text-gray-400" />
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
                    {navGroups.map((group) => {
                        const isCollapsed = collapsedGroups.has(group.name);

                        return (
                            <div key={group.name} className="mb-4">
                                {/* Group Header - Only show when expanded */}
                                {isExpanded && (
                                    <button
                                        onClick={() => toggleGroup(group.name)}
                                        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-400"
                                    >
                                        <span>{group.name}</span>
                                        {isCollapsed ? (
                                            <ChevronRight className="h-3 w-3" />
                                        ) : (
                                            <ChevronDown className="h-3 w-3" />
                                        )}
                                    </button>
                                )}

                                {/* Group Items */}
                                {(!isCollapsed || !isExpanded) && (
                                    <div className="mt-1 space-y-1">
                                        {group.items.map((item) => {
                                            const isActive = pathname === item.href;
                                            const Icon = item.icon;

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    title={!isExpanded ? item.name : undefined}
                                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                                        ? 'bg-[#8b5cf6] text-white'
                                                        : 'text-gray-400 hover:bg-gray-900 hover:text-gray-100'
                                                        }`}
                                                >
                                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                                    {isExpanded && <span>{item.name}</span>}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-gray-800 p-4">
                    {isExpanded ? (
                        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-900 hover:text-gray-100">
                            <Package className="h-5 w-5" />
                            <span>Import/Export</span>
                        </button>
                    ) : (
                        <button
                            title="Import/Export"
                            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-900 hover:text-gray-100"
                        >
                            <Package className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Expand/Collapse Indicator */}
                <div className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-gray-800 bg-[#0a0a0a] shadow-sm">
                    {isExpanded ? (
                        <ChevronLeft className="h-4 w-4 text-gray-500" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                </div>
            </div>
        </aside>
    );
}