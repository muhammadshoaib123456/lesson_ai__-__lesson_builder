"use client";

import React, { useEffect } from 'react';

function GoogleAnalytics() {
  useEffect(() => {
    // Initialize GA4 with dynamic import for Next.js
    const initGA = async () => {
      if (typeof window !== 'undefined') {
        const ReactGA = (await import('react-ga4')).default;
        ReactGA.initialize('G-BXDKQ009B2');
        
        const trackPageView = () => {
          ReactGA.send({ 
            hitType: 'pageview', 
            page: window.location.pathname + window.location.search 
          });
        };
        
        trackPageView();
      }
    };
    
    initGA();
  }, []);

  return null; // No JSX needed here
}

export const pushToDataLayer = (event) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  }
};

export default GoogleAnalytics;