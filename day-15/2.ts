#!/usr/bin/env -S deno test --allow-read=input.txt

import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { lowerBoundWith } from "../util.ts";
import {
  Reading,
  Segment,
  distance,
  cannotContainBeaconXSegmentAtY,
  ascendingStart,
  merge,
  parse,
  filepath,
} from "./reading.ts";

function difference(ls: Segment[], [rStart, rEnd]: Segment): Segment[] {
  const start = lowerBoundWith(ls, (l) => l[1] < rStart);
  const d = ls.slice(0, start);

  let i = start;
  for (; i < ls.length; ++i) {
    const [lStart, lEnd] = ls[i];
    if (lStart >= rEnd) {
      break;
    }
    if (lStart < rStart) {
      d.push([lStart, rStart]);
    }
    if (rEnd < lEnd) {
      d.push([rEnd, lEnd]);
    }
  }

  d.push(...ls.slice(i));
  return d;
}

Deno.test("difference", () => {
  assertEquals(
    difference(
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
      ],
      [1, 4]
    ),
    [
      [0, 1],
      [4, 5],
    ]
  );

  assertEquals(difference([[5, 10]], [0, 7]), [[7, 10]]);
  assertEquals(difference([[5, 10]], [7, 12]), [[5, 7]]);
  assertEquals(difference([[5, 10]], [0, 12]), []);
  assertEquals(difference([[5, 10]], [7, 8]), [
    [5, 7],
    [8, 10],
  ]);
});

function tuningFrequency(readings: Reading[], max: number) {
  const candidates: Segment[][] = Array(max + 1).fill([[0, max + 1]]);
  const visited: Set<number> = new Set();

  for (const reading of readings) {
    const d = distance(reading);
    const { sensor } = reading;
    const [_, sy] = sensor;
    const start = Math.max(0, sy - d);
    const end = Math.min(max, sy + d);
    for (let y = start; y <= end; ++y) {
      if (visited.has(y)) {
        continue;
      }
      visited.add(y);

      const segments = readings.map((r) =>
        cannotContainBeaconXSegmentAtY(r, y)
      );
      segments.sort(ascendingStart);
      const merged = merge(segments);

      const cs = candidates[y];
      candidates[y] = merged.reduce((z, s) => difference(z, s), cs);
    }
  }

  const fs = [];
  for (let y = 0; y < candidates.length; ++y) {
    const c = candidates[y];
    if (c.length === 0) {
      continue;
    }
    console.log(c);
    if (c.length > 1) {
      throw Error("more than one candidate segment");
    }
    const [x, xEnd] = c[0];
    if (xEnd != x + 1) {
      throw Error("more than one candidate");
    }
    fs.push(x * max + y);
  }

  if (fs.length !== 1) {
    throw Error("more than one candidate");
  }
  return fs[0];
}

console.log(tuningFrequency(await parse(filepath), 4000000));
