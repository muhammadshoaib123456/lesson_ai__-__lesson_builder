"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function ProfileDropdown({
  showLabel = true,
  labelClassName = "",
  align = "right",
  className = "",
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  const nameOrEmail = session?.user?.name || session?.user?.email || "";
  const initials = nameOrEmail
    .split(" ")
    .map((s) => s?.[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  const side = align === "left" ? "left-0" : "right-0";

  return (
    <div className={`relative ${className}`} ref={boxRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
          {initials || "?"}
        </div>
        {showLabel && (
          <span className={`hidden sm:block truncate max-w-[200px] ${labelClassName}`}>
            {nameOrEmail}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute ${side} mt-2 z-[999]
                      flex flex-col items-start
                      p-2 gap-[6px]
                      w-[173px] h-[132px]
                      rounded-[8px] bg-white text-black
                      ring-1 ring-black/5`}
          style={{
            boxShadow:
              "0px 1px 2px rgba(0,0,0,0.30), 0px 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          {/* Frame 18122 #1 */}
          <div className="flex flex-col items-start p-0 gap-[6px] w-[157px] h-[26px]">
            <Link
              href="/profile"
              role="menuitem"
              className="flex items-center gap-3 h-[26px] w-full whitespace-nowrap"
            >
              {/* swap with your SVG */}
              <svg className="w-4 h-4 shrink-0 text-[#9500DE]" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
              <span className="text-sm leading-none">My Profile</span>
            </Link>
          </div>

          {/* Frame 18122 #2 */}
          <div className="flex flex-col items-start p-0 gap-[6px] w-[157px] h-[26px]">
            <Link
              href="/library"
              role="menuitem"
              className="flex items-center gap-3 h-[26px] w-full whitespace-nowrap"
            >
              {/* swap with your SVG */}
              <svg className="w-4 h-4 shrink-0 text-[#9500DE]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v12H4z" />
                <path d="M8 6v12" />
              </svg>
              <span className="text-sm leading-none">My Lessons</span>
            </Link>
          </div>

          {/* Frame 18122 #3 */}
          <div className="flex flex-col items-start p-0 gap-[6px] w-[157px] h-[26px]">
            <Link
              href="/pricing"
              role="menuitem"
              className="flex items-center gap-3 h-[26px] w-full whitespace-nowrap"
            >
              {/* swap with your SVG */}
              <svg className="w-4 h-4 shrink-0 text-[#9500DE]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3l9 4-9 4-9-4 9-4z" />
                <path d="M21 8v8l-9 5-9-5V8" />
              </svg>
              <span className="text-sm leading-none">Pricing &amp; Subscription</span>
            </Link>
          </div>

          {/* Frame 18120 (Logout) */}
          <button
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex flex-row items-center p-0 gap-[13px] min-w-[75px] h-[20px] whitespace-nowrap"
          >
            {/* swap with your red SVG */}
            <svg className="w-4 h-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 17l-1.5-1.5L12 12 8.5 8.5 10 7l5 5-5 5z" />
              <path d="M4 4h6v2H6v12h4v2H4z" />
            </svg>
            <span className="text-sm leading-none text-red-500">Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
