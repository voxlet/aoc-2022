#!/usr/bin/env -S deno test --allow-read=input.txt

import { difference, powerSet } from "../util.ts";
import {
  Graph,
  distancesBetweenValuableNodes,
  parse,
  filepath,
  dfs,
} from "./graph.ts";

function mostPressure(graph: Graph) {
  const distances = distancesBetweenValuableNodes(graph);
  const remaining = new Set(Object.keys(distances));

  remaining.delete("AA");

  function find(r: Set<string>) {
    return dfs(graph, distances, "AA", 26, 0, r);
  }

  let max = 0;
  for (const a of powerSet(remaining)) {
    if (a.size < 3 || a.size >= Math.trunc(remaining.size / 2)) {
      continue;
    }
    const b = difference(remaining, a);
    const pressure = find(a) + find(b);

    max = Math.max(max, pressure);
  }

  return max;
}

console.log(mostPressure(await parse(filepath)));
