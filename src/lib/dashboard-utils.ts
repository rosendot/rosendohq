// frontend/src/lib/dashboard-utils.ts

export interface ModuleCard {
    id: string;
    name: string;
    icon: string;
    href: string;
    color: string;
    description: string;
}

export const modules: ModuleCard[] = [
    {
        id: 'shopping',
        name: 'Shopping Lists',
        icon: '🛒',
        href: '/shopping',
        color: 'bg-blue-500',
        description: 'Manage shopping lists'
    },
    {
        id: 'wishlist',
        name: 'Wishlist',
        icon: '⭐',
        href: '/wishlist',
        color: 'bg-purple-500',
        description: 'Track desired items'
    },
    {
        id: 'car',
        name: 'Car Tracker',
        icon: '🚗',
        href: '/car',
        color: 'bg-red-500',
        description: 'Vehicle maintenance'
    },
    {
        id: 'inventory',
        name: 'Inventory',
        icon: '📦',
        href: '/inventory',
        color: 'bg-amber-500',
        description: 'Home inventory'
    },
    {
        id: 'media',
        name: 'Media Tracker',
        icon: '🎬',
        href: '/media',
        color: 'bg-pink-500',
        description: 'Movies, TV & games'
    },
    {
        id: 'reading',
        name: 'Reading Tracker',
        icon: '📚',
        href: '/reading',
        color: 'bg-green-500',
        description: 'Books & reading'
    },
    {
        id: 'habits',
        name: 'Habits & Goals',
        icon: '🎯',
        href: '/habits',
        color: 'bg-teal-500',
        description: 'Track habits & goals'
    },
    {
        id: 'notes',
        name: 'Knowledge Base',
        icon: '📝',
        href: '/notes',
        color: 'bg-indigo-500',
        description: 'Notes & knowledge'
    },
    {
        id: 'travel',
        name: 'Travel Planner',
        icon: '✈️',
        href: '/travel',
        color: 'bg-cyan-500',
        description: 'Plan your trips'
    },
    {
        id: 'nutrition',
        name: 'Nutrition',
        icon: '🥗',
        href: '/nutrition',
        color: 'bg-lime-500',
        description: 'Meal planning'
    },
    {
        id: 'house',
        name: 'House Tracker',
        icon: '🏠',
        href: '/house',
        color: 'bg-orange-500',
        description: 'Home maintenance'
    },
    {
        id: 'finance',
        name: 'Finance',
        icon: '💰',
        href: '/finance',
        color: 'bg-emerald-500',
        description: 'Financial tracking'
    }
];

export function getModuleStats() {
    return {
        total: modules.length,
        completed: modules.length,
        inProgress: 0
    };
}