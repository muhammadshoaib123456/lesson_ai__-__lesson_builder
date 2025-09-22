"use client";

import { useState } from "react";

export default function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-ghost text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-25" onClick={() => setIsOpen(false)}></div>
          <nav className="fixed top-0 right-0 bottom-0 flex flex-col w-64 bg-white shadow-xl">
            <div className="p-4">
              <button onClick={() => setIsOpen(false)} className="btn btn-ghost">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4">
              <a href="/" className="block py-2">Home</a>
              <a href="/create-lesson" className="block py-2">Create Lesson</a>
              <a href="/explore-library" className="block py-2">Explore Library</a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}