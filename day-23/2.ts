#!/usr/bin/env -S deno run --allow-read=input.txt

import { toKey, Vec2 } from "../util.ts";
import {
  State,
  parse,
  filepath,
  propose,
  move,
  updateConsideration,
  Move,
} from "./elf.ts";

export function run(state: State): number {
  let rounds = 0;
  let moves: Move[] = [
    [
      [0, 0],
      [0, 0],
    ],
  ];
  while (moves.length > 0) {
    ++rounds;
    moves = propose(state);
    console.log("round:", rounds, "moves:", moves.length);
    move(state, moves);
    updateConsideration(state);
  }
  return rounds;
}

function firstRoundWithNoMoves(elfPositions: Vec2[]) {
  const elves = elfPositions.reduce((e, p) => {
    e.add(toKey(p));
    return e;
  }, new Set<string>());

  const state = { elves, firstConsideration: 0 };

  return run(state);
}

console.log(firstRoundWithNoMoves(await parse(filepath)));
