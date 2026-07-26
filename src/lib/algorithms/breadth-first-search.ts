import type { Algorithm } from "../engine/algorithm";
import type { Frame, GraphSpec, GraphView, MarkKind } from "../engine/types";
import { adjacency, edgeKey, getGraph } from "../engine/helpers";

const PSEUDOCODE = `procedure BFS(graph, start)
    queue ← [start]
    visited ← {start}
    while queue is not empty do
        node ← queue.dequeue()
        visit(node)
        for each neighbour of node do
            if neighbour not in visited then
                visited.add(neighbour)
                queue.enqueue(neighbour)
            end if
        end for
    end while
end procedure`;

function generate({ graphId, graph, start }: { graphId?: string; graph?: GraphSpec; start?: string }): Frame[] {
  const g = graph ?? getGraph(graphId ?? "traversal");
  const adj = adjacency(g);
  const source = start ?? g.start;

  const frames: Frame[] = [];
  const nodeMarks: Record<string, MarkKind> = {};
  const edgeMarks: Record<string, MarkKind> = {};
  const depth: Record<string, number> = {};
  g.nodes.forEach((n) => (nodeMarks[n.id] = "idle"));

  const queue: string[] = [source];
  const visited = new Set<string>([source]);
  const order: string[] = [];
  let edgesExamined = 0;

  nodeMarks[source] = "frontier";
  depth[source] = 0;

  const metrics = () => ({
    nodes: g.nodes.length,
    visited: order.length,
    queue: queue.length,
    edges: edgesExamined,
    level: order.length ? depth[order[order.length - 1]] : 0,
  });

  const view = (activeNode?: string): GraphView => ({
    kind: "graph",
    nodes: g.nodes,
    edges: g.edges,
    directed: g.directed,
    nodeMarks: { ...nodeMarks, ...(activeNode ? { [activeNode]: "active" as MarkKind } : {}) },
    edgeMarks: { ...edgeMarks },
    nodeLabels: Object.fromEntries(Object.entries(depth).map(([k, v]) => [k, `L${v}`])),
    collections: [
      { label: "Queue (FIFO)", items: [...queue], tone: "brand" },
      { label: "Visit order", items: [...order], tone: "mint" },
    ],
  });

  frames.push({
    title: `Start from ${source}`,
    detail:
      "BFS explores level by level. The start node goes into a FIFO queue, and every node it reaches is added to the back of that queue.",
    chips: [`Source ${source}`],
    codeLine: 2,
    phase: "Setup",
    metrics: metrics(),
    view: view(),
  });

  while (queue.length) {
    const node = queue.shift()!;
    order.push(node);
    nodeMarks[node] = "visited";

    frames.push({
      title: `Dequeue ${node}`,
      detail: `${node} is the oldest node in the queue, so it is visited next. It sits at level ${depth[node]} — that is its shortest distance from ${source} in edges.`,
      chips: [`Level ${depth[node]}`],
      codeLine: 5,
      phase: `Level ${depth[node]}`,
      metrics: metrics(),
      view: view(node),
    });

    for (const { to } of adj[node]) {
      edgesExamined++;
      const key = edgeKey(node, to, g.directed);
      if (!visited.has(to)) {
        visited.add(to);
        depth[to] = depth[node] + 1;
        queue.push(to);
        nodeMarks[to] = "frontier";
        edgeMarks[key] = "path";
        frames.push({
          title: `Discover ${to} via ${node}`,
          detail: `${to} has not been seen before, so it is marked visited immediately and enqueued at level ${depth[to]}. Marking on discovery — not on dequeue — is what stops a node entering the queue twice.`,
          chips: [`${node} → ${to}`],
          codeLine: 9,
          phase: `Level ${depth[node]}`,
          metrics: metrics(),
          view: view(node),
        });
      } else {
        if (!edgeMarks[key]) edgeMarks[key] = "discarded";
        frames.push({
          title: `Skip ${to} — already seen`,
          detail: `${to} is already in the visited set, so this edge is ignored. Without this check the traversal would loop forever on a cyclic graph.`,
          chips: [`${node} → ${to}`],
          codeLine: 8,
          phase: `Level ${depth[node]}`,
          metrics: metrics(),
          view: view(node),
        });
      }
    }
  }

  frames.push({
    title: "Traversal complete",
    detail: `All ${order.length} reachable nodes were visited in the order ${order.join(" → ")}, using ${edgesExamined} edge inspections.`,
    codeLine: 12,
    phase: "Done",
    metrics: metrics(),
    view: view(),
  });

  return frames;
}

export const breadthFirstSearch: Algorithm = {
  slug: "breadth-first-search",
  name: "Breadth First Search",
  category: "graphs",
  tagline: "Traverse level by level, visiting all neighbors.",
  summary:
    "BFS explores a graph in rings around the source: first all nodes one edge away, then all nodes two edges away, and so on. Because it never skips a level, the first time it reaches a node it has found the shortest path in edges.",
  icon: "Share2",
  difficulty: "Intermediate",
  popularity: 90,
  views: "6.8k",
  complexity: {
    best: "O(V + E)",
    average: "O(V + E)",
    worst: "O(V + E)",
    space: "O(V)",
    stable: null,
    inPlace: null,
  },
  steps: [
    "Put the start node in a FIFO queue and mark it visited",
    "Dequeue the oldest node and visit it",
    "Enqueue every unvisited neighbour, marking it as visited",
    "Repeat until the queue is empty",
    "The order of dequeues is the level-by-level traversal",
  ],
  bestUsedWhen: [
    "When you need the shortest path in an unweighted graph",
    "When exploring nodes closest to the source first",
    "When testing connectivity or bipartiteness",
    "When the graph is wide but shallow",
  ],
  keyInsight:
    "Mark nodes as visited when you enqueue them, not when you dequeue them — otherwise the same node can be queued many times before it is ever processed.",
  related: ["depth-first-search", "dijkstra", "topological-sort"],
  inputKind: "graph",
  defaultInput: { graphId: "traversal", start: "A" },
  metrics: [
    { key: "nodes", label: "Nodes", icon: "Circle" },
    { key: "visited", label: "Visited", icon: "CheckCheck" },
    { key: "queue", label: "In Queue", icon: "ListOrdered" },
    { key: "edges", label: "Edges Seen", icon: "Spline" },
    { key: "level", label: "Level", icon: "Layers" },
  ],
  legend: [
    { mark: "active", label: "Current node" },
    { mark: "frontier", label: "In queue" },
    { mark: "visited", label: "Visited" },
    { mark: "idle", label: "Undiscovered" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `from collections import deque

def bfs(graph, start):
    queue = deque([start])
    visited = {start}
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append(neighbour)

    return order`,
    javascript: `function bfs(graph, start) {
  const queue = [start];
  const visited = new Set([start]);
  const order = [];

  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const neighbour of graph[node]) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push(neighbour);
      }
    }
  }

  return order;
}`,
    java: `static List<String> bfs(Map<String, List<String>> graph, String start) {
    Deque<String> queue = new ArrayDeque<>(List.of(start));
    Set<String> visited = new HashSet<>(Set.of(start));
    List<String> order = new ArrayList<>();

    while (!queue.isEmpty()) {
        String node = queue.poll();
        order.add(node);
        for (String neighbour : graph.getOrDefault(node, List.of())) {
            if (visited.add(neighbour)) queue.add(neighbour);
        }
    }

    return order;
}`,
    cpp: `std::vector<std::string> bfs(
    const std::map<std::string, std::vector<std::string>>& graph,
    const std::string& start) {
    std::queue<std::string> q;
    std::set<std::string> visited{start};
    std::vector<std::string> order;
    q.push(start);

    while (!q.empty()) {
        auto node = q.front(); q.pop();
        order.push_back(node);
        for (const auto& nb : graph.at(node)) {
            if (visited.insert(nb).second) q.push(nb);
        }
    }

    return order;
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "Breadth First Search visits a graph in waves. Everything one step from the source is seen before anything two steps away, which makes BFS the natural shortest-path algorithm for unweighted graphs.",
      },
      {
        type: "pillars",
        items: [
          { title: "Enqueue", text: "Add newly discovered nodes to the back of a FIFO queue.", icon: "ListOrdered" },
          { title: "Dequeue", text: "Always process the oldest node next.", icon: "ArrowRightLeft" },
          { title: "Expand", text: "Push each unseen neighbour and mark it immediately.", icon: "Share2" },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "Queue = level order",
        text: "A FIFO queue guarantees that all nodes at distance k leave the queue before any node at distance k + 1 enters it.",
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Seed the queue", text: "Insert the source and mark it visited." },
          { title: "Take the front", text: "Dequeue the oldest node — this is the visit step." },
          { title: "Scan neighbours", text: "Look at every edge leaving that node." },
          { title: "Discover", text: "Unvisited neighbours are marked and enqueued with distance + 1." },
          { title: "Repeat", text: "Continue until the queue drains, meaning nothing reachable is left." },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Only for unweighted shortest paths",
        text: "BFS counts edges, not weights. On a weighted graph you need Dijkstra — fewer edges does not mean less cost.",
      },
    ],
    walkthrough: [
      {
        type: "p",
        text: "Starting at A on the sample graph, BFS produces the visit order A → B → C → D → E → F → G → H.",
      },
      {
        type: "table",
        head: ["Level", "Nodes", "Distance from A"],
        rows: [
          ["0", "A", "0 edges"],
          ["1", "B, C", "1 edge"],
          ["2", "D, E, F, G", "2 edges"],
          ["3", "H", "3 edges"],
        ],
      },
      {
        type: "callout",
        tone: "success",
        title: "Shortest paths for free",
        text: "The level at which a node is discovered is exactly its shortest-path distance from the source.",
      },
    ],
    complexity: [
      {
        type: "table",
        head: ["Metric", "Cost", "Why"],
        rows: [
          ["Time", "O(V + E)", "Every node is dequeued once, every edge inspected once"],
          ["Space", "O(V)", "The queue and visited set can each hold every node"],
        ],
      },
      {
        type: "p",
        text: "On a dense graph E approaches V², so BFS degrades to O(V²) — but that is the cost of reading the graph, not of the algorithm itself.",
      },
    ],
  },
  quiz: [
    {
      id: "bfs-1",
      prompt: "Which data structure gives BFS its level-by-level order?",
      options: ["Stack (LIFO)", "Queue (FIFO)", "Priority queue", "Hash map"],
      answer: 1,
      explanation: "A FIFO queue drains all of level k before any node of level k + 1 is processed.",
    },
    {
      id: "bfs-2",
      prompt: "What does BFS compute for free on an unweighted graph?",
      options: ["Minimum spanning tree", "Shortest path in number of edges", "Topological order", "Strongly connected components"],
      answer: 1,
      explanation: "The level at which a node is first discovered is its shortest edge-distance from the source.",
    },
    {
      id: "bfs-3",
      prompt: "Why must nodes be marked visited when enqueued rather than when dequeued?",
      options: [
        "It makes the code shorter",
        "Otherwise the same node can be enqueued multiple times before processing",
        "It changes the traversal order",
        "It saves memory in the visited set",
      ],
      answer: 1,
      explanation: "Two neighbours could both push the same node before it is ever dequeued, duplicating work.",
    },
  ],
  generate,
};
