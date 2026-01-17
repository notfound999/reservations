import { useState, useEffect, useCallback } from 'react';
import type { TimeSlot } from '@/lib/types';

const DRAFT_STORAGE_KEY = 'booking_draft';
const DRAFT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface BookingDraft {
  businessId: string;
  offeringId: string;
  selectedDate: string; // ISO date string
  selectedSlot: TimeSlot | null;
  notes: string;
  timestamp: number;
}

export function useBookingDraft(businessId: string, offeringId: string) {
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!stored) return;

      const parsed: BookingDraft = JSON.parse(stored);

      // Check if draft is for the same business and offering
      if (parsed.businessId !== businessId || parsed.offeringId !== offeringId) {
        return;
      }

      // Check if draft has expired (24 hours)
      const isExpired = Date.now() - parsed.timestamp > DRAFT_TTL;
      if (isExpired) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return;
      }

      setDraft(parsed);
      setHasDraft(true);
    } catch (error) {
      console.error('Failed to load booking draft:', error);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [businessId, offeringId]);

  // Save draft to localStorage (debounced by caller)
  const saveDraft = useCallback(
    (draftData: Omit<BookingDraft, 'businessId' | 'offeringId' | 'timestamp'>) => {
      try {
        const fullDraft: BookingDraft = {
          businessId,
          offeringId,
          ...draftData,
          timestamp: Date.now(),
        };

        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(fullDraft));
        setDraft(fullDraft);
        setHasDraft(true);
      } catch (error) {
        console.error('Failed to save booking draft:', error);
      }
    },
    [businessId, offeringId]
  );

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraft(null);
      setHasDraft(false);
    } catch (error) {
      console.error('Failed to clear booking draft:', error);
    }
  }, []);

  // Restore draft (returns the draft data)
  const restoreDraft = useCallback(() => {
    return draft;
  }, [draft]);

  return {
    draft,
    hasDraft,
    saveDraft,
    clearDraft,
    restoreDraft,
  };
}
