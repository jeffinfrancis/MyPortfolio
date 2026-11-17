import { useCallback, useEffect, useState } from 'react';
import { api, messageOf } from '../../../services/api';

// Load a list from the API and expose create / update / remove.
export function useResource<T extends { _id: string }>(path: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setItems(await api.get<T[]>(path));
      setError(null);
    } catch (caught) {
      setError(messageOf(caught));
    }
  }, [path]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchItems().finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [fetchItems]);

  // After any change we re-fetch so the list matches the server's ordering.
  // Errors propagate to the calling form so it can show them.
  const create = useCallback(
    async (body: unknown) => {
      await api.post<T>(path, body);
      await fetchItems();
    },
    [path, fetchItems]
  );

  const update = useCallback(
    async (id: string, body: unknown) => {
      await api.put<T>(`${path}/${id}`, body);
      await fetchItems();
    },
    [path, fetchItems]
  );

  const remove = useCallback(
    async (id: string) => {
      await api.del(`${path}/${id}`);
      await fetchItems();
    },
    [path, fetchItems]
  );

  return { items, loading, error, reload: fetchItems, create, update, remove };
}