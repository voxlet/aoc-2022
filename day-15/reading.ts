import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { lines, lowerBoundWith } from "../util.ts";

export const filepath = "input.txt";

export type Point = [x: number, y: number];

export interface Reading {
  sensor: Point;
  beacon: Point;
}

export function distance(reading: Reading) {
  const { sensor, beacon } = reading;
  const [sx, sy] = sensor;
  const [bx, by] = beacon;
  return Math.abs(sx - bx) + Math.abs(sy - by);
}

Deno.test("distance", () => {
  assertEquals(7, distance({ sensor: [2, 18], beacon: [-2, 15] }));
});

export type Segment = [start: number, endExclusive: number];

export function ascendingStart(a: Segment, b: Segment) {
  return a[0] - b[0];
}

export function merge(sortedSegments: Segment[]): Segment[] {
  const merged = [];

  let merging = sortedSegments[0];
  if (!merging) {
    return [];
  }

  for (let i = 1; i < sortedSegments.length; ++i) {
    const s = sortedSegments[i];

    if (s[0] <= merging[1]) {
      merging[1] = Math.max(s[1], merging[1]);
      continue;
    }
    merged.push(merging);
    merging = s;
  }

  merged.push(merging);
  return merged;
}

export function query(
  mergedSegments: Segment[],
  x: number
): Segment | undefined {
  const s = mergedSegments[lowerBoundWith(mergedSegments, (s) => s[1] < x)];
  if (!s) {
    return undefined;
  }
  return s[0] <= x && x < s[1] ? s : undefined;
}

export function cannotContainBeaconXSegmentAtY(
  reading: Reading,
  y: number
): Segment {
  const [sx, sy] = reading.sensor;
  const half =
    y > sy ? sy + distance(reading) - y : distance(reading) - (sy - y);
  if (half < 0) {
    return [sx, sx];
  }
  return [sx - half, sx + half + 1];
}

Deno.test("cannotContainBeaconXSegmentAtY", () => {
  const r = { sensor: [8, 7], beacon: [2, 10] } satisfies Reading;
  assertEquals(cannotContainBeaconXSegmentAtY(r, 7), [-1, 18]);
  assertEquals(cannotContainBeaconXSegmentAtY(r, -2), [8, 9]);
  assertEquals(cannotContainBeaconXSegmentAtY(r, 16), [8, 9]);
});

export async function parse(filepath: string): Promise<Reading[]> {
  const readings = [];

  for await (const line of lines(filepath)) {
    const res =
      /Sensor at x=(?<sx>-?\d+), y=(?<sy>-?\d+): closest beacon is at x=(?<bx>-?\d+), y=(?<by>-?\d+)/.exec(
        line
      );
    if (!res?.groups) {
      throw Error("bad input");
    }
    const { sx, sy, bx, by } = Object.fromEntries(
      Object.entries(res.groups).map(([k, v]) => [k, Number(v)])
    );
    readings.push({
      sensor: [sx, sy] satisfies Point,
      beacon: [bx, by] satisfies Point,
    });
  }

  return readings;
}
