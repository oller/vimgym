import { useCallback, useSyncExternalStore } from "react";

type AppRoute = "/" | "/daily";

const ROUTE_CHANGE_EVENT = "vimgym-route-change";

function normalizeRoute(pathname: string): AppRoute {
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  return trimmed === "/daily" ? "/daily" : "/";
}

function getCurrentRoute(): AppRoute {
  if (typeof window === "undefined") return "/";
  return normalizeRoute(window.location.pathname);
}

export function navigateTo(route: AppRoute): void {
  if (typeof window === "undefined") return;
  if (getCurrentRoute() === route) return;

  window.history.pushState({}, "", route);
  window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("popstate", callback);
  window.addEventListener(ROUTE_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(ROUTE_CHANGE_EVENT, callback);
  };
}

const getServerSnapshot = (): AppRoute => "/";

export function useRoute(): [AppRoute, (route: AppRoute) => void] {
  const route = useSyncExternalStore(
    subscribe,
    getCurrentRoute,
    getServerSnapshot,
  );
  const navigate = useCallback((nextRoute: AppRoute) => {
    navigateTo(nextRoute);
  }, []);
  return [route, navigate];
}
