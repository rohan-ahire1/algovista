/**
 * The visualization engine is deliberately "eager": every algorithm compiles its
 * input into a complete, immutable list of Frames up front. Scrubbing backwards,
 * jumping to the end and replaying are then all O(1) index changes, which keeps
 * the player logic trivial and makes the timeline scrubber exact.
 */

export type MarkKind =
  | "idle"
  | "compare"
  | "compare-alt"
  | "sorted"
  | "pivot"
  | "active"
  | "discarded"
  | "found"
  | "visited"
  | "frontier"
  | "path";

export interface Pointer {
  label: string;
  index: number;
  tone?: "brand" | "violet" | "mint" | "amber";
}

export interface RangeBand {
  from: number;
  to: number;
  label?: string;
  tone?: "brand" | "violet" | "mint";
}

export interface ArrayView {
  kind: "array";
  values: number[];
  marks: MarkKind[];
  pointers?: Pointer[];
  ranges?: RangeBand[];
  /** Optional second row rendered beneath the main array (merge buffers etc.). */
  auxiliary?: { label: string; values: number[]; marks?: MarkKind[] };
}

export interface GraphNode {
  id: string;
  x: number; // normalized 0..1
  y: number; // normalized 0..1
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
}

export interface GraphView {
  kind: "graph";
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  nodeMarks: Record<string, MarkKind>;
  edgeMarks: Record<string, MarkKind>;
  /** Small caption under each node — distance in Dijkstra, order in topo sort. */
  nodeLabels?: Record<string, string>;
  /** Rendered as a labelled chip strip beside the graph. */
  collections?: { label: string; items: string[]; tone?: "brand" | "violet" | "mint" }[];
}

export interface TreeNode {
  id: string;
  label: string;
  depth: number;
  x: number; // normalized 0..1
  parent: string | null;
  result?: string;
}

export interface TreeView {
  kind: "tree";
  nodes: TreeNode[];
  marks: Record<string, MarkKind>;
  collections?: { label: string; items: string[]; tone?: "brand" | "violet" | "mint" }[];
}

export interface TableRow {
  id: string;
  label: string;
  values: (number | string)[];
  marks?: MarkKind[];
}

export interface TableDecision {
  item: string;
  capacity: number;
  skip: number;
  take: number | null;
  result: number;
  choice: "take" | "skip";
  takeSource?: number;
  itemValue?: number;
  remainingCapacity?: number;
}

export interface TableView {
  kind: "table";
  columns: string[];
  rows: TableRow[];
  caption?: string;
  activeCell?: { row: number; column: number };
  decision?: TableDecision;
}

export type View = ArrayView | GraphView | TreeView | TableView;

export interface KnapsackItem {
  id: string;
  name: string;
  weight: number;
  value: number;
}

export interface Frame {
  /** Short imperative headline, e.g. "Compare 8 and 1". */
  title: string;
  /** One or two sentences explaining *why* this step happens. */
  detail: string;
  /** Small chips shown next to the title, e.g. "Index 2". */
  chips?: string[];
  /** 1-based line number in the algorithm's pseudocode, highlighted while active. */
  codeLine?: number;
  /** Values for the algorithm's declared metrics. */
  metrics: Record<string, number | string>;
  /** Marks this frame as a phase boundary — used to group the step list. */
  phase?: string;
  view: View;
}

export interface MetricSpec {
  key: string;
  label: string;
  icon: string;
}

export interface LegendItem {
  mark: MarkKind;
  label: string;
}

export type InputKind = "array" | "array-target" | "graph" | "graph-weighted" | "number" | "knapsack";

export interface AlgoInput {
  array: number[];
  target?: number;
  graphId?: string;
  /** A user-edited graph, which takes precedence over graphId. */
  graph?: GraphSpec;
  start?: string;
  n?: number;
  items?: KnapsackItem[];
  capacity?: number;
}

/** A complete graph definition — the built-in presets and user-edited graphs share this shape. */
export interface GraphSpec {
  id: string;
  label: string;
  directed: boolean;
  weighted: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
  start: string;
}
