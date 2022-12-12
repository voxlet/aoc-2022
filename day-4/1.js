#!/usr/bin/env -S deno test --allow-read=input.txt

import {
  assertFalse,
  assert,
} from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { lines } from "../util.ts";
import { ascendingStart, parseLine } from "./util.js";

const filepath = "input.txt";

function fullyContains(segments) {
  segments.sort(ascendingStart);
  return (
    segments[0][1] >= segments[1][1] ||
    (segments[0][0] === segments[1][0] && segments[1][1] >= segments[0][1])
  );
}

Deno.test("can detect fully contained", () => {
  assertFalse(
    fullyContains([
      [0, 1],
      [2, 3],
    ])
  );
  assertFalse(
    fullyContains([
      [4, 5],
      [2, 3],
    ])
  );
  assert(
    fullyContains([
      [2, 3],
      [2, 3],
    ])
  );
  assert(
    fullyContains([
      [2, 3],
      [2, 6],
    ])
  );
  assert(
    fullyContains([
      [2, 3],
      [1, 6],
    ])
  );
  assert(
    fullyContains([
      [1, 6],
      [2, 3],
    ])
  );
});

async function fullyContainedCount() {
  let count = 0;
  for await (const line of lines(filepath)) {
    const segments = parseLine(line);
    if (fullyContains(segments)) {
      console.log(segments);
      ++count;
    }
  }
  return count;
}

console.log(await fullyContainedCount());
