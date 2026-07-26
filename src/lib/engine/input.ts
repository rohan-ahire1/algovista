import type { Algorithm } from "./algorithm";
import type { AlgoInput } from "./types";
import { buildArray } from "./helpers";
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
    case "graph-weighted":
      return {
        array: [],
        graphId: algorithm.defaultInput?.graphId,
        start: algorithm.defaultInput?.start,
      };

    case "number":
      return { array: [], n: algorithm.defaultInput?.n ?? Math.max(3, Math.min(8, Math.round(size / 2))) };

    default:
      return { array: buildArray(size, settings.preset, settings.seed) };
  }
}

export function usesArrayControls(algorithm: Algorithm) {
  return algorithm.inputKind === "array" || algorithm.inputKind === "array-target";
}
