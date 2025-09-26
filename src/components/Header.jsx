

// components/Header.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import HelpPopup from "@/components/HelpPopup";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProfileDropdown from "@/components/ProfileDropdown";

/**
 * EagerLink: prefetches on hover/touch and navigates instantly on pointerdown.
 * Also turns the hover region into a fully clickable block.
 */
const EagerLink = ({
  href,
  children,
  className,
  prefetch = true,
  onNavigate,
  ...rest
}) => {
  const router = useRouter();
  const pushedRef = useRef(false);

  const doPrefetch = () => {
    try {
      router.prefetch(href);
    } catch {}
  };

  const goNow = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
    e.preventDefault?.();
    if (pushedRef.current) return;
    pushedRef.current = true;
    try {
      onNavigate?.();
    } catch {}
    router.push(href);
  };

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={className}
      onPointerEnter={doPrefetch}
      onTouchStart={doPrefetch}
      onPointerDown={goNow}
      onClick={(e) => {
        if (!pushedRef.current) goNow(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
};

/**
 * Header component (updated):
 * - Navbar links are block-level with purple hover like Hero.
 * - Uses EagerLink for eager prefetch + instant navigation.
 * - "Login" replaced by "Get Started" (desktop & mobile).
 */
const Header = () => {
  const { data: session } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showGradesDesktop, setShowGradesDesktop] = useState(false);
  const [showSubjectsDesktop, setShowSubjectsDesktop] = useState(false);
  const [showGradesMobile, setShowGradesMobile] = useState(false);
  const [showSubjectsMobile, setShowSubjectsMobile] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Fetch dropdown data once on mount
  useEffect(() => {
    fetch("/api/meta/subjects", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setSubjects(data) : setSubjects([])))
      .catch(() => setSubjects([]));

    fetch("/api/meta/grades", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setGrades(data) : setGrades([])))
      .catch(() => setGrades([]));
  }, []);

  // Lock body scroll when the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  // Desktop dropdown timing
  const LEAVE_CLOSE_MS = 500;
  const gradeCloseRef = useRef(null);
  const subjectCloseRef = useRef(null);

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

  const openGradesMenu = () => {
    clearSubjectClose();
    setShowSubjectsDesktop(false);
    clearGradeClose();
    setShowGradesDesktop(true);
  };
  const leaveGradesMenu = () => {
    clearGradeClose();
    gradeCloseRef.current = setTimeout(
      () => setShowGradesDesktop(false),
      LEAVE_CLOSE_MS
    );
  };

  const openSubjectsMenu = () => {
    clearGradeClose();
    setShowGradesDesktop(false);
    clearSubjectClose();
    setShowSubjectsDesktop(true);
  };
  const leaveSubjectsMenu = () => {
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

  const onClickGrade = (name) => {
    clearGradeClose();
    setShowGradesDesktop(false);
    router.push(`/explore-library?grades=${encodeURIComponent(name)}`);
  };
  const onClickSubject = (name) => {
    clearSubjectClose();
    setShowSubjectsDesktop(false);
    router.push(`/explore-library?subjects=${encodeURIComponent(name)}`);
  };

  // Keep existing behavior: if login is used anywhere else, ensure redirect to Explore Library
  const loginHref =
    pathname === "/explore-library"
      ? `/login?next=${encodeURIComponent("/explore-library")}`
      : "/login?next=%2Fexplore-library";

  return (
    <>
      {/* HEADER BAR */}
      <header className="w-full bg-gradient-to-r from-[#500078] to-[#9500DE] text-white pl-3 pr-3">
        <div className="max-w-[1366px] mx-auto flex items-center justify-between px-6 lg:px-12 py-5 relative">
          {/* Left: Logo */}
          <div className="flex items-center space-x-2 z-50">
            <EagerLink href="/" prefetch aria-label="Lessn Home" className="block cursor-pointer">
              <div className="flex items-center md:pl-2">
                <img
                  src="/lessnlogo.svg"
                  alt="Lessn logo"
                  className="md:w-20 h-auto lg:w-[120px] object-contain"
                />
              </div>
            </EagerLink>
          </div>

          {/* Center: Desktop navigation (Hero-style hover + EagerLink) */}
          <nav className="hidden lg:flex items-center pl-4 gap-x-2 text-[14px]">
            <EagerLink
              href="/explore-library"
              prefetch
              className="block px-2 py-2 rounded-sm cursor-pointer hover:bg-[#9500DE] transition"
            >
              Explore Library
            </EagerLink>

            <EagerLink
              href="/my-lessons"
              prefetch
              className="block px-2 py-2 rounded-sm cursor-pointer hover:bg-[#9500DE] transition"
            >
              My Lessons
            </EagerLink>

            <EagerLink
              href="/create-lesson"
              prefetch
              className="block px-2 py-2 rounded-sm cursor-pointer hover:bg-[#9500DE] transition"
            >
              Create a Lesson
            </EagerLink>

            {/* Select Grade (button remains, hover area clickable like Hero) */}
            <div
              className="relative"
              onMouseEnter={openGradesMenu}
              onMouseLeave={leaveGradesMenu}
            >
              <button
                type="button"
                className="flex items-center space-x-1 transition hover:bg-[#9500DE] px-2 py-2 rounded-sm cursor-pointer"
              >
                <span>Select Grade</span>
                <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5">
                  <path d="M0.961914 0.609619L5.67991 5.39062L10.3079 0.824619" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showGradesDesktop && (
                <ul className="absolute left-0 top-full mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-50">
                  {(grades?.length
                    ? grades.map((g) => g.name)
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
                  ).map((grade, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 text-white border-b border-gray-700 last:border-none hover:bg-[#9500DE] cursor-pointer"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        onClickGrade(grade);
                      }}
                    >
                      {grade}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Select Subject */}
            <div
              className="relative"
              onMouseEnter={openSubjectsMenu}
              onMouseLeave={leaveSubjectsMenu}
            >
              <button
                type="button"
                className="flex items-center space-x-1 transition hover:bg-[#9500DE] px-2 py-2 rounded-sm cursor-pointer"
              >
                <span>Select Subject</span>
                <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5">
                  <path d="M0.961914 0.609619L5.67991 5.39062L10.3079 0.824619" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showSubjectsDesktop && (
                <ul className="absolute left-0 top-full mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-50">
                  {(subjects?.length
                    ? subjects.map((s) => s.name)
                    : ["Language arts", "Math", "Science", "Social Studies"]
                  ).map((subject, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 text-white border-b border-gray-700 last:border-none hover:bg-[#9500DE] cursor-pointer"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        onClickSubject(subject);
                      }}
                    >
                      {subject}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </nav>

          {/* Right: auth / help / hamburger */}
          <div className="flex items-center gap-4 z-50">
            {/* Desktop (md+) auth/Help group */}
            <div className="hidden md:flex items-center space-x-6 text-[14px]">
              {!session ? (
                // Get Started (copied style from HeroSection)
                <EagerLink
                  href="/get-started"
                  prefetch
                  className="block transition cursor-pointer px-4 py-2 border border-white rounded-full text-white hover:bg-[#500078]"
                >
                  Get Started
                </EagerLink>
              ) : (
                <ProfileDropdown showLabel labelClassName="" align="right" />
              )}

              {/* Help button (desktop only) */}
              <div className="hidden lg:flex items-center">
                <img
                  src="/Help.svg"
                  alt="Help"
                  className="ml-1 h-10 w-10 cursor-pointer rounded-full"
                  onClick={() => setHelpOpen(true)}
                />
              </div>
            </div>

            {/* Hamburger for mobile */}
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

          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
              menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={closeMenu}
          />

          {/* Mobile drawer */}
          <aside
            id="mobile-drawer"
            className={`fixed top-0 right-0 h-full bg-[#500078] text-white z-50 transition-transform duration-300 w-full md:w-1/2 ${
              menuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="text-lg font-semibold">Menu</span>
              <button aria-label="Close menu" className="p-2 -m-2" onClick={closeMenu}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col px-6 py-6 space-y-4 text-base">
              {/* Basic links */}
              <EagerLink
                href="/explore-library"
                prefetch
                className="block hover:bg-[#9500DE] px-2 py-2 rounded-sm cursor-pointer"
                onNavigate={closeMenu}
              >
                Explore Library
              </EagerLink>

              <EagerLink
                href="/my-lessons"
                prefetch
                className="block hover:bg-[#9500DE] px-2 py-2 rounded-sm cursor-pointer"
                onNavigate={closeMenu}
              >
                My Lessons
              </EagerLink>

              <EagerLink
                href="/create-lesson"
                prefetch
                className="block hover:bg-[#9500DE] px-2 py-2 rounded-sm cursor-pointer"
                onNavigate={closeMenu}
              >
                Create a Lesson
              </EagerLink>

              {/* Mobile: Grades expandable */}
              <button
                className="flex items-center justify-between w-full hover:bg-[#9500DE] px-2 py-2 rounded-sm cursor-pointer"
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
                    ? grades.map((g) => g.name)
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
                    <EagerLink
                      key={name}
                      href={`/explore-library?grades=${encodeURIComponent(name)}`}
                      prefetch
                      className="block hover:bg-[#9500DE] px-2 py-2 rounded-sm cursor-pointer"
                      onNavigate={closeMenu}
                    >
                      {name}
                    </EagerLink>
                  ))}
                </div>
              )}

              {/* Mobile: Subjects expandable */}
              <button
                className="flex items-center justify-between w-full hover:bg-[#9500DE] px-2 py-2 rounded-sm cursor-pointer"
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
                    ? subjects.map((s) => s.name)
                    : ["Language arts", "Math", "Science", "Social Studies"]
                  ).map((name) => (
                    <EagerLink
                      key={name}
                      href={`/explore-library?subjects=${encodeURIComponent(name)}`}
                      prefetch
                      className="block hover:bg-[#9500DE] px-2 py-2 rounded-sm cursor-pointer"
                      onNavigate={closeMenu}
                    >
                      {name}
                    </EagerLink>
                  ))}
                </div>
              )}

              <hr className="border-white/10 my-2" />

              {/* Auth links (mobile) */}
              {!session ? (
                <EagerLink
                  href="/get-started"
                  prefetch
                  className="block transition cursor-pointer px-4 py-2 border border-white rounded-full text-white w-fit hover:bg-[#9500DE]"
                  onNavigate={closeMenu}
                >
                  Get Started
                </EagerLink>
              ) : (
                <>
                  <EagerLink
                    href="/profile"
                    prefetch
                    onNavigate={closeMenu}
                    className="block hover:bg-[#9500DE] px-2 py-2 rounded-sm cursor-pointer"
                  >
                    My Profile
                  </EagerLink>
                  <EagerLink
                    href="/library"
                    prefetch
                    onNavigate={closeMenu}
                    className="block hover:bg-[#9500DE] px-2 py-2 rounded-sm cursor-pointer"
                  >
                    My Library
                  </EagerLink>
                  <EagerLink
                    href="/pricing"
                    prefetch
                    onNavigate={closeMenu}
                    className="block hover:bg-[#9500DE] px-2 py-2 rounded-sm cursor-pointer"
                  >
                    Pricing & Subscription
                  </EagerLink>
                </>
              )}
            </nav>
          </aside>
        </div>
      </header>

      {/* Help Popup */}
      {helpOpen && <HelpPopup open={helpOpen} onClose={() => setHelpOpen(false)} />}
    </>
  );
};

export default Header;












































// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import HelpPopup from "@/components/HelpPopup";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import ProfileDropdown from "@/components/ProfileDropdown";

// /**
//  * Header component without slide download logic.
//  *
//  * This header provides navigation links, grade/subject selection menus, authentication
//  * actions, help popup trigger and a mobile drawer. All download-related state and
//  * behaviour have been removed according to the updated requirements. Styling
//  * follows a purple gradient brand bar consistent with the rest of the application.
//  */
// const Header = () => {
//   const { data: session } = useSession();

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [helpOpen, setHelpOpen] = useState(false);
//   const [grades, setGrades] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [showGradesDesktop, setShowGradesDesktop] = useState(false);
//   const [showSubjectsDesktop, setShowSubjectsDesktop] = useState(false);
//   const [showGradesMobile, setShowGradesMobile] = useState(false);
//   const [showSubjectsMobile, setShowSubjectsMobile] = useState(false);

//   const router = useRouter();
//   const pathname = usePathname();

//   // Fetch dropdown data once on mount
//   useEffect(() => {
//     fetch("/api/meta/subjects", { cache: "no-store" })
//       .then((r) => r.json())
//       .then((data) => (Array.isArray(data) ? setSubjects(data) : setSubjects([])))
//       .catch(() => setSubjects([]));

//     fetch("/api/meta/grades", { cache: "no-store" })
//       .then((r) => r.json())
//       .then((data) => (Array.isArray(data) ? setGrades(data) : setGrades([])))
//       .catch(() => setGrades([]));
//   }, []);

//   // Lock body scroll when the mobile drawer is open
//   useEffect(() => {
//     document.body.style.overflow = menuOpen ? "hidden" : "";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [menuOpen]);

//   const closeMenu = () => setMenuOpen(false);

//   // Desktop dropdown timing
//   const LEAVE_CLOSE_MS = 500;
//   const gradeCloseRef = useRef(null);
//   const subjectCloseRef = useRef(null);

//   const clearGradeClose = () => {
//     if (gradeCloseRef.current) {
//       clearTimeout(gradeCloseRef.current);
//       gradeCloseRef.current = null;
//     }
//   };
//   const clearSubjectClose = () => {
//     if (subjectCloseRef.current) {
//       clearTimeout(subjectCloseRef.current);
//       subjectCloseRef.current = null;
//     }
//   };

//   const openGradesMenu = () => {
//     clearSubjectClose();
//     setShowSubjectsDesktop(false);
//     clearGradeClose();
//     setShowGradesDesktop(true);
//   };
//   const leaveGradesMenu = () => {
//     clearGradeClose();
//     gradeCloseRef.current = setTimeout(
//       () => setShowGradesDesktop(false),
//       LEAVE_CLOSE_MS
//     );
//   };

//   const openSubjectsMenu = () => {
//     clearGradeClose();
//     setShowGradesDesktop(false);
//     clearSubjectClose();
//     setShowSubjectsDesktop(true);
//   };
//   const leaveSubjectsMenu = () => {
//     clearSubjectClose();
//     subjectCloseRef.current = setTimeout(
//       () => setShowSubjectsDesktop(false),
//       LEAVE_CLOSE_MS
//     );
//   };

//   // Cleanup timers on unmount
//   useEffect(() => {
//     return () => {
//       clearGradeClose();
//       clearSubjectClose();
//     };
//   }, []);

//   const onClickGrade = (name) => {
//     clearGradeClose();
//     setShowGradesDesktop(false);
//     router.push(`/explore-library?grades=${encodeURIComponent(name)}`);
//   };
//   const onClickSubject = (name) => {
//     clearSubjectClose();
//     setShowSubjectsDesktop(false);
//     router.push(`/explore-library?subjects=${encodeURIComponent(name)}`);
//   };

//   const loginHref =
//     pathname === "/explore-library"
//       ? `/login?next=${encodeURIComponent("/explore-library")}`
//       : "/login";

//   return (
//     <>
//       {/* HEADER BAR */}
//       <header className="w-full bg-gradient-to-r from-[#500078] to-[#9500DE] text-white pl-3 pr-3">
//         <div className="max-w-[1366px] mx-auto flex items-center justify-between px-6 lg:px-12 py-5 relative">
//           {/* Left: Logo */}
//           <div className="flex items-center space-x-2 z-50">
//             <Link href="/">
//               <div className="flex items-center md:pl-2">
//                 <img
//                   src="/lessnlogo.svg"
//                   alt="Lessn logo"
//                   className="md:w-20 h-auto lg:w-[120px] object-contain"
//                 />
//               </div>
//             </Link>
//           </div>
//           {/* Center: Desktop navigation */}
//           <nav className="hidden lg:flex items-center pl-4 gap-x-9 text-[14px]">
//             <Link href="/explore-library" className="rounded-md hover:text-gray-300 cursor-pointer">
//               Explore Library
//             </Link>

//             {/* NEW: My Lessons */}
//             <Link href="/my-lessons" className="rounded-md hover:text-gray-300 cursor-pointer">
//               My Lessons
//             </Link>

//             <Link href="/create-lesson" className="hover:text-gray-300 cursor-pointer">
//               Create a Lesson
//             </Link>
//             {/* Select Grade */}
//             <div
//               className="relative hover:text-gray-300 cursor-pointer"
//               onMouseEnter={openGradesMenu}
//               onMouseLeave={leaveGradesMenu}
//             >
//               <div className="flex items-center space-x-1">
//                 <span>Select Grade</span>
//                 <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M0.961914 0.609619L5.67991 5.39062L10.3079 0.824619" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//               </div>
//               {showGradesDesktop && (
//                 <ul className="absolute left-0 top-full mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-50">
//                   {(grades?.length
//                     ? grades.map((g) => g.name)
//                     : [
//                         "Pre-K",
//                         "Kindergarten",
//                         "First Grade",
//                         "Second Grade",
//                         "Third Grade",
//                         "Fourth Grade",
//                         "Fifth Grade",
//                         "Sixth Grade",
//                         "Seventh Grade",
//                         "Eighth Grade",
//                         "High School",
//                       ]
//                   ).map((grade, idx) => (
//                     <li
//                       key={idx}
//                       className="px-4 py-2 text-white border-b border-gray-700 last:border-none hover:bg-[#9500DE] cursor-pointer"
//                       onClick={() => onClickGrade(grade)}
//                     >
//                       {grade}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//             {/* Select Subject */}
//             <div
//               className="relative hover:text-gray-300 cursor-pointer"
//               onMouseEnter={openSubjectsMenu}
//               onMouseLeave={leaveSubjectsMenu}
//             >
//               <div className="flex items-center space-x-1">
//                 <span>Select Subject</span>
//                 <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M0.961914 0.609619L5.67991 5.39062L10.3079 0.824619" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//               </div>
//               {showSubjectsDesktop && (
//                 <ul className="absolute left-0 top-full mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-50">
//                   {(subjects?.length
//                     ? subjects.map((s) => s.name)
//                     : ["Language arts", "Math", "Science", "Social Studies"]
//                   ).map((subject, idx) => (
//                     <li
//                       key={idx}
//                       className="px-4 py-2 text-white border-b border-gray-700 last:border-none hover:bg-[#9500DE] cursor-pointer"
//                       onClick={() => onClickSubject(subject)}
//                     >
//                       {subject}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </nav>
//           {/* Right: auth / help / hamburger */}
//           <div className="flex items-center gap-4 z-50">
//             {/* Desktop (md+) auth/Help group */}
//             <div className="hidden md:flex items-center space-x-6 text-[14px]">
//               {!session ? (
//                 <Link href={loginHref} className="flex items-center space-x-1 hover:text-gray-300">
//                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M3 9a2 2 0 012-2h5V4l5 5-5 5v-3H5a2 2 0 01-2-2z" />
//                   </svg>
//                   <span>Login</span>
//                 </Link>
//               ) : (
//                 <ProfileDropdown showLabel labelClassName="" align="right" />
//               )}
//               {/* Help button (desktop only) */}
//               <div className="hidden lg:flex items-center">
//                 <img
//                   src="/Help.svg"
//                   alt="Help"
//                   className="ml-1 h-10 w-10 cursor-pointer rounded-full"
//                   onClick={() => setHelpOpen(true)}
//                 />
//               </div>
//             </div>
//             {/* Hamburger for mobile */}
//             <button
//               aria-label="Open menu"
//               aria-expanded={menuOpen}
//               aria-controls="mobile-drawer"
//               className="lg:hidden flex flex-col space-y-1"
//               onClick={() => setMenuOpen((o) => !o)}
//             >
//               <span
//                 className={`block w-6 h-0.5 bg-white transition-transform ${
//                   menuOpen ? "translate-y-[6px] rotate-45" : ""
//                 }`}
//               />
//               <span
//                 className={`block w-6 h-0.5 bg-white transition-opacity ${
//                   menuOpen ? "opacity-0" : "opacity-100"
//                 }`}
//               />
//               <span
//                 className={`block w-6 h-0.5 bg-white transition-transform ${
//                   menuOpen ? "-translate-y-[6px] -rotate-45" : ""
//                 }`}
//               />
//             </button>
//           </div>
//           {/* Overlay */}
//           <div
//             className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
//               menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
//             }`}
//             onClick={closeMenu}
//           />
//           {/* Mobile drawer */}
//           <aside
//             id="mobile-drawer"
//             className={`fixed top-0 right-0 h-full bg-[#500078] text-white z-50 transition-transform duration-300 w-full md:w-1/2 ${
//               menuOpen ? "translate-x-0" : "translate-x-full"
//             }`}
//             role="dialog"
//             aria-modal="true"
//           >
//             <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
//               <span className="text-lg font-semibold">Menu</span>
//               <button aria-label="Close menu" className="p-2 -m-2" onClick={closeMenu}>
//                 <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
//                   <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//                 </svg>
//               </button>
//             </div>
//             <nav className="flex flex-col px-6 py-6 space-y-4 text-base">
//               {/* Basic links */}
//               <Link href="/explore-library" onClick={closeMenu} className="w-full hover:text-gray-300">
//                 Explore Library
//               </Link>

//               {/* NEW: My Lessons */}
//               <Link href="/my-lessons" onClick={closeMenu} className="w-full hover:text-gray-300">
//                 My Lessons
//               </Link>

//               <Link href="/create-lesson" onClick={closeMenu} className="w-full hover:text-gray-300">
//                 Create a Lesson
//               </Link>
//               {/* Mobile: Grades expandable */}
//               <button
//                 className="flex items-center justify-between w-full hover:text-gray-300"
//                 onClick={() => setShowGradesMobile((v) => !v)}
//               >
//                 <span>Grades</span>
//                 <svg
//                   width="11"
//                   height="6"
//                   viewBox="0 0 11 6"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                   className={`${showGradesMobile ? "rotate-180" : ""} transition-transform`}
//                 >
//                   <path
//                     d="M0.961914 0.609619L5.67991 5.39062L10.3079 0.824619"
//                     stroke="white"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//               </button>
//               {showGradesMobile && (
//                 <div className="ml-2 mt-1 space-y-2">
//                   {(grades?.length
//                     ? grades.map((g) => g.name)
//                     : [
//                         "Pre-K",
//                         "Kindergarten",
//                         "First Grade",
//                         "Second Grade",
//                         "Third Grade",
//                         "Fourth Grade",
//                         "Fifth Grade",
//                         "Sixth Grade",
//                         "Seventh Grade",
//                         "Eighth Grade",
//                         "High School",
//                       ]
//                   ).map((name) => (
//                     <Link
//                       key={name}
//                       href={`/explore-library?grades=${encodeURIComponent(name)}`}
//                       onClick={closeMenu}
//                       className="block hover:text-gray-300"
//                     >
//                       {name}
//                     </Link>
//                   ))}
//                 </div>
//               )}
//               {/* Mobile: Subjects expandable */}
//               <button
//                 className="flex items-center justify-between w-full hover:text-gray-300"
//                 onClick={() => setShowSubjectsMobile((v) => !v)}
//               >
//                 <span>Subjects</span>
//                 <svg
//                   width="11"
//                   height="6"
//                   viewBox="0 0 11 6"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                   className={`${showSubjectsMobile ? "rotate-180" : ""} transition-transform`}
//                 >
//                   <path
//                     d="M0.961914 0.609619L5.67991 5.39062L10.3079 0.824619"
//                     stroke="white"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//               </button>
//               {showSubjectsMobile && (
//                 <div className="ml-2 mt-1 space-y-2">
//                   {(subjects?.length
//                     ? subjects.map((s) => s.name)
//                     : ["Language arts", "Math", "Science", "Social Studies"]
//                   ).map((name) => (
//                     <Link
//                       key={name}
//                       href={`/explore-library?subjects=${encodeURIComponent(name)}`}
//                       onClick={closeMenu}
//                       className="block hover:text-gray-300"
//                     >
//                       {name}
//                     </Link>
//                   ))}
//                 </div>
//               )}
//               <hr className="border-white/10 my-2" />
//               {/* Auth links (mobile) */}
//               {!session ? (
//                 <Link href={loginHref} onClick={closeMenu} className="pl-1 hover:text-gray-300">
//                   Login
//                 </Link>
//               ) : (
//                 <>
//                   <Link href="/profile" onClick={closeMenu} className="pl-1 hover:text-gray-300">
//                     My Profile
//                   </Link>
//                   <Link href="/library" onClick={closeMenu} className="pl-1 hover:text-gray-300">
//                     My Library
//                   </Link>
//                   <Link href="/pricing" onClick={closeMenu} className="pl-1 hover:text-gray-300">
//                     Pricing & Subscription
//                   </Link>
//                 </>
//               )}
//             </nav>
//           </aside>
//         </div>
//       </header>
//       {/* Help Popup */}
//       {helpOpen && <HelpPopup open={helpOpen} onClose={() => setHelpOpen(false)} />}
//     </>
//   );
// };

// export default Header;































































