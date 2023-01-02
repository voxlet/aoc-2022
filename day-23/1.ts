#!/usr/bin/env -S deno run --allow-read=input.txt

import {
  State,
  extentIter,
  extent,
  toKey,
  Vec2,
  parse,
  filepath,
  propose,
  move,
  updateConsideration,
  render,
} from "./elf.ts";

export function run(state: State, rounds: number) {
  for (let i = 0; i < rounds; ++i) {
    console.log("round", i + 1);
    const moves = propose(state);
    move(state, moves);
    updateConsideration(state);
    render(state);
  }
}

function emptyCount(state: Pick<State, "elves">): number {
  let count = 0;
  for (const pos of extentIter(extent(state))) {
    if (state.elves.has(toKey(pos))) {
      ++count;
    }
  }
  return count;
}

function emptyCountAfter10(elfPositions: Vec2[]) {
  const elves = elfPositions.reduce((e, p) => {
    e.add(toKey(p));
    return e;
  }, new Set<string>());

  const state = { elves, firstConsideration: 0 };

  run(state, 10);
  return emptyCount(state);
}

console.log(emptyCountAfter10(await parse(filepath)));
