import { useEffect, useState } from 'react';
import { useAssets } from './useAssets';

/** Ignore stale replies when filters/routes change or a component unmounts. */
export function useAssetQuery(kind, params = {}) {
  const { api, revision } = useAssets();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const encoded = JSON.stringify(params);
  const key = JSON.stringify([kind, encoded, revision, attempt]);
  useEffect(() => {
    let active = true;
    const input = JSON.parse(encoded);
    const pending = kind === 'list' ? api.list(input) : kind === 'get' ? api.get(input.id) : api.stats();
    pending.then(data => { if (active) setResult({ key, data }); })
      .catch(error => { if (active) setResult({ key, error }); });
    return () => { active = false; };
  }, [api, kind, encoded, key]);
  return {
    data: result?.key === key ? result.data : undefined,
    error: result?.key === key ? result.error : undefined,
    loading: result?.key !== key,
    retry: () => setAttempt(value => value + 1),
  };
}
