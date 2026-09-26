"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/register/school", label: "School" },
  { href: "/register/university", label: "University" },
  { href: "/categories", label: "Compete" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 backdrop-blur z-20"
      style={{
        backgroundColor: "rgba(7,9,17,0.82)",
        backgroundImage:
          "linear-gradient(90deg, rgba(4, 19, 39, 0.22) 0%, rgba(12, 69, 97, 0.09) 50%, rgba(29,111,224,0.22) 100%)",
        borderBottom: "1px solid rgba(125,211,252,0.18)",
        boxShadow: "0 1px 24px rgba(29,111,224,0.18)",
      }}
    >
      <div className="px-5 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/phoenix-full.webp" alt="Phoenix'26" className="h-12 w-auto" />
          <span className="font-extrabold text-[17px] tracking-wide">
            PHOENIX<span className="text-flame2">&apos;26</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2.5 text-[12px] text-muted">
          {NAV_LINKS.map((item, i) => (
            <span key={item.href} className="flex items-center gap-2.5">
              {i > 0 && <span className="text-border">|</span>}
              <Link href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            </span>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-9 h-9 -mr-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span
            className={`block w-5 h-0.5 bg-white mx-auto transition-transform ${
              open ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span className={`block w-5 h-0.5 bg-white mx-auto transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`block w-5 h-0.5 bg-white mx-auto transition-transform ${
              open ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <nav className="md:hidden border-t border-border px-5 py-2 flex flex-col">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-[13.5px] text-muted hover:text-white py-2.5 border-b border-border last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}