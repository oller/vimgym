import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { LEVELS } from "./data/levels";
import Home from "./Home";

const rootRoute = createRootRoute();

type LevelSearch = {
  levelId: number;
};

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
  validateSearch: (search: Record<string, unknown>): LevelSearch => {
    const levelId = Number(search.levelId);
    const isValidLevel = LEVELS.some((l) => l.id === levelId);
    return {
      levelId: isValidLevel ? levelId : 1,
    };
  },
});

const routeTree = rootRoute.addChildren([indexRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default router;
