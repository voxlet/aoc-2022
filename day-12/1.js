#!/usr/bin/env -S deno test --allow-read=input.txt

import { bfs, parse } from "./bfs.js";

const filepath = "input.txt";

function fewestSteps(grid, start, end) {
  console.log(start, end);

  return bfs(grid, end, [start]);
}

console.log(fewestSteps(...(await parse(filepath))));
