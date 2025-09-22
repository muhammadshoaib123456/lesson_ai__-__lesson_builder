"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export function useUsageLimit() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUsage = async () => {
    try {
      const response = await fetch('/api/lesson-builder/usage', { cache: 'no-store' });
      const data = await response.json();
      setUsage(data);
    } catch (error) {
      console.error('Error checking usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async () => {
    try {
      await fetch('/api/lesson-builder/usage', { method: 'POST' });
      await checkUsage();
    } catch (error) {
      console.error('Error updating usage:', error);
    }
  };

  const canCreateSlides = () => !!usage?.canCreateSlides;

  const showLimitWarning = () => {
    if (!usage) return;
    if (!usage.hasSubscription && Number(usage.remainingSlides) <= 1) {
      toast.warning(
        `You have ${usage.remainingSlides} slide creation remaining. Upgrade for unlimited access!`
      );
    }
  };

  const showLimitReached = () => {
    toast.error('Free limit reached! Upgrade to Pro for unlimited slide creation.');
  };

  useEffect(() => { checkUsage(); }, []);

  return {
    usage,
    loading,
    checkUsage,
    incrementUsage,
    canCreateSlides,
    showLimitWarning,
    showLimitReached
  };
}
