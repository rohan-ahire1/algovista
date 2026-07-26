import type { Algorithm } from "../engine/algorithm";
import type { Frame, GraphView, MarkKind } from "../engine/types";
import { adjacency, edgeKey, getGraph } from "../engine/helpers";

const PSEUDOCODE = `procedure topologicalSort(graph)
    compute inDegree[v] for every vertex
    Q ← all vertices with inDegree 0
    order ← []
    while Q is not empty do
        u ← Q.dequeue()
        order.append(u)
        for each neighbour v of u do
            inDegree[v] ← inDegree[v] - 1
            if inDegree[v] = 0 then
                Q.enqueue(v)
            end if
        end for
    end while
    if length(order) < V then report cycle
    return order
end procedure`;

function generate({ graphId }: { graphId?: string }): Frame[] {
  const g = getGraph(graphId ?? "dag");
  const adj = adjacency(g);
  const frames: Frame[] = [];

  const inDegree: Record<string, number> = {};
  g.nodes.forEach((n) => (inDegree[n.id] = 0));
  g.edges.forEach((e) => (inDegree[e.to] += 1));

  const nodeMarks: Record<string, MarkKind> = {};
  const edgeMarks: Record<string, MarkKind> = {};
  g.nodes.forEach((n) => (nodeMarks[n.id] = "idle"));

  const queue = g.nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
  queue.forEach((id) => (nodeMarks[id] = "frontier"));
  const order: string[] = [];
  let removed = 0;

  const metrics = () => ({
    nodes: g.nodes.length,
    placed: order.length,
    ready: queue.length,
    removed,
  });

  const labels = () =>
    Object.fromEntries(
      g.nodes.map((n) => [n.id, order.includes(n.id) ? `#${order.indexOf(n.id) + 1}` : `in ${inDegree[n.id]}`]),
    );

  const view = (activeNode?: string): GraphView => ({
    kind: "graph",
    nodes: g.nodes,
    edges: g.edges,
    directed: g.directed,
    nodeMarks: { ...nodeMarks, ...(activeNode ? { [activeNode]: "active" as MarkKind } : {}) },
    edgeMarks: { ...edgeMarks },
    nodeLabels: labels(),
    collections: [
      { label: "Ready (in-degree 0)", items: [...queue], tone: "brand" },
      { label: "Topological order", items: [...order], tone: "mint" },
    ],
  });

  frames.push({
    title: "Count incoming edges",
    detail:
      "Kahn's algorithm starts by counting how many prerequisites each node has. Any node with zero incoming edges can be scheduled immediately.",
    chips: [`${queue.length} ready`],
    codeLine: 2,
    phase: "Setup",
    metrics: metrics(),
    view: view(),
  });

  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    nodeMarks[u] = "visited";

    frames.push({
      title: `Schedule ${u}`,
      detail: `${u} has no unmet prerequisites left, so it takes position ${order.length} in the ordering.`,
      chips: [`#${order.length}`],
      codeLine: 6,
      phase: "Schedule",
      metrics: metrics(),
      view: view(u),
    });

    for (const { to } of adj[u]) {
      inDegree[to] -= 1;
      removed++;
      edgeMarks[edgeKey(u, to, g.directed)] = "path";
      const freed = inDegree[to] === 0;
      if (freed) {
        queue.push(to);
        nodeMarks[to] = "frontier";
      }
      frames.push({
        title: `Remove edge ${u} → ${to}`,
        detail: freed
          ? `${to} now has an in-degree of 0 — every prerequisite is satisfied, so it joins the ready queue.`
          : `${to} still needs ${inDegree[to]} more prerequisite${inDegree[to] === 1 ? "" : "s"} before it can be scheduled.`,
        chips: [`${u} → ${to}`, `in-degree ${inDegree[to]}`],
        codeLine: freed ? 11 : 9,
        phase: "Schedule",
        metrics: metrics(),
        view: view(u),
      });
    }
  }

  const complete = order.length === g.nodes.length;
  frames.push({
    title: complete ? "Valid topological order found" : "Cycle detected",
    detail: complete
      ? `${order.join(" → ")} respects every dependency: each node appears only after all of its prerequisites.`
      : "Some nodes never reached in-degree 0, which proves the graph contains a cycle and no topological order exists.",
    codeLine: 15,
    phase: "Done",
    metrics: metrics(),
    view: view(),
  });

  return frames;
}

export const topologicalSort: Algorithm = {
  slug: "topological-sort",
  name: "Topological Sort",
  category: "graphs",
  tagline: "Linear ordering of vertices in a directed acyclic graph.",
  summary:
    "Topological Sort produces an ordering of a directed acyclic graph in which every edge points forwards. It answers questions like 'in what order can I take these courses?' or 'which tasks must finish before this build step?'.",
  icon: "ListTree",
  difficulty: "Intermediate",
  popularity: 76,
  views: "4.2k",
  complexity: {
    best: "O(V + E)",
    average: "O(V + E)",
    worst: "O(V + E)",
    space: "O(V)",
    stable: null,
    inPlace: null,
  },
  steps: [
    "Compute the in-degree of every vertex",
    "Enqueue all vertices with in-degree 0",
    "Dequeue a vertex and append it to the ordering",
    "Decrement the in-degree of each of its successors",
    "Enqueue any successor whose in-degree reaches 0",
  ],
  bestUsedWhen: [
    "When scheduling tasks with dependencies",
    "When resolving build or package ordering",
    "When planning course prerequisites",
    "When you also need cycle detection for free",
  ],
  keyInsight:
    "If the produced ordering is shorter than the vertex count, the leftover nodes form a cycle — Kahn's algorithm detects impossible dependency graphs as a side effect.",
  related: ["depth-first-search", "breadth-first-search", "dijkstra"],
  inputKind: "graph",
  defaultInput: { graphId: "dag" },
  metrics: [
    { key: "nodes", label: "Nodes", icon: "Circle" },
    { key: "placed", label: "Scheduled", icon: "CheckCheck" },
    { key: "ready", label: "Ready Queue", icon: "ListOrdered" },
    { key: "removed", label: "Edges Removed", icon: "Scissors" },
  ],
  legend: [
    { mark: "active", label: "Scheduling" },
    { mark: "frontier", label: "Ready (in-degree 0)" },
    { mark: "visited", label: "Placed in order" },
    { mark: "idle", label: "Blocked" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `from collections import deque

def topological_sort(graph):
    in_degree = {node: 0 for node in graph}
    for node in graph:
        for nb in graph[node]:
            in_degree[nb] += 1

    queue = deque([n for n, d in in_degree.items() if d == 0])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for nb in graph[node]:
            in_degree[nb] -= 1
            if in_degree[nb] == 0:
                queue.append(nb)

    if len(order) < len(graph):
        raise ValueError("graph contains a cycle")
    return order`,
    javascript: `function topologicalSort(graph) {
  const inDegree = Object.fromEntries(Object.keys(graph).map((n) => [n, 0]));
  for (const node of Object.keys(graph)) {
    for (const nb of graph[node]) inDegree[nb]++;
  }

  const queue = Object.keys(inDegree).filter((n) => inDegree[n] === 0);
  const order = [];

  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const nb of graph[node]) {
      if (--inDegree[nb] === 0) queue.push(nb);
    }
  }

  if (order.length < Object.keys(graph).length) {
    throw new Error("graph contains a cycle");
  }
  return order;
}`,
    java: `static List<String> topologicalSort(Map<String, List<String>> graph) {
    Map<String, Integer> inDegree = new HashMap<>();
    for (String n : graph.keySet()) inDegree.putIfAbsent(n, 0);
    for (List<String> nbs : graph.values())
        for (String nb : nbs) inDegree.merge(nb, 1, Integer::sum);

    Deque<String> queue = new ArrayDeque<>();
    inDegree.forEach((n, d) -> { if (d == 0) queue.add(n); });

    List<String> order = new ArrayList<>();
    while (!queue.isEmpty()) {
        String node = queue.poll();
        order.add(node);
        for (String nb : graph.getOrDefault(node, List.of())) {
            if (inDegree.merge(nb, -1, Integer::sum) == 0) queue.add(nb);
        }
    }

    if (order.size() < inDegree.size())
        throw new IllegalStateException("graph contains a cycle");
    return order;
}`,
    cpp: `std::vector<std::string> topologicalSort(
    const std::map<std::string, std::vector<std::string>>& graph) {
    std::map<std::string, int> inDegree;
    for (const auto& [n, _] : graph) inDegree[n];
    for (const auto& [_, nbs] : graph)
        for (const auto& nb : nbs) inDegree[nb]++;

    std::queue<std::string> q;
    for (const auto& [n, d] : inDegree) if (d == 0) q.push(n);

    std::vector<std::string> order;
    while (!q.empty()) {
        auto node = q.front(); q.pop();
        order.push_back(node);
        for (const auto& nb : graph.at(node))
            if (--inDegree[nb] == 0) q.push(nb);
    }

    if (order.size() < inDegree.size())
        throw std::runtime_error("graph contains a cycle");
    return order;
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "A topological order is any sequence of the vertices in which every edge points from an earlier vertex to a later one. Only directed acyclic graphs have one.",
      },
      {
        type: "pillars",
        items: [
          { title: "Count", text: "Record how many prerequisites each node has.", icon: "Hash" },
          { title: "Release", text: "Nodes with zero prerequisites become schedulable.", icon: "Unlock" },
          { title: "Propagate", text: "Scheduling a node frees its dependents.", icon: "Share2" },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "Usually not unique",
        text: "Whenever two nodes are ready at the same time, either can go first — most DAGs admit many valid topological orders.",
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Compute in-degrees", text: "One pass over all edges counts incoming edges per node." },
          { title: "Seed the queue", text: "Every node with in-degree 0 has no blockers." },
          { title: "Emit", text: "Dequeue a ready node and append it to the ordering." },
          { title: "Decrement", text: "Each outgoing edge reduces a successor's remaining prerequisites." },
          { title: "Detect cycles", text: "If fewer than V nodes were emitted, a cycle blocked the rest." },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Cycles have no ordering",
        text: "If A depends on B and B depends on A, neither can ever come first. Kahn's algorithm simply stalls, which is how it reports the problem.",
      },
    ],
    walkthrough: [
      {
        type: "p",
        text: "On the course-prerequisite DAG, A and B start with no prerequisites, so both are immediately schedulable.",
      },
      {
        type: "table",
        head: ["Step", "Scheduled", "Newly freed"],
        rows: [
          ["1", "A", "—"],
          ["2", "B", "C"],
          ["3", "C", "D, E"],
          ["4", "D", "—"],
          ["5", "E", "F"],
          ["6", "F", "—"],
        ],
      },
    ],
    complexity: [
      {
        type: "table",
        head: ["Metric", "Cost", "Why"],
        rows: [
          ["Time", "O(V + E)", "In-degree pass plus one visit per node and edge"],
          ["Space", "O(V)", "In-degree map and ready queue"],
        ],
      },
      {
        type: "p",
        text: "The DFS-based alternative pushes nodes onto a stack as their recursive calls finish, then reverses it. Same complexity, different flavour — Kahn's version is easier to reason about incrementally.",
      },
    ],
  },
  quiz: [
    {
      id: "topo-1",
      prompt: "Which graphs admit a topological ordering?",
      options: ["All graphs", "Undirected graphs", "Directed acyclic graphs only", "Trees only"],
      answer: 2,
      explanation: "A cycle makes it impossible for every edge to point forwards.",
    },
    {
      id: "topo-2",
      prompt: "In Kahn's algorithm, which nodes go into the initial queue?",
      options: ["Nodes with in-degree 0", "Nodes with out-degree 0", "The node with most edges", "A random node"],
      answer: 0,
      explanation: "In-degree 0 means no unmet prerequisites, so those nodes can be scheduled first.",
    },
    {
      id: "topo-3",
      prompt: "How does Kahn's algorithm detect a cycle?",
      options: [
        "It throws when the queue is empty",
        "The output order contains fewer nodes than the graph",
        "It counts back edges",
        "It cannot detect cycles",
      ],
      answer: 1,
      explanation: "Nodes inside a cycle never reach in-degree 0, so they are never emitted.",
    },
  ],
  generate,
};
