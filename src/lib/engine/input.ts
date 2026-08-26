import type { Algorithm } from "./algorithm";
import type { AlgoInput } from "./types";
import { buildArray } from "./helpers";
import { sanitizeGraph } from "./graph-edit";
import { generateRandomGraph, sanitizeRecipe } from "./graph-gen";
import type { GraphSpec } from "./types";
import type { GraphSource } from "../store/schema";
import type { Settings } from "../store/schema";

/**
 * Turns the user's global visualization settings into the concrete input an
 * algorithm expects. Graph and recursion algorithms ignore the array controls.
 */
export function buildInput(algorithm: Algorithm, settings: Settings): AlgoInput {
  const size = Math.max(4, Math.min(50, settings.arraySize));

  switch (algorithm.inputKind) {
    case "array":
      return { array: buildArray(size, settings.preset, settings.seed) };

    case "array-target": {
      const array = buildArray(size, settings.preset, settings.seed);
      const sorted = [...array].sort((a, b) => a - b);
      // Deterministic pick so the target is always present and reproducible.
      const idx = settings.seed % sorted.length;
      return { array, target: sorted[idx] };
    }

    case "graph":
      return {
        array: [],
        graphId: algorithm.defaultInput?.graphId,
        start: algorithm.defaultInput?.start,
      };

    case "graph-weighted": {
      // A user-supplied graph replaces the built-in preset entirely.
      const custom = resolveGraphSource(settings.graphSource);
      return {
        array: [],
        graphId: algorithm.defaultInput?.graphId,
        graph: custom ?? undefined,
        start: custom?.start ?? algorithm.defaultInput?.start,
      };
    }

    case "number":
      return { array: [], n: algorithm.defaultInput?.n ?? Math.max(3, Math.min(8, Math.round(size / 2))) };

    case "knapsack":
      return {
        array: [],
        items: algorithm.defaultInput?.items,
        capacity: algorithm.defaultInput?.capacity ?? Math.max(8, Math.min(24, size + 4)),
      };

    default:
      return { array: buildArray(size, settings.preset, settings.seed) };
  }
}

export function usesArrayControls(algorithm: Algorithm) {
  return algorithm.inputKind === "array" || algorithm.inputKind === "array-target";
}

export function isEditableGraph(algorithm: Algorithm) {
  return algorithm.inputKind === "graph-weighted";
}

/** Turns whatever is in the cookie into a graph, repairing bad values. */
export function resolveGraphSource(source: GraphSource): GraphSpec | null {
  if (!source) return null;
  if (source.kind === "random") {
    const recipe = sanitizeRecipe(source.recipe);
    return recipe ? generateRandomGraph(recipe) : null;
  }
  return sanitizeGraph(source.graph);
}
