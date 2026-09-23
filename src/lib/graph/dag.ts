export type Edge = { parentId: string; childId: string };

/**
 * Detect cycles in a directed graph using iterative DFS with 3-color marking.
 */
export function hasCycle(skillIds: string[], edges: Edge[]): boolean {
  const adj = new Map<string, string[]>();
  for (const id of skillIds) adj.set(id, []);
  for (const e of edges) adj.get(e.parentId)?.push(e.childId);

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  for (const id of skillIds) color.set(id, WHITE);

  function dfs(u: string): boolean {
    color.set(u, GRAY);
    for (const v of adj.get(u) ?? []) {
      if (color.get(v) === GRAY) return true;
      if (color.get(v) === WHITE && dfs(v)) return true;
    }
    color.set(u, BLACK);
    return false;
  }

  for (const id of skillIds) {
    if (color.get(id) === WHITE && dfs(id)) return true;
  }
  return false;
}

/**
 * Topological sort (Kahn's algorithm). Returns [] if the graph has a cycle.
 */
export function topologicalSort(skillIds: string[], edges: Edge[]): string[] {
  const indeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const id of skillIds) {
    indeg.set(id, 0);
    adj.set(id, []);
  }
  for (const e of edges) {
    adj.get(e.parentId)!.push(e.childId);
    indeg.set(e.childId, (indeg.get(e.childId) ?? 0) + 1);
  }

  const queue = skillIds.filter((id) => indeg.get(id) === 0);
  const out: string[] = [];
  while (queue.length) {
    const u = queue.shift()!;
    out.push(u);
    for (const v of adj.get(u)!) {
      indeg.set(v, indeg.get(v)! - 1);
      if (indeg.get(v) === 0) queue.push(v);
    }
  }
  return out.length === skillIds.length ? out : [];
}

/**
 * All skills that transitively depend on the given skill.
 */
export function downstreamClosure(skillId: string, edges: Edge[]): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const e of edges) {
    if (!childrenOf.has(e.parentId)) childrenOf.set(e.parentId, []);
    childrenOf.get(e.parentId)!.push(e.childId);
  }

  const seen = new Set<string>();
  const stack = [...(childrenOf.get(skillId) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const c of childrenOf.get(id) ?? []) stack.push(c);
  }
  return seen;
}

/**
 * Direct parents of a skill.
 */
export function parentsOf(skillId: string, edges: Edge[]): string[] {
  return edges.filter((e) => e.childId === skillId).map((e) => e.parentId);
}

/**
 * Direct children of a skill.
 */
export function childrenOf(skillId: string, edges: Edge[]): string[] {
  return edges.filter((e) => e.parentId === skillId).map((e) => e.childId);
}
