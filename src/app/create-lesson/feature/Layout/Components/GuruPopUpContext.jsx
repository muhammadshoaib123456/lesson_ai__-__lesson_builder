"use client";

import React, { createContext, useState } from "react";

// 1. Create the context
const PopupContext = createContext();

// 2. Create the provider component
export const PopupProvider = ({ children }) => {
  // Declare the state here
  const [showPopup, setShowPopup] = useState(false);

  return (
    // Provide the state and updater to the children
    <PopupContext.Provider value={{ showPopup, setShowPopup }}>
      {children}
    </PopupContext.Provider>
  );
};

// 3. Export the context itself for use in other files
export default PopupContext;