"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/institutions", label: "Institutions" },
  { href: "/admin/competitors", label: "Competitors" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="md:w-56 border-b md:border-b-0 md:border-r border-border shrink-0">
      <div className="hidden md:block px-5 pt-6 pb-3 text-[11px] tracking-widest text-muted uppercase font-semibold">
        Admin
      </div>
      <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-1 px-3 md:px-3 py-3">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap text-[13px] font-semibold px-3 py-2 rounded-lg ${
                active ? "bg-ember text-ink" : "text-muted hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden md:block px-5 mt-2 pt-4 border-t border-border">
        <LogoutButton />
      </div>
      <div className="md:hidden px-5 pb-3">
        <LogoutButton />
      </div>
    </div>
  );
}
