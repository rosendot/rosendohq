import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Welcome to Your Personal Hub
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Manage your daily tasks, shopping lists, and personal organization
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Shopping Lists Card */}
            <Link href="/shopping" className="group">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                        Shopping Lists
                      </h3>
                      <p className="text-sm text-gray-500">
                        Manage your grocery and shopping lists
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gray-50">
                  <span className="text-sm text-blue-600 group-hover:text-blue-800">
                    View your lists →
                  </span>
                </div>
              </div>
            </Link>

            {/* Inventory Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg opacity-50">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-400 rounded-md flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-600">
                      Inventory
                    </h3>
                    <p className="text-sm text-gray-400">
                      Track items in your kitchen and home
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50">
                <span className="text-sm text-gray-400">
                  Coming soon...
                </span>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg opacity-50">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-400 rounded-md flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-600">
                      Notes
                    </h3>
                    <p className="text-sm text-gray-400">
                      Quick notes and reminders
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50">
                <span className="text-sm text-gray-400">
                  Coming soon...
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <div className="prose text-gray-600">
            <p>
              This is your personal productivity hub. Start by creating your first shopping list
              to organize your grocery trips and keep track of items you need.
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