import { useState, useEffect } from 'react';

/**
 * Hook to fetch summary.json and lazily load per-screen reports
 */
export function useReports() {
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch summary on mount
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/reports/summary.json');
        if (!res.ok) throw new Error('Failed to load summary.json');
        const data = await res.json();
        setSummary(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Fetch a specific screen's report (lazy load)
  const fetchScreen = async (screenId) => {
    if (reports[screenId]) return; // Already loaded

    try {
      const res = await fetch(`/reports/${screenId}.json`);
      if (!res.ok) throw new Error(`Failed to load ${screenId}.json`);
      const data = await res.json();
      setReports((prev) => ({ ...prev, [screenId]: data }));
    } catch (err) {
      console.error(`Failed to fetch screen ${screenId}:`, err);
      setError(err.message);
    }
  };

  return { summary, reports, fetchScreen, loading, error };
}
