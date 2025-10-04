// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent sm:text-5xl">
            Welcome to Your Personal Hub
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Manage your daily tasks, shopping lists, wishlist, and personal organization
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Shopping Lists Card */}
            <Link href="/shopping" className="group">
              <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-emerald-100 hover:border-emerald-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        Shopping Lists
                      </h3>
                      <p className="text-sm text-gray-600">
                        Manage your grocery and shopping lists
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100">
                  <span className="text-sm text-emerald-700 group-hover:text-emerald-800 font-medium">
                    View your lists →
                  </span>
                </div>
              </div>
            </Link>

            {/* Wishlist Card */}
            <Link href="/wishlist" className="group">
              <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-violet-100 hover:border-violet-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                        Wishlist
                      </h3>
                      <p className="text-sm text-gray-600">
                        Track items you want to buy someday
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-violet-50 to-violet-100">
                  <span className="text-sm text-violet-700 group-hover:text-violet-800 font-medium">
                    View wishlist →
                  </span>
                </div>
              </div>
            </Link>

            {/* Car Tracker Card */}
            <Link href="/car" className="group">
              <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Car Tracker
                      </h3>
                      <p className="text-sm text-gray-600">
                        Vehicle maintenance, fuel logs, and costs
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-100">
                  <span className="text-sm text-blue-700 group-hover:text-blue-800 font-medium">
                    Manage vehicles →
                  </span>
                </div>
              </div>
            </Link>

            {/* House Card */}
            <Link href="/house" className="group">
              <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-amber-100 hover:border-amber-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                        House Tracker
                      </h3>
                      <p className="text-sm text-gray-600">
                        Maintenance, appliances, and supplies
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-100">
                  <span className="text-sm text-amber-700 group-hover:text-amber-800 font-medium">
                    Manage home →
                  </span>
                </div>
              </div>
            </Link>

            {/* Inventory Card */}
            <Link href="/inventory" className="group">
              <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-indigo-100 hover:border-indigo-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        Inventory
                      </h3>
                      <p className="text-sm text-gray-600">
                        Track items in your kitchen and home
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 to-indigo-100">
                  <span className="text-sm text-indigo-700 group-hover:text-indigo-800 font-medium">
                    View inventory →
                  </span>
                </div>
              </div>
            </Link>

            {/* Media Card */}
            <Link href="/media" className="group">
              <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        Media Tracker
                      </h3>
                      <p className="text-sm text-gray-600">
                        Track anime, shows, and movies
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-purple-100">
                  <span className="text-sm text-purple-700 group-hover:text-purple-800 font-medium">
                    Continue watching →
                  </span>
                </div>
              </div>
            </Link>

            {/* Reading Card */}
            <Link href="/reading" className="group">
              <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-amber-100 hover:border-amber-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                        Reading Tracker
                      </h3>
                      <p className="text-sm text-gray-600">
                        Track books, progress, and highlights
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-amber-100">
                  <span className="text-sm text-amber-700 group-hover:text-amber-800 font-medium">
                    View library →
                  </span>
                </div>
              </div>
            </Link>

            {/* Travel Card */}
            <Link href="/travel" className="group">
              <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-pink-100 hover:border-pink-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                        Travel Planner
                      </h3>
                      <p className="text-sm text-gray-600">
                        Plan trips, itineraries, and journal
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-pink-50 to-pink-100">
                  <span className="text-sm text-pink-700 group-hover:text-pink-800 font-medium">
                    Plan your adventures →
                  </span>
                </div>
              </div>
            </Link>

            {/* Notes Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-orange-100 opacity-60">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-600">
                      Notes
                    </h3>
                    <p className="text-sm text-gray-500">
                      Quick notes and reminders
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-orange-50">
                <span className="text-sm text-orange-600 font-medium">
                  Coming soon...
                </span>
              </div>
            </div>

            {/* More coming soon... */}
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 opacity-40">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-500">
                      More Features
                    </h3>
                    <p className="text-sm text-gray-400">
                      Reading, habits, travel, and more
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50">
                <span className="text-sm text-gray-500 font-medium">
                  Coming soon...
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-xl shadow-lg border border-emerald-100 p-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent mb-4">
            Getting Started
          </h2>
          <div className="prose text-gray-600">
            <p>
              This is your personal productivity hub. Start by creating your first shopping list
              to organize your grocery trips and keep track of items you need.
            </p>
            <p>
              Use the wishlist to track items you want to buy someday - perfect for gift ideas,
              future purchases, or things you&apos;re considering. You can organize by priority,
              category, and status to keep everything organized.
            </p>
            <p>
              The car tracker helps you stay on top of vehicle maintenance, track fuel costs,
              and monitor your odometer readings. Get alerts when maintenance is due and keep
              a complete service history.
            </p>
            <p>
              More features like inventory tracking, notes, reading logs, habit tracking, and other
              personal management tools will be added as the application grows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}