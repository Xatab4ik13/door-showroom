import { useState, useEffect } from 'react';
import { fetchFacets, type Facets } from '@/lib/api';

export function useFacets() {
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacets()
      .then(setFacets)
      .catch((err) => console.warn('[useFacets] unavailable:', err.message))
      .finally(() => setLoading(false));
  }, []);

  return { facets, loading };
}
