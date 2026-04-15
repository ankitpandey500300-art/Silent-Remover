"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-800 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 relative flex items-center justify-center overflow-hidden rounded-lg">
            {/* You will need to save the uploaded image as public/logo.png */}
            <img src="/logo.png" alt="SilentRemover Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white hover:text-accent transition-colors">
            SilentRemover
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
            <Lock size={14} className="text-accent" />
            <span>100% Local Processing</span>
          </div>

          <Link href="/editor" className="bg-accent text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-accentHover transition-colors shadow-[0_0_15px_rgba(0,255,136,0.2)]">
            Try Editor
          </Link>
        </div>
      </div>
    </nav>
  );
}
