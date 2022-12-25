#!/usr/bin/env -S deno test --allow-read=input.txt

import { add, directions, Point } from "./cube.ts";
import { Cubes, parse, filepath } from "./cube.ts";

type Extent = [min: Point, max: Point];

function extent(cubes: Cubes): Extent {
  const min = Array(3).fill(Number.MAX_SAFE_INTEGER) as Point;
  const max = Array(3).fill(0) as Point;

  for (const p of cubes.coords) {
    for (let i = 0; i < 3; ++i) {
      min[i] = Math.min(min[i], p[i]);
      max[i] = Math.max(max[i], p[i]);
    }
  }

  console.log(min, max);
  return [min.map((v) => v - 1), max.map((v) => v + 1)] as Extent;
}

function findExteriorCubes(cubes: Cubes): [Point[], Cubes["grid"]] {
  const queue = extent(cubes);
  const [min, max] = queue;
  const visited = new Set<string>();
  const empties: Cubes["grid"] = {};
  const exteriors: Point[] = [];

  while (queue.length > 0) {
    const [x, y, z] = queue.shift()!;
    const key = [x, y, z].toString();
    if (
      x < min[0] ||
      y < min[1] ||
      z < min[2] ||
      x > max[0] ||
      y > max[1] ||
      z > max[2] ||
      visited.has(key)
    ) {
      continue;
    }
    visited.add(key);

    if (cubes.grid[x]?.[y]?.[z] != undefined) {
      exteriors.push([x, y, z]);
      continue;
    }

    add(empties, [x, y, z], 1);
    for (const [dx, dy, dz] of directions) {
      queue.push([x + dx, y + dy, z + dz]);
    }
  }

  return [exteriors, empties];
}

function exteriorSurfaceArea(cubes: Cubes): number {
  const [exteriors, empties] = findExteriorCubes(cubes);

  let area = 0;
  for (const [x, y, z] of exteriors) {
    for (const [dx, dy, dz] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      if (nx < 0 || ny < 0 || nz < 0 || empties[nx]?.[ny]?.[nz] != undefined) {
        area += 1;
      }
    }
  }
  return area;
}

console.log(exteriorSurfaceArea(await parse(filepath)));
