import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { collect, lines } from "../util.ts";

export const filepath = "input.txt";

export type Vec2 = [x: number, y: number];

export function addTo(to: Vec2, add: Readonly<Vec2>) {
  to[0] += add[0];
  to[1] += add[1];
}

export function isInside(extent: Vec2, v: Vec2) {
  return v.every((n, i) => n >= 0 && n <= extent[i]);
}

type Tile = "#" | "." | undefined;

type BoardMap = Tile[][];

function tileAt(map: BoardMap, pos: Vec2): Tile {
  const [x, y] = pos;
  return map[y][x];
}

type Turn = "L" | "R";

export const up = [0, -1] as const;
export const down = [0, 1] as const;
export const left = [-1, 0] as const;
export const right = [1, 0] as const;

export const dirs = [right, down, left, up] as const;
export type Direction = typeof dirs[number];

export interface Board {
  map: BoardMap;
  extent: Vec2;
  startPos: Vec2;
  moves: number[];
  turns: Turn[];
}

export function canMoveTo(pos: Vec2, board: Board): boolean | undefined {
  const tile = tileAt(board.map, pos);
  if (tile === ".") {
    return true;
  }
  if (tile === "#") {
    return false;
  }
  return undefined;
}

export interface State {
  pos: Vec2;
  dir: Direction;
}

export function move(
  state: State,
  m: number,
  board: Board,
  wrapFn: (state: State) => boolean
) {
  for (let i = 0; i < m; ++i) {
    const { pos, dir } = state;
    const prev: Vec2 = [...pos];
    addTo(pos, dir);

    const ok = canMoveTo(pos, board);

    if (ok != undefined) {
      if (ok) {
        continue;
      }
      state.pos = prev;
      break;
    }

    const origDir = state.dir;
    if (!wrapFn(state)) {
      state.pos = prev;
      state.dir = origDir;
      break;
    }
  }
}

export function turn(state: Pick<State, "dir">, t: Turn) {
  const i = dirs.indexOf(state.dir) + (t === "R" ? 1 : -1);
  state.dir = dirs[i < 0 ? dirs.length + i : i % dirs.length];
}

Deno.test("turn", () => {
  const state = { dir: right as Direction };

  turn(state, "L");
  assertEquals(state.dir, up);

  turn(state, "R");
  assertEquals(state.dir, right);
});

export async function parse(filepath: string): Promise<Board> {
  const ls = await collect(lines(filepath));

  const map: BoardMap = [[]];
  let maxX = 0;
  let i = 0;
  let line = ls[i];
  while (line != "") {
    const row: Tile[] = line
      .split("")
      .map((c) => (c === "#" || c === "." ? c : undefined));
    row.unshift(undefined);

    map.push(row);
    maxX = Math.max(maxX, row.length);

    ++i;
    line = ls[i];
  }
  map.push([]);

  const extent: Vec2 = [maxX, map.length - 1];

  const startPos: Vec2 = [0, 1];
  while (tileAt(map, startPos) != ".") {
    ++startPos[0];
  }

  ++i;
  const moves: number[] = [];
  const turns: Turn[] = [];
  for (const res of ls[i].matchAll(/(?<move>\d+)(?<turn>L|R?)/g)) {
    if (!res.groups) {
      throw Error("bad input");
    }
    const { move, turn } = res.groups;
    moves.push(Number(move));
    if (turn) {
      turns.push(turn as Turn);
    }
  }

  return { map, extent, startPos, moves, turns };
}

export function run(board: Board, wrapFn: (state: State) => boolean): State {
  const { startPos, moves, turns } = board;
  console.log(startPos, board.extent);

  const dir = right;
  const state: State = { pos: startPos, dir };

  let m = moves.shift();
  let t = turns.shift();
  while (m != undefined) {
    move(state, m, board, wrapFn);
    if (t) {
      turn(state, t);
    }

    m = moves.shift();
    t = turns.shift();
  }

  return state;
}
