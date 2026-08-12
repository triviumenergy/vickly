"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  UnsavedChangesProvider,
  useUnsavedChanges,
} from "./unsaved-changes-context";

type NavItem = {
  href: string;
  label: string;
};

export default function DashboardShell(props: {
  workspaceName: string;
  userEmail: string;
  showMembers: boolean;
  children: React.ReactNode;
}) {
  return (
    <UnsavedChangesProvider>
      <DashboardShellInner {...props} />
    </UnsavedChangesProvider>
  );
}

function DashboardShellInner({
  workspaceName,
  userEmail,
  showMembers,
  children,
}: {
  workspaceName: string;
  userEmail: string;
  showMembers: boolean;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { dirty, setDirty } = useUnsavedChanges();

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/dashboard/proyectos", label: "Proyectos" },
    ...(showMembers
      ? [{ href: "/dashboard/miembros", label: "Miembros" }]
      : []),
    { href: "/dashboard/mis-datos", label: "Mis datos" },
    { href: "/dashboard/mi-plan", label: "Mi plan" },
  ];

  // Devuelve true si está OK seguir navegando (no hay cambios sin
  // guardar, o el usuario confirmó que quiere descartarlos).
  function confirmLeave(): boolean {
    if (!dirty) return true;
    const ok = window.confirm(
      "Hay cambios sin guardar. ¿Salir de todos modos?"
    );
    if (ok) setDirty(false);
    return ok;
  }

  function handleNavClick(e: React.MouseEvent) {
    if (!confirmLeave()) {
      e.preventDefault();
    } else {
      setMenuOpen(false);
    }
  }

  async function handleLogout() {
    if (!confirmLeave()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen sm:flex">
      {/* Topbar mobile */}
      <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-line bg-panel">
        <span className="font-display font-extrabold">Vickly</span>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-9 h-9 flex items-center justify-center border border-line rounded"
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          menuOpen ? "block" : "hidden"
        } sm:block w-full sm:w-60 sm:min-h-screen bg-teal-dark text-white flex-shrink-0`}
      >
        <div className="px-5 py-6 hidden sm:block">
          <p className="font-display font-extrabold text-lg">Vickly</p>
          <p className="text-xs text-white/60 mt-1 truncate">
            {workspaceName}
          </p>
        </div>

        <nav className="px-3 pb-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`block px-3 py-2 rounded text-sm font-medium mb-1 transition-colors ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pt-3 border-t border-white/10 mx-3">
          <p className="text-xs text-white/50 px-3 pt-3 truncate">
            {userEmail}
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-white/75 hover:text-white px-3 py-2 font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 min-w-0 px-6 py-8">{children}</main>
    </div>
  );
}
