#!/usr/bin/env -S deno run --allow-read=input.txt

import {
  addTo,
  Board,
  canMoveTo,
  Direction,
  dirs,
  down,
  filepath,
  isInside,
  left,
  parse,
  right,
  run,
  State,
  up,
} from "./board.ts";

export function wrap(
  state: State,
  board: Board,
  wrapEdges: Map<Direction, number>
): boolean {
  const { extent } = board;
  const { pos, dir } = state;

  const wrapEdge = wrapEdges.get(dir)!;
  if (dir === right || dir === left) {
    pos[0] = wrapEdge;
  } else {
    pos[1] = wrapEdge;
  }

  while (isInside(extent, pos)) {
    const ok = canMoveTo(pos, board);

    if (ok == undefined) {
      addTo(pos, dir);
      continue;
    }
    return ok;
  }

  throw Error("no wrap pos");
}

function password(board: Board): number {
  const { extent } = board;

  const wrapEdges = new Map<Direction, number>([
    [right, 0],
    [up, extent[1]],
    [down, 0],
    [left, extent[0]],
  ]);

  const state = run(board, (state: State) => wrap(state, board, wrapEdges));

  const [col, row] = state.pos;
  return 1000 * row + 4 * col + dirs.indexOf(state.dir);
}

console.log(password(await parse(filepath)));
