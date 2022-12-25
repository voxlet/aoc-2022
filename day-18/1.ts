#!/usr/bin/env -S deno test --allow-read=input.txt

import { Cubes, parse, filepath, directions } from "./cube.ts";

function surfaceArea(cubes: Cubes): number {
  const { grid, coords } = cubes;

  let area = 0;
  for (const [x, y, z] of coords) {
    for (const [dx, dy, dz] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      if (nx < 0 || ny < 0 || nz < 0 || grid[nx]?.[ny]?.[nz] == undefined) {
        area += 1;
      }
    }
  }
  return area;
}

console.log(surfaceArea(await parse(filepath)));
