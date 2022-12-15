#!/usr/bin/env -S deno test --allow-read=input.txt

import { bfs, parse } from "./bfs.js";

const filepath = "input.txt";

function fewestSteps(grid, start, end) {
  const queue = [start];
  grid.forEach((row, i) =>
    row.forEach((height, j) => {
      if (height === 0) {
        queue.push([i, j]);
      }
    })
  );

  return bfs(grid, end, queue);
}

console.log(fewestSteps(...(await parse(filepath))));
