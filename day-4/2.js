#!/usr/bin/env -S deno test --allow-read=input.txt

import { lines } from "../util.ts";
import { ascendingStart, parseLine } from "./util.js";

const filepath = "input.txt";

function overlaps(segments) {
  segments.sort(ascendingStart);
  return segments[0][1] >= segments[1][0];
}

async function overlapCount() {
  let count = 0;
  for await (const line of lines(filepath)) {
    const segments = parseLine(line);
    if (overlaps(segments)) {
      console.log(segments);
      ++count;
    }
  }
  return count;
}

console.log(await overlapCount());
