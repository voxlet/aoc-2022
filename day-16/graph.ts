import { lines } from "../util.ts";

export const filepath = "input.txt";

export interface Graph {
  flowRates: { [node: string]: number };
  neighbors: { [node: string]: string[] };
}

export async function parse(filepath: string): Promise<Graph> {
  const flowRates: Graph["flowRates"] = {};
  const neighbors: Graph["neighbors"] = {};
  for await (const line of lines(filepath)) {
    const res =
      /^Valve (?<node>\w+) has flow rate=(?<flowRate>\d+); tunnels? leads? to valves? (?<ns>.+)$/.exec(
        line
      );
    if (!res?.groups) {
      throw Error("bad input");
    }
    const { node, flowRate, ns } = res.groups;
    flowRates[node] = Number(flowRate);
    neighbors[node] = ns.split(", ");
  }
  return { flowRates, neighbors };
}

export interface Distances {
  [node: string]: { [node: string]: number };
}

function setDistance(ds: Distances, a: string, b: string, d: number) {
  const forward = ds[a] ?? {};
  forward[b] = d;
  ds[a] = forward;

  const backward = ds[b] ?? {};
  backward[a] = d;
  ds[b] = backward;
}

function merge(to: Distances, from: Distances) {
  for (const n of Object.keys(from)) {
    const ns = to[n] ?? {};
    Object.assign(ns, from[n]);
    to[n] = ns;
  }
}

export function distancesBetweenValuableNodes(graph: Graph): Distances {
  const valuableNodes = Object.entries(graph.flowRates)
    .filter(([_, flowRate]) => flowRate > 0)
    .map(([node]) => node);

  valuableNodes.push("AA");

  const ds = {};
  for (let i = 0; i < valuableNodes.length; ++i) {
    const source = valuableNodes[i];
    const dests = valuableNodes.slice(i + 1);

    merge(ds, distances(graph, source, dests));
  }

  return ds;
}

function distances(graph: Graph, source: string, dests: string[]): Distances {
  const queue = [source];
  const visited = new Set();
  const remaining = new Set(dests);

  const ds: Distances = {};
  let distance = 0;
  while (queue.length > 0 && remaining.size > 0) {
    const l = queue.length;
    for (let i = 0; i < l; ++i) {
      const node = queue.shift()!;
      if (visited.has(node)) {
        continue;
      }
      visited.add(node);

      if (remaining.has(node)) {
        remaining.delete(node);
        setDistance(ds, source, node, distance);
      }
      queue.push(...graph.neighbors[node]);
    }
    ++distance;
  }

  if (remaining.size !== 0) {
    throw Error("unreachable nodes");
  }
  return ds;
}

interface Pressures {
  [node: string]: number;
}

export function pressures(
  graph: Graph,
  ds: Distances,
  from: string,
  minutesLeft: number
): Pressures {
  return Object.fromEntries(
    Object.entries(ds[from]).map(([node, d]) => [
      node,
      graph.flowRates[node] * (minutesLeft - d - 1),
    ])
  );
}

export function dfs(
  graph: Graph,
  distances: Distances,
  node: string,
  minutesLeft: number,
  pressure: number,
  remaining: Set<string>
): number {
  if (remaining.size === 0) {
    return pressure;
  }
  const ds = distances[node];
  const ps = pressures(graph, distances, node, minutesLeft);

  let max = 0;
  for (const dest of remaining) {
    const nextMinutesLeft = minutesLeft - ds[dest] - 1;
    if (nextMinutesLeft < 0) {
      max = Math.max(max, pressure);
      continue;
    }
    const nextRemaining = new Set(remaining);
    nextRemaining.delete(dest);
    max = Math.max(
      max,
      dfs(
        graph,
        distances,
        dest,
        nextMinutesLeft,
        pressure + ps[dest],
        nextRemaining
      )
    );
  }
  return max;
}
