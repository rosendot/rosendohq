// components/Sidebar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
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
    Menu,
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
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const sidebarRef = useRef<HTMLElement>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

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

    // Detect mobile screen
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle touch start
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    // Handle touch move
    const onTouchMove = (e: React.TouchEvent) => {
        const currentTouch = e.targetTouches[0].clientX;
        setTouchEnd(currentTouch);

        if (touchStart !== null) {
            const delta = currentTouch - touchStart;

            // For closing: only allow negative (leftward) swipes
            if (isMobileOpen && delta < 0) {
                setDragOffset(Math.max(delta, -256)); // -256px max (sidebar width)
            }
            // For opening from edge: only allow positive (rightward) swipes from left edge
            else if (!isMobileOpen && touchStart < 20 && delta > 0) {
                setDragOffset(Math.min(delta, 256));
            }
        }
    };

    // Handle touch end
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) {
            setDragOffset(0);
            return;
        }

        const distance = touchEnd - touchStart;
        const isLeftSwipe = distance < -minSwipeDistance;
        const isRightSwipe = distance > minSwipeDistance;

        if (isMobileOpen && isLeftSwipe) {
            setIsMobileOpen(false);
        } else if (!isMobileOpen && isRightSwipe && touchStart < 20) {
            setIsMobileOpen(true);
        }

        setDragOffset(0);
        setTouchStart(null);
        setTouchEnd(null);
    };

    // Handle edge swipe to open (global touch listener)
    useEffect(() => {
        if (!isMobile) return;

        let edgeTouchStart: number | null = null;
        let edgeTouchEnd: number | null = null;

        const handleEdgeTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (touch.clientX < 20 && !isMobileOpen) {
                edgeTouchStart = touch.clientX;
            }
        };

        const handleEdgeTouchMove = (e: TouchEvent) => {
            if (edgeTouchStart !== null) {
                edgeTouchEnd = e.touches[0].clientX;
            }
        };

        const handleEdgeTouchEnd = () => {
            if (edgeTouchStart !== null && edgeTouchEnd !== null) {
                const distance = edgeTouchEnd - edgeTouchStart;
                if (distance > minSwipeDistance) {
                    setIsMobileOpen(true);
                }
            }
            edgeTouchStart = null;
            edgeTouchEnd = null;
        };

        document.addEventListener('touchstart', handleEdgeTouchStart);
        document.addEventListener('touchmove', handleEdgeTouchMove);
        document.addEventListener('touchend', handleEdgeTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleEdgeTouchStart);
            document.removeEventListener('touchmove', handleEdgeTouchMove);
            document.removeEventListener('touchend', handleEdgeTouchEnd);
        };
    }, [isMobile, isMobileOpen]);

    return (
        <>
            {/* Mobile Menu Button */}
            {isMobile && !isMobileOpen && (
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-100 lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>
            )}

            {/* Backdrop for mobile */}
            {isMobile && isMobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                ref={sidebarRef}
                onMouseEnter={() => !isMobile && setIsExpanded(true)}
                onMouseLeave={() => !isMobile && setIsExpanded(false)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={
                    isMobile && dragOffset !== 0
                        ? {
                            transform: isMobileOpen
                                ? `translateX(${dragOffset}px)`
                                : `translateX(calc(-100% + ${dragOffset}px))`,
                        }
                        : undefined
                }
                className={`fixed left-0 top-0 z-40 h-screen border-r border-gray-800 bg-[#0a0a0a] transition-all duration-300 ${
                    isMobile
                        ? `w-64 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`
                        : `${isExpanded ? 'w-64' : 'w-16'}`
                }`}
            >
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
                    {(isExpanded || isMobile) ? (
                        <h1 className="text-xl font-bold text-gray-100">Personal Hub</h1>
                    ) : (
                        <LayoutDashboard className="h-6 w-6 text-gray-400" />
                    )}
                    {/* Close button for mobile */}
                    {isMobile && isMobileOpen && (
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="text-gray-400 hover:text-gray-100 lg:hidden"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
                    {navGroups.map((group) => {
                        const isCollapsed = collapsedGroups.has(group.name);

                        return (
                            <div key={group.name} className="mb-4">
                                {/* Group Header - Only show when expanded */}
                                {(isExpanded || isMobile) && (
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
                                                    onClick={() => isMobile && setIsMobileOpen(false)}
                                                    title={!isExpanded && !isMobile ? item.name : undefined}
                                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                                        ? 'bg-[#8b5cf6] text-white'
                                                        : 'text-gray-400 hover:bg-gray-900 hover:text-gray-100'
                                                        }`}
                                                >
                                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                                    {(isExpanded || isMobile) && <span>{item.name}</span>}
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
                    {(isExpanded || isMobile) ? (
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

                {/* Expand/Collapse Indicator - Desktop only */}
                {!isMobile && (
                    <div className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-gray-800 bg-[#0a0a0a] shadow-sm">
                        {isExpanded ? (
                            <ChevronLeft className="h-4 w-4 text-gray-500" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                    </div>
                )}
            </div>
            </aside>
        </>
    );
}