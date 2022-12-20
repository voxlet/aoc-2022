#!/usr/bin/env -S deno test --allow-read=input.txt

import {
  Reading,
  cannotContainBeaconXSegmentAtY,
  ascendingStart,
  merge,
  Point,
  query,
  parse,
  filepath,
} from "./reading.ts";

function cannotContainBeaconCount(readings: Reading[], y: number) {
  const segments = readings.map((r) => cannotContainBeaconXSegmentAtY(r, y));
  segments.sort(ascendingStart);

  const merged = merge(segments);
  const count = merged.reduce((z, s) => z + s[1] - s[0], 0);

  const objectPointsOnY = Object.values(
    readings.reduce((z, r) => {
      const obj =
        r.beacon[1] === y ? r.beacon : r.sensor[1] === y ? r.sensor : undefined;
      if (obj) {
        z[obj.toString()] = obj;
      }
      return z;
    }, {} as { [k: string]: Point })
  );

  const objectCount = objectPointsOnY.filter((p) => query(merged, p[0])).length;

  return count - objectCount;
}

console.log(cannotContainBeaconCount(await parse(filepath), 2000000));
