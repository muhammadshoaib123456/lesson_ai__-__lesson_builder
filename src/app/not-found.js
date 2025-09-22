"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-purple-700 via-indigo-800 to-black text-white text-center px-6">
      {/* Animated emoji */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="text-[5rem] mb-4"
      >
        😢
      </motion.div>

      {/* Big 404 */}
      <h1 className="text-[8rem] font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600 animate-pulse">
        404
      </h1>

      {/* Message */}
      <p className="text-2xl mt-4 font-semibold">Oops! Lost in Space 🚀</p>
      <p className="text-gray-300 mt-2 max-w-lg">
        This page wandered off somewhere. Even our emoji is sad about it.
        But hey, you can still head back safely!
      </p>

      {/* Button */}
      <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }}>
        <Link
          href="/"
          className="mt-8 inline-block px-8 py-3 text-lg font-medium rounded-xl shadow-lg 
            bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 
            transition-all duration-300 ease-in-out"
        >
          Take Me Home
        </Link>
      </motion.div>

      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 bg-purple-500 opacity-30 rounded-full blur-3xl top-10 left-10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-pink-500 opacity-30 rounded-full blur-3xl bottom-10 right-10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 8, delay: 1 }}
        />
      </div>
    </div>
  );
}
