// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Dashboard",
  description: "Personal productivity and life management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-gradient-to-r from-emerald-600 to-violet-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-xl font-bold text-white">
                    Personal Hub
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/"
                    className="text-emerald-100 hover:text-white hover:bg-white/10 whitespace-nowrap py-2 px-3 rounded-md font-medium text-sm transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/shopping"
                    className="text-emerald-100 hover:text-white hover:bg-white/10 whitespace-nowrap py-2 px-3 rounded-md font-medium text-sm transition-colors"
                  >
                    Shopping
                  </Link>
                  <Link
                    href="/wishlist"
                    className="text-emerald-100 hover:text-white hover:bg-white/10 whitespace-nowrap py-2 px-3 rounded-md font-medium text-sm transition-colors"
                  >
                    Wishlist
                  </Link>
                  <Link
                    href="/car"
                    className="text-emerald-100 hover:text-white hover:bg-white/10 whitespace-nowrap py-2 px-3 rounded-md font-medium text-sm transition-colors"
                  >
                    Car
                  </Link>
                  <Link
                    href="/inventory"
                    className="text-emerald-100 hover:text-white hover:bg-white/10 whitespace-nowrap py-2 px-3 rounded-md font-medium text-sm transition-colors"
                  >
                    Inventory
                  </Link>
                  <Link
                    href="/media"
                    className="text-emerald-100 hover:text-white hover:bg-white/10 whitespace-nowrap py-2 px-3 rounded-md font-medium text-sm transition-colors"
                  >
                    Media
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}