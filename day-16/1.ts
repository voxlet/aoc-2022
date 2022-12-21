#!/usr/bin/env -S deno test --allow-read=input.txt

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
  return dfs(graph, distances, "AA", 30, 0, remaining);
}

console.log(mostPressure(await parse(filepath)));
