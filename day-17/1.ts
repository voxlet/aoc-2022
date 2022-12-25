#!/usr/bin/env -S deno test --allow-read=input.txt

import { repeat } from "../util.ts";
import {
  filepath,
  count,
  shapeFor,
  Point,
  height,
  drop,
  add,
  render,
} from "./rock.ts";

export function towerHeight(stopAt: number) {
  const input = Deno.readTextFileSync(filepath).trim().split("");
  const jets = repeat(input);

  const rocks = {
    origins: [],
    ascTopIndexes: [],
  };

  while (count(rocks) < stopAt) {
    const i = count(rocks);
    const shape = shapeFor(i);
    const startFrom: Point = [2, height(rocks) + 3];
    const restedAt = drop(startFrom, shape, rocks, jets);
    add(rocks, restedAt);
  }

  render(rocks);

  return height(rocks);
}

console.log(towerHeight(2022));
