#!/usr/bin/env -S deno run --allow-read=input.txt

import { calories } from "./calories.js";

async function top3(filepath) {
  const inputFile = await Deno.open(filepath);
  const cs = calories(inputFile);

  const minHeap = [];

  for (let i = 0; i < 3; ++i) {
    minHeap.push((await cs.next()).value);
  }
  minHeap.sort((a, b) => a - b);

  for await (const c of cs) {
    if (c <= minHeap[0]) {
      continue;
    }
    minHeap[0] = c;
    let swap = 0;
    for (const child of [1, 2]) {
      if (minHeap[swap] > minHeap[child]) {
        swap = child;
      }
    }
    minHeap[0] = minHeap[swap];
    minHeap[swap] = c;
  }

  return minHeap;
}

console.log((await top3("./input.txt")).reduce((z, c) => z + c));
