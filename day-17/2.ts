#!/usr/bin/env -S deno test --allow-read=input.txt

import { repeat } from "../util.ts";
import { towerHeight } from "./1.ts";
import {
  filepath,
  count,
  shapeFor,
  Point,
  height,
  drop,
  add,
  Rocks,
} from "./rock.ts";

interface CountableIterator<T> extends Iterator<T> {
  count: number;
}

function wrapCountable<T>(it: Iterator<T>): CountableIterator<T> {
  const res = {
    count: 0,
    next() {
      ++res.count;
      return it.next();
    },
  };

  return res;
}

function findCycle(): [[i: number, h: number], [i: number, h: number], Rocks] {
  const input = Deno.readTextFileSync(filepath).trim().split("");
  const jets = wrapCountable(repeat(input));

  const rocks = {
    origins: [],
    ascTopIndexes: [],
  };

  const resetPoints: { [jetIndex: number]: [i: number, h: number] } = {};
  while (true) {
    const i = count(rocks);
    const shape = shapeFor(i);
    const startFrom: Point = [2, height(rocks) + 3];
    const restedAt = drop(startFrom, shape, rocks, jets);

    add(rocks, restedAt);

    if (shape === 0 && (restedAt[0] === 1 || restedAt[0] === 2)) {
      const jetIndex = jets.count % input.length;
      const h = height(rocks);
      if (resetPoints[jetIndex]) {
        const res: [[i: number, h: number], [i: number, h: number], Rocks] = [
          resetPoints[jetIndex],
          [i, h],
          rocks,
        ];
        console.log("found cycle:", jetIndex, res);
        return res;
      } else {
        resetPoints[jetIndex] = [i, h];
      }
    }
  }
}

function largeTowerHeight(stopAt: number): number {
  const [[offset, h1], [i, h2]] = findCycle();
  const period = i - offset;
  const height = h2 - h1;

  const leftOver = stopAt - i;
  const cycles = Math.trunc(leftOver / period);
  const remainder = leftOver % period;
  console.log(cycles, remainder, period, height);

  const cycleHeight = cycles * height;
  const remainderHeight = towerHeight(remainder + offset) - h1;
  return h2 + cycleHeight + remainderHeight;
}

console.log(largeTowerHeight(1000000000000));
