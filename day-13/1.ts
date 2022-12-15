#!/usr/bin/env -S deno test --allow-read=input.txt

import { lines, partition } from "../util.ts";
import { correctOrder } from "./correctOrder.ts";

const filepath = "input.txt";

async function correctOrderIndexes() {
  const indexes = [];
  let i = 1;
  for await (const chunk of partition(3, lines(filepath))) {
    const [left, right] = parse(chunk);
    if (correctOrder(left, right)) {
      indexes.push(i);
    }

    ++i;
  }

  return indexes;
}

function parse(chunk: string[]) {
  return chunk.slice(0, 2).map((line) => JSON.parse(line));
}

console.log((await correctOrderIndexes()).reduce((z, x) => z + x));
