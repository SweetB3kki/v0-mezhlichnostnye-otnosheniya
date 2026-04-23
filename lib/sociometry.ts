export type SocialStatus = "STAR" | "PREFERRED" | "NEGLECTED" | "ISOLATED";

export type SociometryInput = {
  studentIds: string[];
  // Each student can have multiple sociometry answers (one per question).
  answersByStudent: Record<string, unknown[]>;
};

export type SociometryEdge = {
  from: string;
  to: string;
  mutual: boolean;
};

export type SociometryMetrics = {
  inDegree: Record<string, number>;
  outDegree: Record<string, number>;
  mutualChoicesByStudent: Record<string, number>;
  mutualPairs: Array<[string, string]>;
  directedEdges: SociometryEdge[];
  totalChoices: number;
  mutualChoices: number;
  cohesion: number;
  statusByStudent: Record<string, SocialStatus>;
  statusCounts: Record<SocialStatus, number>;
};

function uniqueSelectedIds(raw: unknown[], validIds: Set<string>): string[] {
  const selected = new Set<string>();
  for (const value of raw) {
    const id = String(value);
    if (!validIds.has(id)) continue;
    selected.add(id);
  }
  return Array.from(selected);
}

function classifyStatuses(
  studentIds: string[],
  inDegree: Record<string, number>,
): Record<string, SocialStatus> {
  const statusByStudent: Record<string, SocialStatus> = {};
  const nonIsolated = studentIds.filter((id) => (inDegree[id] ?? 0) > 0);
  const sortedDesc = [...nonIsolated].sort((a, b) => {
    const byDegree = (inDegree[b] ?? 0) - (inDegree[a] ?? 0);
    return byDegree !== 0 ? byDegree : a.localeCompare(b);
  });

  const total = sortedDesc.length;
  if (total === 0) {
    for (const id of studentIds) {
      statusByStudent[id] = "ISOLATED";
    }
    return statusByStudent;
  }

  const starCount = Math.max(1, Math.ceil(total * 0.15));
  const neglectedCount = Math.max(1, Math.ceil(total * 0.2));
  const preferredTarget = Math.max(1, Math.ceil(total * 0.4));

  const starSet = new Set(sortedDesc.slice(0, starCount));
  const neglectedCandidates = [...sortedDesc].reverse();
  const neglectedSet = new Set<string>();
  for (const id of neglectedCandidates) {
    if (starSet.has(id)) continue;
    neglectedSet.add(id);
    if (neglectedSet.size >= neglectedCount) break;
  }

  const preferredSet = new Set<string>();
  for (const id of sortedDesc) {
    if (starSet.has(id) || neglectedSet.has(id)) continue;
    preferredSet.add(id);
    if (preferredSet.size >= preferredTarget) break;
  }
  for (const id of sortedDesc) {
    if (starSet.has(id) || neglectedSet.has(id)) continue;
    if (!preferredSet.has(id)) preferredSet.add(id);
  }

  for (const id of studentIds) {
    if ((inDegree[id] ?? 0) === 0) {
      statusByStudent[id] = "ISOLATED";
      continue;
    }
    if (starSet.has(id)) {
      statusByStudent[id] = "STAR";
      continue;
    }
    if (neglectedSet.has(id)) {
      statusByStudent[id] = "NEGLECTED";
      continue;
    }
    statusByStudent[id] = "PREFERRED";
  }

  return statusByStudent;
}

export function calculateSociometryMetrics(input: SociometryInput): SociometryMetrics {
  const validIds = new Set(input.studentIds);
  const edges: Record<string, Set<string>> = {};
  const inDegree: Record<string, number> = {};
  const outDegree: Record<string, number> = {};
  const mutualChoicesByStudent: Record<string, number> = {};

  for (const id of input.studentIds) {
    edges[id] = new Set<string>();
    inDegree[id] = 0;
    outDegree[id] = 0;
    mutualChoicesByStudent[id] = 0;
  }

  for (const chooserId of input.studentIds) {
    const rawAnswers = input.answersByStudent[chooserId] ?? [];
    const selected = uniqueSelectedIds(rawAnswers, validIds);
    for (const chosenId of selected) {
      if (chosenId === chooserId) continue;
      edges[chooserId].add(chosenId);
    }
  }

  for (const id of input.studentIds) {
    const selectedCount = edges[id].size;
    outDegree[id] = selectedCount;
    for (const chosenId of edges[id]) {
      inDegree[chosenId] = (inDegree[chosenId] ?? 0) + 1;
    }
  }

  const mutualPairs: Array<[string, string]> = [];
  for (const a of input.studentIds) {
    for (const b of edges[a]) {
      if (a >= b) continue;
      if (edges[b]?.has(a)) {
        mutualPairs.push([a, b]);
        mutualChoicesByStudent[a] += 1;
        mutualChoicesByStudent[b] += 1;
      }
    }
  }

  const mutualDirectedKey = new Set<string>();
  for (const [a, b] of mutualPairs) {
    mutualDirectedKey.add(`${a}->${b}`);
    mutualDirectedKey.add(`${b}->${a}`);
  }

  const directedEdges: SociometryEdge[] = [];
  for (const from of input.studentIds) {
    const sortedTargets = Array.from(edges[from]).sort((a, b) => a.localeCompare(b));
    for (const to of sortedTargets) {
      directedEdges.push({
        from,
        to,
        mutual: mutualDirectedKey.has(`${from}->${to}`),
      });
    }
  }

  const totalChoices = input.studentIds.reduce((sum, id) => sum + (outDegree[id] ?? 0), 0);
  const mutualChoices = mutualPairs.length;
  const cohesion = totalChoices === 0 ? 0 : mutualChoices / totalChoices;
  const statusByStudent = classifyStatuses(input.studentIds, inDegree);
  const statusCounts: Record<SocialStatus, number> = {
    STAR: 0,
    PREFERRED: 0,
    NEGLECTED: 0,
    ISOLATED: 0,
  };

  for (const id of input.studentIds) {
    const status = statusByStudent[id];
    statusCounts[status] += 1;
  }

  return {
    inDegree,
    outDegree,
    mutualChoicesByStudent,
    mutualPairs,
    directedEdges,
    totalChoices,
    mutualChoices,
    cohesion,
    statusByStudent,
    statusCounts,
  };
}
