import { useState, useEffect, useCallback } from "react";
import type { Persona } from "../types";

interface UsePersonasResult {
  personas: Persona[];
  loading: boolean;
  refetch: () => Promise<void>;
}

export function usePersonas(): UsePersonasResult {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPersonas = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/custom_models");
      if (res.ok) {
        const data: Persona[] = await res.json();
        setPersonas(data);
      }
    } catch {
      // backend not available
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  return { personas, loading, refetch: fetchPersonas };
}
