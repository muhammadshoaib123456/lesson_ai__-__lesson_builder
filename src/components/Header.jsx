"use client";

import React, { useEffect, useRef, useState } from "react";
import HelpPopup from "@/components/HelpPopup";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProfileDropdown from "@/components/ProfileDropdown";

/**
 * Header
 * - Top navigation bar with:
 *   - Logo (left)
 *   - Desktop nav (center): links + "Select Grade/Subject" hover menus
 *   - Right: Login/Profile + Help + Hamburger (mobile)
 *   - Mobile drawer menu with expandable Grades/Subjects
 *
 * QUICK STYLE TUNING (Tailwind):
 * - Header gradient colors → header className: "from-[#500078] to-[#9500DE]"
 * - Header paddings → outer <header> and inner container px/py classes
 * - Max content width → ".max-w-[1366px]"
 * - Text sizes → text-[14px], text-base, etc.
 * - Dropdown menu box → width (w-48), background (bg-gray-800), hover color (#9500DE)
 * - Mobile drawer width → "w-full md:w-1/2" (100% on mobile, 50% on md+)
 * - Z-index layers → z-50 used for overlays & menus; raise if overlapping issues
 */

const Header = () => {
  // ===== Auth session (controls Login vs Profile) =====
  const { data: session } = useSession();

  // ===== UI state =====
  const [menuOpen, setMenuOpen] = useState(false);   // ✅ Mobile drawer open/close
  const [helpOpen, setHelpOpen] = useState(false);   // ✅ Help popup open/close

  // ===== Dropdown data (Subjects/Grades) =====
  // APIs expected to return arrays like [{ name, count }]
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // ===== Desktop dropdown visibility =====
  const [showGradesDesktop, setShowGradesDesktop] = useState(false);
  const [showSubjectsDesktop, setShowSubjectsDesktop] = useState(false);

  // ===== Mobile expandable sections =====
  const [showGradesMobile, setShowGradesMobile] = useState(false);
  const [showSubjectsMobile, setShowSubjectsMobile] = useState(false);

  const router = useRouter();
  const pathname = usePathname(); // ✅ current route (used for login next= param)

  // ===== Fetch dropdown data once on mount =====
  useEffect(() => {
    // 🔧 Change endpoints if needed; cache:"no-store" forces fresh data (no browser cache)
    fetch("/api/meta/subjects", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setSubjects(data) : setSubjects([])))
      .catch(() => setSubjects([]));

    fetch("/api/meta/grades", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setGrades(data) : setGrades([])))
      .catch(() => setGrades([]));
  }, []);

  // ===== Lock body scroll when the mobile drawer is open =====
  useEffect(() => {
    // When menuOpen, prevent background scroll (important on iOS)
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  // ===== Desktop dropdown timing (matches your HeroSection behavior) =====
  const LEAVE_CLOSE_MS = 500; // ⏱️ Delay before closing dropdown after mouse leaves (tweak for feel)
  const gradeCloseRef = useRef(null);
  const subjectCloseRef = useRef(null);

  // Clear pending close timers (avoid flicker)
  const clearGradeClose = () => {
    if (gradeCloseRef.current) {
      clearTimeout(gradeCloseRef.current);
      gradeCloseRef.current = null;
    }
  };
  const clearSubjectClose = () => {
    if (subjectCloseRef.current) {
      clearTimeout(subjectCloseRef.current);
      subjectCloseRef.current = null;
    }
  };

  // ===== Desktop hover handlers for "Select Grade" =====
  const openGradesMenu = () => {
    // Close Subjects immediately when entering Grades
    clearSubjectClose();
    setShowSubjectsDesktop(false);
    // Open Grades (cancel any pending close)
    clearGradeClose();
    setShowGradesDesktop(true);
  };
  const leaveGradesMenu = () => {
    // Start delayed close on leave
    clearGradeClose();
    gradeCloseRef.current = setTimeout(
      () => setShowGradesDesktop(false),
      LEAVE_CLOSE_MS
    );
  };

  // ===== Desktop hover handlers for "Select Subject" =====
  const openSubjectsMenu = () => {
    // Close Grades immediately when entering Subjects
    clearGradeClose();
    setShowGradesDesktop(false);
    // Open Subjects (cancel any pending close)
    clearSubjectClose();
    setShowSubjectsDesktop(true);
  };
  const leaveSubjectsMenu = () => {
    // Start delayed close on leave
    clearSubjectClose();
    subjectCloseRef.current = setTimeout(
      () => setShowSubjectsDesktop(false),
      LEAVE_CLOSE_MS
    );
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearGradeClose();
      clearSubjectClose();
    };
  }, []);

  // ===== Desktop click handlers (navigate with query params) =====
  const onClickGrade = (name) => {
    clearGradeClose();
    setShowGradesDesktop(false);
    // 🔗 Navigates to explore with ?grades=
    router.push(`/explore-library?grades=${encodeURIComponent(name)}`);
  };
  const onClickSubject = (name) => {
    clearSubjectClose();
    setShowSubjectsDesktop(false);
    // 🔗 Navigates to explore with ?subjects=
    router.push(`/explore-library?subjects=${encodeURIComponent(name)}`);
  };

  // ===== Login URL logic =====
  // If currently on /explore-library, preserve return path after login
  const loginHref =
    pathname === "/explore-library"
      ? `/login?next=${encodeURIComponent("/explore-library")}`
      : "/login";

  // =========================================
  // Download button state (Create Lesson Preview)
  // When the user generates a lesson, our SlidesPreview page stores the
  // download URL in localStorage under the key `url`. We expose a
  // small download arrow in the header on the preview page so that
  // the presentation can be downloaded from anywhere without hunting
  // for the in‑page button. On click we proxy the file through our
  // Next.js API route to avoid CORS issues. The state below tracks
  // whether a download is available and whether we’re currently
  // downloading.
  const [downloadHref, setDownloadHref] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Pull the download URL from localStorage when the route changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const href = localStorage.getItem("url") || "";
    setDownloadHref(href);
  }, [pathname]);

  async function handleDownloadClick() {
    if (!downloadHref || downloading) return;
    setDownloading(true);
    try {
      // Attempt to proxy the file through our Next.js API first
      const res = await fetch(
        `/api/lesson-builder/slides/download?href=${encodeURIComponent(
          downloadHref
        )}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "slides.pptx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: open the raw URL in a new tab
        window.open(downloadHref, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      console.error("download failed", e);
      window.open(downloadHref, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      {/* ===== HEADER BAR (background gradient, text color, horizontal padding) =====
          TUNE:
          - Colors: from-[#500078] to-[#9500DE]
          - Text color: text-white
          - Side padding: pl-3 pr-3 (adjust or use md:px-8 for larger screens)
      */}
      <header className="w-full bg-gradient-to-r from-[#500078] to-[#9500DE] text-white pl-3 pr-3">
        {/* ===== Inner container (max width, center, spacing) =====
            TUNE:
            - Max width: max-w-[1366px] (change to 1200/1440/etc.)
            - Horizontal padding: px-6 lg:px-12
            - Vertical padding: py-5 (height of header)
            - Flex alignment: items-center justify-between
        */}
        <div className="max-w-[1366px] mx-auto flex items-center justify-between px-6 lg:px-12 py-5 relative">
          {/* ======================= LEFT: LOGO ======================= */}
          <div className="flex items-center space-x-2 z-50">
            <Link href="/">
              {/* 
                Logo wrapper
                TUNE:
                - Extra left padding on md+: md:pl-2
              */}
              <div className="flex items-center md:pl-2">
                <img
                  src="/lessnlogo.svg"
                  alt="Lessn logo"
                  className="md:w-20 h-auto lg:w-30 object-contain"
                  /* 
                    TUNE:
                    - Size: md:w-20 (80px). Note: "w-30" isn't in Tailwind by default. 
                      If you don't have a custom size, use arbitrary value: lg:w-[120px]
                    - object-contain keeps aspect ratio
                  */
                />
              </div>
            </Link>
          </div>

          {/* ======================= CENTER: DESKTOP NAV ======================= 
              Hidden on < lg (appears from 1024px). Mobile uses drawer below.
              TUNE:
              - Gap between items: gap-x-9
              - Text size: text-[14px] (or text-sm)
          */}
          <nav className="hidden lg:flex items-center pl-4 gap-x-9 text-[14px]">
            {/* Nav links (colors change on hover) */}
            <Link href="/explore-library" className="rounded-md hover:text-gray-300 cursor-pointer">
              Explore Library
            </Link>
            <Link href="/create-lesson" className="hover:text-gray-300 cursor-pointer">
              Create a Lesson
            </Link>

            {/* ===== DESKTOP: Select Grade (hover dropdown) =====
               TUNE:
               - Trigger hover color: hover:text-gray-300
               - Dropdown panel: width (w-48), bg (bg-gray-800), hover color for items
            */}
            <div
              className="relative hover:text-gray-300 cursor-pointer"
              onMouseEnter={openGradesMenu}
              onMouseLeave={leaveGradesMenu}
            >
              <div className="flex items-center space-x-1">
                <span>Select Grade</span>
                {/* Caret */}
                <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.961914 0.609619L5.67991 5.39062L10.3079 0.824619" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Dropdown menu */}
              {showGradesDesktop && (
                <ul className="absolute left-0 top-full mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-50">
                  {(grades?.length
                    ? grades.map((g) => g.name) // API list
                    : [
                        // Fallback static list
                        "Pre-K",
                        "Kindergarten",
                        "First Grade",
                        "Second Grade",
                        "Third Grade",
                        "Fourth Grade",
                        "Fifth Grade",
                        "Sixth Grade",
                        "Seventh Grade",
                        "Eighth Grade",
                        "High School",
                      ]
                  ).map((grade, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 text-white border-b border-gray-700 last:border-none hover:bg-[#9500DE] cursor-pointer"
                      onClick={() => onClickGrade(grade)}
                      /* 
                        TUNE ITEM STYLES:
                        - Padding: px-4 py-2
                        - Separator line: border-b border-gray-700
                        - Hover bg: hover:bg-[#9500DE]
                        - Width: parent w-48 (change for longer labels)
                      */
                    >
                      {grade}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ===== DESKTOP: Select Subject (hover dropdown) ===== */}
            <div
              className="relative hover:text-gray-300 cursor-pointer"
              onMouseEnter={openSubjectsMenu}
              onMouseLeave={leaveSubjectsMenu}
            >
              <div className="flex items-center space-x-1">
                <span>Select Subject</span>
                <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.961914 0.609619L5.67991 5.39062L10.3079 0.824619" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {showSubjectsDesktop && (
                <ul className="absolute left-0 top-full mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-50">
                  {(subjects?.length
                    ? subjects.map((s) => s.name) // API list
                    : ["Language arts", "Math", "Science", "Social Studies"] // fallback
                  ).map((subject, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 text-white border-b border-gray-700 last:border-none hover:bg-[#9500DE] cursor-pointer"
                      onClick={() => onClickSubject(subject)}
                    >
                      {subject}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </nav>

          {/* ======================= RIGHT: AUTH + DOWNLOAD + HELP + HAMBURGER ======================= */}
          <div className="flex items-center gap-4 z-50">
            {/* Download button appears only on the create‑lesson preview route when a file is ready */}
            {pathname.startsWith("/create-lesson/preview") && downloadHref && (
              <button
                onClick={handleDownloadClick}
                disabled={downloading}
                title={downloading ? "Preparing your download" : "Download slides"}
                className="hidden md:flex items-center justify-center text-white hover:text-gray-300"
              >
                {downloading ? (
                  // Spinning border – self contained so it doesn’t rely on DaisyUI
                  <span
                    className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  ></span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                    />
                  </svg>
                )}
              </button>
            )}
            {/* Desktop (md+) auth/Help group */}
            <div className="hidden md:flex items-center space-x-6 text-[14px]">
              {/* Login OR Profile */}
              {!session ? (
                <Link href={loginHref} className="flex items-center space-x-1 hover:text-gray-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 9a2 2 0 012-2h5V4l5 5-5 5v-3H5a2 2 0 01-2-2z" />
                  </svg>
                  <span>Login</span>
                </Link>
              ) : (
                <ProfileDropdown showLabel labelClassName="" align="right" />
                /* TUNE: Positioning of the dropdown via `align` prop and container classes */
              )}

              {/* Help button (desktop only) */}
              <div className="hidden lg:flex items-center">
                <img
                  src="/Help.svg"
                  alt="Help"
                  className="ml-1 h-10 w-10 cursor-pointer rounded-full"
                  onClick={() => setHelpOpen(true)}
                  /* 
                    TUNE:
                    - Size: h-10 w-10 (increase for larger hit target)
                    - Shape: rounded-full
                    - Add ring on focus/hover: focus:ring / hover:ring
                  */
                />
              </div>
            </div>

            {/* ===== HAMBURGER (shown on < lg) =====
               Three bars that transform into an "X" when open.
               TUNE:
               - Bar width/height: w-6 h-0.5
               - Color: bg-white
            */}
            <button
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
              className="lg:hidden flex flex-col space-y-1"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span
                className={`block w-6 h-0.5 bg-white transition-transform ${
                  menuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-opacity ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-transform ${
                  menuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>

          {/* ======================= MOBILE OVERLAY (dim the page) ======================= 
              TUNE:
              - Opacity: bg-black/40
              - Transition: duration-300
          */}
          <div
            className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
              menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={closeMenu}
          />

          {/* ======================= MOBILE DRAWER ======================= 
              Slides from the right. Uses transform/transition.
              TUNE:
              - Width: w-full md:w-1/2 (100% mobile, 50% on md+)
              - Background: bg-[#500078] (brand color)
              - Text color: text-white
              - Speed: duration-300
          */}
          <aside
            id="mobile-drawer"
            className={`fixed top-0 right-0 h-full bg-[#500078] text-white z-50 transition-transform duration-300 w-full md:w-1/2 ${
              menuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
          >
            {/* Drawer header (title + close) */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="text-lg font-semibold">Menu</span>
              <button aria-label="Close menu" className="p-2 -m-2" onClick={closeMenu}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {/* TUNE:
                 - Spacing: px-6 py-5
                 - Divider: border-white/10
                 - Title size: text-lg */}
            </div>

            {/* ======= MOBILE NAV CONTENT ======= */}
            <nav className="flex flex-col px-6 py-6 space-y-4 text-base">
              {/* Basic links */}
              <Link href="/explore-library" onClick={closeMenu} className="w-full hover:text-gray-300">
                Explore Library
              </Link>
              <Link href="/create-lesson" onClick={closeMenu} className="w-full hover:text-gray-300">
                Create a Lesson
              </Link>

              {/* ===== MOBILE: Grades expandable (start) ===== */}
              <button
                className="flex items-center justify-between w-full hover:text-gray-300"
                onClick={() => setShowGradesMobile((v) => !v)}
              >
                <span>Grades</span>
                <svg
                  width="11"
                  height="6"
                  viewBox="0 0 11 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${showGradesMobile ? "rotate-180" : ""} transition-transform`}
                >
                  <path
                    d="M0.961914 0.609619L5.67991 5.39062L10.3079 0.824619"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {showGradesMobile && (
                <div className="ml-2 mt-1 space-y-2">
                  {(grades?.length
                    ? grades.map((g) => g.name) // API list
                    : [
                        "Pre-K",
                        "Kindergarten",
                        "First Grade",
                        "Second Grade",
                        "Third Grade",
                        "Fourth Grade",
                        "Fifth Grade",
                        "Sixth Grade",
                        "Seventh Grade",
                        "Eighth Grade",
                        "High School",
                      ]
                  ).map((name) => (
                    <Link
                      key={name}
                      href={`/explore-library?grades=${encodeURIComponent(name)}`}
                      onClick={closeMenu}
                      className="block hover:text-gray-300"
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              )}
              {/* ===== MOBILE: Grades expandable (end) ===== */}

              {/* ===== MOBILE: Subjects expandable (start) ===== */}
              <button
                className="flex items-center justify-between w-full hover:text-gray-300"
                onClick={() => setShowSubjectsMobile((v) => !v)}
              >
                <span>Subjects</span>
                <svg
                  width="11"
                  height="6"
                  viewBox="0 0 11 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${showSubjectsMobile ? "rotate-180" : ""} transition-transform`}
                >
                  <path
                    d="M0.961914 0.609619L5.67991 5.39062L10.3079 0.824619"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {showSubjectsMobile && (
                <div className="ml-2 mt-1 space-y-2">
                  {(subjects?.length
                    ? subjects.map((s) => s.name) // API list
                    : ["Language arts", "Math", "Science", "Social Studies"] // fallback
                  ).map((name) => (
                    <Link
                      key={name}
                      href={`/explore-library?subjects=${encodeURIComponent(name)}`}
                      onClick={closeMenu}
                      className="block hover:text-gray-300"
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              )}
              {/* ===== MOBILE: Subjects expandable (end) ===== */}

              <hr className="border-white/10 my-2" />

              {/* Auth links (mobile) */}
              {!session ? (
                <Link href={loginHref} onClick={closeMenu} className="pl-1 hover:text-gray-300">
                  Login
                </Link>
              ) : (
                <>
                  <Link href="/profile" onClick={closeMenu} className="pl-1 hover:text-gray-300">
                    My Profile
                  </Link>
                  <Link href="/library" onClick={closeMenu} className="pl-1 hover:text-gray-300">
                    My Library
                  </Link>
                  <Link href="/pricing" onClick={closeMenu} className="pl-1 hover:text-gray-300">
                    Pricing & Subscription
                  </Link>
                </>
              )}
            </nav>
          </aside>
        </div>
      </header>

      {/* ===== HELP POPUP (modal) ===== */}
      {helpOpen && <HelpPopup open={helpOpen} onClose={() => setHelpOpen(false)} />}
    </>
  );
};

export default Header;


