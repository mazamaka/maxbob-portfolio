import * as React from "react";
import {allProjects} from "./search";
import {createStarsClient, type StarState} from "./github-stars";

export function useGitHubStars() {
  const [state, setState] = React.useState<StarState>({snapshot: null, status: "saved", retryAt: 0});
  const [refreshing, setRefreshing] = React.useState(false);
  const refreshRef = React.useRef<() => void>(() => {});
  React.useEffect(() => {
    let storage: Storage | undefined;
    try { storage = window.localStorage; } catch { /* Private browsing can disable storage. */ }
    const client = createStarsClient(allProjects.filter(p => p.visibility === "public" && p.repo).map(p => p.repo!), {storage});
    let active = true, busy = false, timer: ReturnType<typeof setTimeout> | undefined;
    setState(client.getState());
    async function refresh() {
      if (busy || document.visibilityState === "hidden") return;
      clearTimeout(timer);
      const delay = client.waitMs();
      if (delay > 0) { timer = setTimeout(refresh, delay); return; }
      busy = true; setRefreshing(true);
      const result = await client.refresh();
      busy = false;
      if (active) { setState({...result}); setRefreshing(false); }
    }
    function resume() {
      if (document.visibilityState === "visible") void refresh();
      else clearTimeout(timer);
    }
    refreshRef.current = () => { void refresh(); };
    void refresh();
    window.addEventListener("focus", resume);
    window.addEventListener("pageshow", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      active = false; clearTimeout(timer); refreshRef.current = () => {};
      window.removeEventListener("focus", resume);
      window.removeEventListener("pageshow", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, []);
  return {...state, refreshing, refresh: () => refreshRef.current()};
}
