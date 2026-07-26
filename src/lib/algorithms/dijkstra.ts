import type { Algorithm } from "../engine/algorithm";
import type { Frame, GraphView, MarkKind } from "../engine/types";
import { adjacency, edgeKey, getGraph } from "../engine/helpers";

const PSEUDOCODE = `procedure dijkstra(graph, source)
    dist[v] ← ∞ for every vertex v
    dist[source] ← 0
    Q ← all vertices
    while Q is not empty do
        u ← vertex in Q with smallest dist
        remove u from Q
        for each neighbour v of u do
            alt ← dist[u] + weight(u, v)
            if alt < dist[v] then
                dist[v] ← alt
                prev[v] ← u
            end if
        end for
    end while
end procedure`;

const INF = Number.POSITIVE_INFINITY;

function generate({ graphId, start }: { graphId?: string; start?: string }): Frame[] {
  const g = getGraph(graphId ?? "weighted");
  const adj = adjacency(g);
  const source = start ?? g.start;

  const frames: Frame[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const nodeMarks: Record<string, MarkKind> = {};
  const edgeMarks: Record<string, MarkKind> = {};
  const settled = new Set<string>();

  g.nodes.forEach((n) => {
    dist[n.id] = INF;
    prev[n.id] = null;
    nodeMarks[n.id] = "idle";
  });
  dist[source] = 0;
  nodeMarks[source] = "frontier";

  let relaxations = 0;
  let improvements = 0;

  const fmt = (v: number) => (v === INF ? "∞" : String(v));
  const metrics = () => ({
    nodes: g.nodes.length,
    settled: settled.size,
    relaxations,
    improved: improvements,
  });

  const labels = () => Object.fromEntries(g.nodes.map((n) => [n.id, fmt(dist[n.id])]));

  const frontier = () =>
    g.nodes
      .filter((n) => !settled.has(n.id) && dist[n.id] < INF)
      .sort((a, b) => dist[a.id] - dist[b.id])
      .map((n) => `${n.id}:${fmt(dist[n.id])}`);

  const view = (activeNode?: string): GraphView => ({
    kind: "graph",
    nodes: g.nodes,
    edges: g.edges,
    directed: g.directed,
    nodeMarks: { ...nodeMarks, ...(activeNode ? { [activeNode]: "active" as MarkKind } : {}) },
    edgeMarks: { ...edgeMarks },
    nodeLabels: labels(),
    collections: [
      { label: "Priority queue", items: frontier(), tone: "brand" },
      { label: "Settled", items: [...settled], tone: "mint" },
    ],
  });

  frames.push({
    title: `Set distance to ${source} = 0`,
    detail:
      "Every node starts at infinity except the source. Dijkstra then repeatedly settles the closest unsettled node, at which point its distance can never improve again.",
    chips: [`Source ${source}`],
    codeLine: 3,
    phase: "Setup",
    metrics: metrics(),
    view: view(),
  });

  while (settled.size < g.nodes.length) {
    let u: string | null = null;
    let best = INF;
    for (const n of g.nodes) {
      if (!settled.has(n.id) && dist[n.id] < best) {
        best = dist[n.id];
        u = n.id;
      }
    }
    if (!u) break;

    settled.add(u);
    nodeMarks[u] = "visited";
    if (prev[u]) edgeMarks[edgeKey(prev[u]!, u, g.directed)] = "path";

    frames.push({
      title: `Settle ${u} at distance ${fmt(dist[u])}`,
      detail: `${u} has the smallest tentative distance of everything still unsettled. Because all edge weights are non-negative, no later path can reach it more cheaply.`,
      chips: [`dist = ${fmt(dist[u])}`],
      codeLine: 6,
      phase: `Settle ${u}`,
      metrics: metrics(),
      view: view(u),
    });

    for (const { to, weight } of adj[u]) {
      if (settled.has(to)) continue;
      relaxations++;
      const alt = dist[u] + weight;
      const better = alt < dist[to];
      if (better) {
        dist[to] = alt;
        prev[to] = u;
        improvements++;
        nodeMarks[to] = "frontier";
      }
      frames.push({
        title: `Relax ${u} → ${to} (weight ${weight})`,
        detail: better
          ? `Going through ${u} costs ${fmt(dist[u])} + ${weight} = ${alt}, which beats the previous estimate. Update ${to}'s distance and remember ${u} as its predecessor.`
          : `Going through ${u} costs ${alt}, which is not better than ${to}'s current estimate of ${fmt(dist[to])}. Keep the existing route.`,
        chips: [`${u} → ${to}`, `alt = ${alt}`],
        codeLine: better ? 10 : 9,
        phase: `Settle ${u}`,
        metrics: metrics(),
        view: view(u),
      });
    }
  }

  const far = g.nodes.reduce((acc, n) => (dist[n.id] > dist[acc] && dist[n.id] < INF ? n.id : acc), source);
  frames.push({
    title: "Shortest paths found",
    detail: `Every reachable node now holds its true shortest distance from ${source}. The farthest is ${far} at ${fmt(dist[far])}. ${relaxations} edges were relaxed, ${improvements} of which improved an estimate.`,
    codeLine: 14,
    phase: "Done",
    metrics: metrics(),
    view: view(),
  });

  return frames;
}

export const dijkstra: Algorithm = {
  slug: "dijkstra",
  name: "Dijkstra's Algorithm",
  category: "graphs",
  alsoIn: ["greedy"],
  tagline: "Find shortest path in a graph with non-negative weights.",
  summary:
    "Dijkstra's algorithm computes the shortest distance from one source to every other node in a weighted graph. It repeatedly settles the closest unsettled node and relaxes its outgoing edges — a greedy strategy that is provably optimal when no edge weight is negative.",
  icon: "Route",
  difficulty: "Advanced",
  popularity: 91,
  views: "7.3k",
  complexity: {
    best: "O(E log V)",
    average: "O(E log V)",
    worst: "O(E log V)",
    space: "O(V)",
    stable: null,
    inPlace: null,
  },
  steps: [
    "Set the source distance to 0 and all others to infinity",
    "Pick the unsettled node with the smallest tentative distance",
    "Settle it — its distance is now final",
    "Relax every outgoing edge, improving neighbours' estimates",
    "Repeat until every reachable node is settled",
  ],
  bestUsedWhen: [
    "When edge weights are non-negative",
    "When you need shortest paths from a single source",
    "When routing on maps, networks or game grids",
    "When a priority queue is available for the frontier",
  ],
  keyInsight:
    "The greedy choice is only safe because weights are non-negative — extending a path can never make it shorter, so the closest unsettled node is already final.",
  related: ["breadth-first-search", "depth-first-search", "topological-sort"],
  inputKind: "graph-weighted",
  defaultInput: { graphId: "weighted", start: "A" },
  metrics: [
    { key: "nodes", label: "Nodes", icon: "Circle" },
    { key: "settled", label: "Settled", icon: "CheckCheck" },
    { key: "relaxations", label: "Relaxations", icon: "Spline" },
    { key: "improved", label: "Improvements", icon: "TrendingDown" },
  ],
  legend: [
    { mark: "active", label: "Settling" },
    { mark: "frontier", label: "Tentative distance" },
    { mark: "visited", label: "Settled" },
    { mark: "idle", label: "Unreached (∞)" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `import heapq

def dijkstra(graph, source):
    dist = {node: float('inf') for node in graph}
    dist[source] = 0
    pq = [(0, source)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, weight in graph[u]:
            alt = d + weight
            if alt < dist[v]:
                dist[v] = alt
                heapq.heappush(pq, (alt, v))

    return dist`,
    javascript: `function dijkstra(graph, source) {
  const dist = Object.fromEntries(Object.keys(graph).map((n) => [n, Infinity]));
  dist[source] = 0;

  const pq = [[0, source]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;

    for (const [v, weight] of graph[u]) {
      const alt = d + weight;
      if (alt < dist[v]) {
        dist[v] = alt;
        pq.push([alt, v]);
      }
    }
  }

  return dist;
}`,
    java: `static Map<String, Integer> dijkstra(
        Map<String, List<int[]>> graph, String source, List<String> nodes) {
    Map<String, Integer> dist = new HashMap<>();
    for (String n : nodes) dist.put(n, Integer.MAX_VALUE);
    dist.put(source, 0);

    PriorityQueue<Object[]> pq =
        new PriorityQueue<>(Comparator.comparingInt(o -> (int) o[0]));
    pq.add(new Object[] { 0, source });

    while (!pq.isEmpty()) {
        Object[] top = pq.poll();
        int d = (int) top[0];
        String u = (String) top[1];
        if (d > dist.get(u)) continue;
        // relax each outgoing edge of u
    }

    return dist;
}`,
    cpp: `std::map<std::string, int> dijkstra(
    const std::map<std::string, std::vector<std::pair<std::string, int>>>& graph,
    const std::string& source) {
    std::map<std::string, int> dist;
    for (const auto& [node, _] : graph) dist[node] = INT_MAX;
    dist[source] = 0;

    using Item = std::pair<int, std::string>;
    std::priority_queue<Item, std::vector<Item>, std::greater<>> pq;
    pq.push({0, source});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (const auto& [v, w] : graph.at(u)) {
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
        }
    }

    return dist;
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "Dijkstra's algorithm generalises BFS to weighted graphs. Instead of expanding the node discovered earliest, it expands the node that is currently cheapest to reach.",
      },
      {
        type: "pillars",
        items: [
          { title: "Select", text: "Take the unsettled node with the smallest tentative distance.", icon: "Crosshair" },
          { title: "Settle", text: "Its distance is now final and never changes again.", icon: "Lock" },
          { title: "Relax", text: "Improve neighbours' estimates through the settled node.", icon: "TrendingDown" },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Non-negative weights only",
        text: "A negative edge could make an already-settled node cheaper after the fact, breaking the greedy invariant. Use Bellman-Ford when negatives are possible.",
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Initialise", text: "dist[source] = 0, everything else ∞." },
          { title: "Extract minimum", text: "A priority queue gives the closest unsettled node in O(log V)." },
          { title: "Settle", text: "Mark it final — no shorter route to it can exist." },
          { title: "Relax edges", text: "For each neighbour, test whether going through u beats the current estimate." },
          { title: "Repeat", text: "Continue until the queue empties or all nodes are settled." },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "Relaxation, explained",
        text: "'Relaxing' an edge (u, v) simply asks: is dist[u] + w(u,v) better than what I currently believe about v? If yes, adopt the better route.",
      },
    ],
    walkthrough: [
      { type: "p", text: "On the sample network, starting from A, distances settle in increasing order." },
      {
        type: "table",
        head: ["Settled", "Distance from A", "Via"],
        rows: [
          ["A", "0", "—"],
          ["C", "2", "A → C"],
          ["B", "3", "A → C → B"],
          ["D", "8", "A → C → B → D"],
          ["E", "10", "A → C → E"],
          ["F", "13", "A → C → E → F"],
        ],
      },
      {
        type: "callout",
        tone: "success",
        title: "Note the surprise",
        text: "The direct edge A → B costs 4, but the two-hop route A → C → B costs only 3. Relaxation finds it automatically.",
      },
    ],
    complexity: [
      {
        type: "table",
        head: ["Implementation", "Time", "Notes"],
        rows: [
          ["Binary heap", "O(E log V)", "The standard choice"],
          ["Array scan", "O(V²)", "Better on very dense graphs"],
          ["Fibonacci heap", "O(E + V log V)", "Optimal in theory, rarely faster in practice"],
        ],
      },
      {
        type: "p",
        text: "Space is O(V) for the distance and predecessor maps, plus up to O(E) entries in a lazy priority queue that allows stale duplicates.",
      },
    ],
  },
  quiz: [
    {
      id: "dijkstra-1",
      prompt: "Why does Dijkstra's algorithm fail on graphs with negative edge weights?",
      options: [
        "It runs forever",
        "A settled node's distance could still improve later, breaking the greedy invariant",
        "The priority queue overflows",
        "It only works on trees",
      ],
      answer: 1,
      explanation: "Greedy settling assumes extending a path can never reduce its cost, which negatives violate.",
    },
    {
      id: "dijkstra-2",
      prompt: "What does 'relaxing' an edge (u, v) mean?",
      options: [
        "Removing it from the graph",
        "Checking whether dist[u] + w(u,v) improves dist[v]",
        "Halving its weight",
        "Marking v as visited",
      ],
      answer: 1,
      explanation: "Relaxation adopts the route through u whenever it beats v's current best estimate.",
    },
    {
      id: "dijkstra-3",
      prompt: "With a binary heap, what is Dijkstra's time complexity?",
      options: ["O(V)", "O(V + E)", "O(E log V)", "O(V²  log V)"],
      answer: 2,
      explanation: "Each of the E relaxations may push to the heap, and each heap operation costs log V.",
    },
  ],
  generate,
};
