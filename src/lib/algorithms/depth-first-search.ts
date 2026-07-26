import type { Algorithm } from "../engine/algorithm";
import type { Frame, GraphSpec, GraphView, MarkKind } from "../engine/types";
import { adjacency, edgeKey, getGraph } from "../engine/helpers";

const PSEUDOCODE = `procedure DFS(graph, node, visited)
    visited.add(node)
    visit(node)
    for each neighbour of node do
        if neighbour not in visited then
            DFS(graph, neighbour, visited)
        end if
    end for
end procedure`;

function generate({ graphId, graph, start }: { graphId?: string; graph?: GraphSpec; start?: string }): Frame[] {
  const g = graph ?? getGraph(graphId ?? "traversal");
  const adj = adjacency(g);
  const source = start ?? g.start;

  const frames: Frame[] = [];
  const nodeMarks: Record<string, MarkKind> = {};
  const edgeMarks: Record<string, MarkKind> = {};
  g.nodes.forEach((n) => (nodeMarks[n.id] = "idle"));

  const visited = new Set<string>();
  const order: string[] = [];
  const stack: string[] = [];
  let maxDepth = 0;
  let edgesExamined = 0;

  const metrics = () => ({
    nodes: g.nodes.length,
    visited: order.length,
    stack: stack.length,
    edges: edgesExamined,
    depth: maxDepth,
  });

  const view = (activeNode?: string): GraphView => ({
    kind: "graph",
    nodes: g.nodes,
    edges: g.edges,
    directed: g.directed,
    nodeMarks: { ...nodeMarks, ...(activeNode ? { [activeNode]: "active" as MarkKind } : {}) },
    edgeMarks: { ...edgeMarks },
    collections: [
      { label: "Call stack", items: [...stack], tone: "violet" },
      { label: "Visit order", items: [...order], tone: "mint" },
    ],
  });

  frames.push({
    title: `Start from ${source}`,
    detail:
      "DFS commits to one branch and follows it as far as it goes before backtracking. The recursion call stack is what remembers where to return to.",
    chips: [`Source ${source}`],
    codeLine: 1,
    phase: "Setup",
    metrics: metrics(),
    view: view(),
  });

  function dfs(node: string, from: string | null, depth: number) {
    visited.add(node);
    order.push(node);
    stack.push(node);
    nodeMarks[node] = "frontier";
    maxDepth = Math.max(maxDepth, depth);
    if (from) edgeMarks[edgeKey(from, node, g.directed)] = "path";

    frames.push({
      title: `Go deep into ${node}`,
      detail: from
        ? `Follow the edge ${from} → ${node} and immediately recurse into ${node} rather than looking at ${from}'s other neighbours first.`
        : `${node} is the root of the traversal.`,
      chips: [`Depth ${depth}`],
      codeLine: 2,
      phase: `Depth ${depth}`,
      metrics: metrics(),
      view: view(node),
    });

    for (const { to } of adj[node]) {
      edgesExamined++;
      if (!visited.has(to)) {
        dfs(to, node, depth + 1);
      } else {
        const key = edgeKey(node, to, g.directed);
        if (!edgeMarks[key]) edgeMarks[key] = "discarded";
        frames.push({
          title: `${to} already visited — skip`,
          detail: `This edge closes a cycle back into the part of the graph already explored, so DFS does not follow it.`,
          chips: [`${node} → ${to}`],
          codeLine: 5,
          phase: `Depth ${depth}`,
          metrics: metrics(),
          view: view(node),
        });
      }
    }

    stack.pop();
    nodeMarks[node] = "visited";
    frames.push({
      title: `Backtrack out of ${node}`,
      detail: `Every neighbour of ${node} has been explored, so the call returns and control goes back to ${stack[stack.length - 1] ?? "the caller"}.`,
      chips: [`Depth ${depth}`],
      codeLine: 8,
      phase: `Depth ${depth}`,
      metrics: metrics(),
      view: view(stack[stack.length - 1]),
    });
  }

  dfs(source, null, 0);

  frames.push({
    title: "Traversal complete",
    detail: `DFS visited ${order.length} nodes in the order ${order.join(" → ")}, reaching a maximum recursion depth of ${maxDepth}.`,
    codeLine: 8,
    phase: "Done",
    metrics: metrics(),
    view: view(),
  });

  return frames;
}

export const depthFirstSearch: Algorithm = {
  slug: "depth-first-search",
  name: "Depth First Search",
  category: "graphs",
  tagline: "Traverse as deep as possible along each branch.",
  summary:
    "DFS explores a graph by going as deep as it can down one path before backtracking. It is the backbone of cycle detection, topological sorting, connected components and most maze and puzzle solvers.",
  icon: "Network",
  difficulty: "Intermediate",
  popularity: 89,
  views: "6.1k",
  complexity: {
    best: "O(V + E)",
    average: "O(V + E)",
    worst: "O(V + E)",
    space: "O(V)",
    stable: null,
    inPlace: null,
  },
  steps: [
    "Mark the current node as visited",
    "Pick its first unvisited neighbour",
    "Recurse into that neighbour immediately",
    "When no unvisited neighbours remain, backtrack",
    "Repeat until every reachable node is visited",
  ],
  bestUsedWhen: [
    "When detecting cycles in a graph",
    "When computing a topological ordering",
    "When exploring mazes, puzzles or game trees",
    "When memory matters and the graph is deep but narrow",
  ],
  keyInsight:
    "DFS and BFS differ only in the data structure holding the frontier — swap the stack for a queue and depth-first becomes breadth-first.",
  related: ["breadth-first-search", "topological-sort", "fibonacci-recursion"],
  inputKind: "graph",
  defaultInput: { graphId: "traversal", start: "A" },
  metrics: [
    { key: "nodes", label: "Nodes", icon: "Circle" },
    { key: "visited", label: "Visited", icon: "CheckCheck" },
    { key: "stack", label: "Stack Depth", icon: "Layers" },
    { key: "edges", label: "Edges Seen", icon: "Spline" },
    { key: "depth", label: "Max Depth", icon: "ArrowDown" },
  ],
  legend: [
    { mark: "active", label: "Current node" },
    { mark: "frontier", label: "On the stack" },
    { mark: "visited", label: "Finished" },
    { mark: "idle", label: "Undiscovered" },
  ],
  code: {
    pseudocode: PSEUDOCODE,
    python: `def dfs(graph, node, visited=None, order=None):
    if visited is None:
        visited, order = set(), []

    visited.add(node)
    order.append(node)

    for neighbour in graph[node]:
        if neighbour not in visited:
            dfs(graph, neighbour, visited, order)

    return order`,
    javascript: `function dfs(graph, node, visited = new Set(), order = []) {
  visited.add(node);
  order.push(node);

  for (const neighbour of graph[node]) {
    if (!visited.has(neighbour)) {
      dfs(graph, neighbour, visited, order);
    }
  }

  return order;
}`,
    java: `static void dfs(Map<String, List<String>> graph, String node,
                Set<String> visited, List<String> order) {
    visited.add(node);
    order.add(node);

    for (String neighbour : graph.getOrDefault(node, List.of())) {
        if (!visited.contains(neighbour)) {
            dfs(graph, neighbour, visited, order);
        }
    }
}`,
    cpp: `void dfs(const std::map<std::string, std::vector<std::string>>& graph,
         const std::string& node,
         std::set<std::string>& visited,
         std::vector<std::string>& order) {
    visited.insert(node);
    order.push_back(node);

    for (const auto& nb : graph.at(node)) {
        if (!visited.count(nb)) dfs(graph, nb, visited, order);
    }
}`,
  },
  article: {
    overview: [
      {
        type: "p",
        text: "Depth First Search is the graph equivalent of exploring a maze by always taking the first unexplored corridor and only turning back at dead ends.",
      },
      {
        type: "pillars",
        items: [
          { title: "Descend", text: "Recurse into the first unvisited neighbour.", icon: "ArrowDown" },
          { title: "Mark", text: "Record nodes as visited to avoid revisiting cycles.", icon: "CheckCheck" },
          { title: "Backtrack", text: "Return to the caller when the branch is exhausted.", icon: "CornerUpLeft" },
        ],
      },
      {
        type: "callout",
        tone: "insight",
        title: "Stack vs queue",
        text: "DFS with an explicit stack and BFS with a queue are the same three lines of code — only the frontier structure differs.",
      },
    ],
    howItWorks: [
      {
        type: "steps",
        items: [
          { title: "Visit", text: "Mark the current node and record it in the visit order." },
          { title: "Iterate neighbours", text: "Walk the adjacency list in order." },
          { title: "Recurse immediately", text: "The first unvisited neighbour is entered before any sibling is considered." },
          { title: "Skip cycles", text: "Edges to already-visited nodes are ignored." },
          { title: "Return", text: "When the loop ends, the call returns and the parent resumes." },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Recursion depth",
        text: "On a graph with a long path, recursive DFS can overflow the call stack. Production code often uses an explicit stack instead.",
      },
    ],
    walkthrough: [
      {
        type: "p",
        text: "From A on the sample graph, DFS dives A → B → D, backtracks, then continues B → E → H before ever touching C.",
      },
      {
        type: "table",
        head: ["Step", "Action", "Stack"],
        rows: [
          ["1", "Enter A", "A"],
          ["2", "Enter B", "A, B"],
          ["3", "Enter D (dead end)", "A, B, D"],
          ["4", "Backtrack to B, enter E", "A, B, E"],
          ["5", "Enter H", "A, B, E, H"],
        ],
      },
    ],
    complexity: [
      {
        type: "table",
        head: ["Metric", "Cost", "Why"],
        rows: [
          ["Time", "O(V + E)", "Each node entered once, each edge examined once"],
          ["Space", "O(V)", "Recursion depth can reach the length of the longest path"],
        ],
      },
      {
        type: "p",
        text: "In a tree DFS uses O(h) stack space where h is the height — far less than BFS's O(width) on a bushy tree. On a path-like graph the reverse is true.",
      },
    ],
  },
  quiz: [
    {
      id: "dfs-1",
      prompt: "Which data structure does DFS rely on?",
      options: ["Queue", "Stack (explicit or the call stack)", "Priority queue", "Union-find"],
      answer: 1,
      explanation: "LIFO ordering is what makes DFS resume the most recent branch first.",
    },
    {
      id: "dfs-2",
      prompt: "Which problem is DFS naturally suited to that BFS is not?",
      options: ["Shortest unweighted path", "Cycle detection and topological sorting", "Level order traversal", "Finding the closest node"],
      answer: 1,
      explanation: "Cycle detection and topological order both depend on DFS finish times and back edges.",
    },
    {
      id: "dfs-3",
      prompt: "What is the space complexity of recursive DFS in the worst case?",
      options: ["O(1)", "O(log V)", "O(V)", "O(V²)"],
      answer: 2,
      explanation: "A path graph forces the recursion to nest once per node.",
    },
  ],
  generate,
};
