export type StarSnapshot = {counts: Record<string, number>; checkedAt: string};
export type StarState = {snapshot: StarSnapshot | null; status: "saved" | "live" | "error" | "limited"; retryAt: number};
type StorageLike = Pick<Storage, "getItem" | "setItem">;
const CACHE_KEY = "maxbob-github-stars-v1";
const ENDPOINT = "https://api.github.com/users/mazamaka/repos?per_page=100&type=owner&sort=full_name&direction=asc";
const REFRESH_GAP = 3_000;

/** Public, read-only requests. Never accepts a token or fetches individual/private repositories. */
export function createStarsClient(repositories: string[], options: {
  fetcher?: typeof fetch; storage?: StorageLike; now?: () => number;
} = {}) {
  const fetcher = options.fetcher ?? fetch, now = options.now ?? Date.now;
  const allowed = new Set(repositories.map(name => name.toLowerCase()));
  let state: StarState = {snapshot: null, status: "saved", retryAt: 0};
  let inFlight: Promise<StarState> | null = null, lastAttempt = -Infinity;
  try {
    const saved = JSON.parse(options.storage?.getItem(CACHE_KEY) ?? "null");
    const snapshot = saved?.snapshot;
    if (snapshot && Number.isFinite(Date.parse(snapshot.checkedAt)) && Date.parse(snapshot.checkedAt) <= now() + 60_000) {
      const counts = Object.fromEntries(Object.entries(snapshot.counts ?? {}).filter(([name, count]) => allowed.has(name) && Number.isSafeInteger(count) && (count as number) >= 0)) as Record<string, number>;
      if (Object.keys(counts).length) state.snapshot = {counts, checkedAt: snapshot.checkedAt};
    }
    if (Number.isFinite(saved?.retryAt) && saved.retryAt > now() && saved.retryAt < now() + 86_400_000) {
      state.retryAt = saved.retryAt; state.status = saved.status === "error" ? "error" : "limited";
    }
  } catch { /* Storage can be blocked or contain a value from an interrupted write. */ }
  function save() {
    try { options.storage?.setItem(CACHE_KEY, JSON.stringify({snapshot: state.snapshot, retryAt: state.retryAt, status: state.status})); } catch { /* Optional device-local cache. */ }
  }
  function retryTime(response: Response) {
    const retry = response.headers.get("retry-after");
    const retryAfter = retry ? (/^\d+$/.test(retry) ? now() + Number(retry) * 1000 : Date.parse(retry)) : 0;
    const reset = response.headers.get("x-ratelimit-remaining") === "0" ? Number(response.headers.get("x-ratelimit-reset")) * 1000 : 0;
    return Math.max(now() + 60_000, Number.isFinite(retryAfter) ? retryAfter : 0, Number.isFinite(reset) ? reset + 1000 : 0);
  }
  async function request(): Promise<StarState> {
    const counts: Record<string, number> = {};
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    let next: string | null = ENDPOINT + "&page=1", pages = 0, retryAt = 0;
    try {
      while (next) {
        if (++pages > 5) throw new Error("Incomplete repository list");
        const response = await fetcher(next, {cache: "no-store", credentials: "omit", signal: controller.signal, headers: {Accept: "application/vnd.github+json"}});
        if (response.status === 403 || response.status === 429) {
          state = {...state, status: "limited", retryAt: retryTime(response)};
          save(); return state;
        }
        if (!response.ok) throw new Error("GitHub unavailable");
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid repository list");
        for (const repo of data) {
          const name = typeof repo?.name === "string" ? repo.name.toLowerCase() : "";
          if (!allowed.has(name) || repo.private !== false || repo.owner?.login?.toLowerCase() !== "mazamaka") continue;
          if (!Number.isSafeInteger(repo.stargazers_count) || repo.stargazers_count < 0) throw new Error("Invalid star count");
          counts[name] = repo.stargazers_count;
        }
        const link = response.headers.get("link")?.match(/<([^>]+)>;\s*rel="next"/)?.[1];
        next = link ?? null;
        if (next) {
          const url = new URL(next);
          if (url.origin !== "https://api.github.com" || url.pathname !== "/users/mazamaka/repos" || url.username || url.password) throw new Error("Unexpected pagination URL");
        }
        if (response.headers.get("x-ratelimit-remaining") === "0") {
          retryAt = retryTime(response);
          if (next) { state = {...state, status: "limited", retryAt}; save(); return state; }
        }
      }
      if (!Object.keys(counts).length) throw new Error("No public project counts returned");
      state = {snapshot: {counts, checkedAt: new Date(now()).toISOString()}, status: "live", retryAt};
    } catch {
      state = {...state, status: "error", retryAt: now() + 60_000};
    } finally { clearTimeout(timeout); }
    save(); return state;
  }
  return {
    getState: () => state,
    waitMs: () => Math.max(0, lastAttempt + REFRESH_GAP - now(), state.retryAt - now()),
    refresh(): Promise<StarState> {
      if (inFlight) return inFlight;
      if (now() < state.retryAt || now() < lastAttempt + REFRESH_GAP) return Promise.resolve(state);
      lastAttempt = now();
      inFlight = request().finally(() => { inFlight = null; });
      return inFlight;
    }
  };
}

export function currentStars(repo: string | null | undefined, fallback: number | undefined, snapshot: StarSnapshot | null) {
  return repo ? snapshot?.counts[repo.toLowerCase()] ?? fallback : undefined;
}
