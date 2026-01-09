import { useState, useEffect } from 'react';
import { getUserGroupGoals, GroupGoal } from '@/models/groupGoals';

export function useGroupGoals(groupIds: string[]) {
  const [goals, setGoals] = useState<GroupGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserGroupGoals(groupIds);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
      console.error('Error loading group goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupIds.length > 0) {
      loadGoals();
    } else {
      setGoals([]);
      setLoading(false);
    }
  }, [JSON.stringify(groupIds)]);

  return { goals, loading, error, refresh: loadGoals };
}
