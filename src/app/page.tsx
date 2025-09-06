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

            {/* Inventory Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-teal-100 opacity-60">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gradient-to-r from-teal-400 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-600">
                      Inventory
                    </h3>
                    <p className="text-sm text-gray-500">
                      Track items in your kitchen and home
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-teal-50">
                <span className="text-sm text-teal-600 font-medium">
                  Coming soon...
                </span>
              </div>
            </div>

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
              future purchases, or things you're considering. You can organize by priority,
              category, and status to keep everything organized.
            </p>
            <p>
              More features like inventory tracking, notes, and other personal management tools
              will be added as the application grows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}