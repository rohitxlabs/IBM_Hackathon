"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="p-6 pb-24 lg:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
