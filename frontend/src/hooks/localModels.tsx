import { useState, useEffect, useCallback } from "react";
import type { ModelInfo } from "../types";
import { FALLBACK_MODELS } from "../types";

interface UseLocalModelsResult {
  models: ModelInfo[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useLocalModels(): UseLocalModelsResult {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/tags");
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          const fetched: ModelInfo[] = data.models.map((m: any) => ({
            value: m.name,
            label: m.name,
          }));
          setModels(fetched);
          setSelectedModel((prev) =>
            fetched.find((m) => m.value === prev) ? prev : fetched[0].value
          );
          return;
        }
      }
    } catch {
      // server not available — fall through to fallback
    }
    setModels(FALLBACK_MODELS);
    setSelectedModel((prev) => prev || FALLBACK_MODELS[0].value);
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchModels();
      setLoading(false);
    };
    init();
  }, [fetchModels]);

  return { models, selectedModel, setSelectedModel, loading, refetch: fetchModels };
}
