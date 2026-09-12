"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

/**
 * The signed-in application frame: sidebar, header, content and the mobile
 * tab bar. Holds the one piece of layout state that must be shared — whether
 * the mobile drawer is open.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <div className="flex">
        <Sidebar mobileOpen={navOpen} onClose={() => setNavOpen(false)} />

        <div className="flex-1 min-w-0">
          <Header onOpenNav={() => setNavOpen(true)} />
          <main
            id="main-content"
            className="px-4 sm:px-6 py-6 pb-28 lg:pb-8 max-w-7xl mx-auto w-full"
          >
            {children}
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
