import { collect, lines, repeat, take, window } from "../util.ts";

export const filepath = "input.txt";

export type Vec2 = [x: number, y: number];

function add(a: Readonly<Vec2>, b: Readonly<Vec2>): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export function toKey(v: Readonly<Vec2>): string {
  return JSON.stringify(v);
}

function fromKey(k: string): Vec2 {
  return JSON.parse(k);
}

const directions = {
  north: [0, 1],
  south: [0, -1],
  east: [1, 0],
  west: [-1, 0],
} as const;

type Direction = keyof typeof directions;

const directionOrder = ["north", "south", "west", "east"] as const;

export type Move = [from: Vec2, to: Vec2];

export interface State {
  firstConsideration: number;
  elves: Set<string>;
}

export function updateConsideration(state: Pick<State, "firstConsideration">) {
  ++state.firstConsideration;
  state.firstConsideration %= directionOrder.length;
}

function* posIter(state: Pick<State, "elves">) {
  for (const posKey of state.elves) {
    yield fromKey(posKey);
  }
}

type Proximities = {
  [d in Direction]: boolean;
};

type Extent = [Vec2, Vec2];

export function* extentIter(ext: Extent): Generator<Vec2> {
  const [min, max] = ext;
  for (let y = min[1]; y <= max[1]; ++y) {
    for (let x = min[0]; x <= max[0]; ++x) {
      yield [x, y];
    }
  }
}

function* adjacencyIter(pos: Vec2) {
  for (const [x, y] of [
    [-1, 1],
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
  ]) {
    yield add(pos, [x, y]);
  }
}

function proximities(pos: Vec2, state: Pick<State, "elves">) {
  const { elves } = state;
  const existing = [...adjacencyIter(pos)].map((adj) => elves.has(toKey(adj)));
  const proxValues = [...take(window(repeat(existing), 3, 2), 4)].map((w) =>
    w.some((e) => e)
  );

  const [north, east, south, west] = proxValues;
  return {
    north,
    east,
    south,
    west,
  };
}

function* proximityIter(
  prox: Proximities,
  state: Pick<State, "firstConsideration">
): Generator<[Direction, boolean]> {
  for (let i = 0; i < directionOrder.length; ++i) {
    const dir =
      directionOrder[(state.firstConsideration + i) % directionOrder.length];
    yield [dir, prox[dir]];
  }
}

export function propose(state: State): Move[] {
  const proposalsByDest: { [dest: string]: Move } = {};
  const dups = new Set<string>();

  for (const pos of posIter(state)) {
    const prox = proximities(pos, state);
    if (Object.values(prox).every((e) => !e)) {
      continue;
    }

    for (const [dir, exists] of proximityIter(prox, state)) {
      if (exists) {
        continue;
      }

      const dest = add(pos, directions[dir]);
      const k = toKey(dest);

      if (proposalsByDest[k]) {
        dups.add(k);
      }
      proposalsByDest[k] = [pos, dest];
      break;
    }
  }

  return Object.entries(proposalsByDest)
    .filter(([dest, _move]) => !dups.has(dest))
    .map(([_dest, move]) => move);
}

export function move(state: Pick<State, "elves">, moves: Move[]) {
  const { elves } = state;
  for (const [from, to] of moves) {
    elves.delete(toKey(from));
    elves.add(toKey(to));
  }
}

export function extent(state: Pick<State, "elves">): Extent {
  const min: Vec2 = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
  const max: Vec2 = [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];

  for (const pos of posIter(state)) {
    min[0] = Math.min(min[0], pos[0]);
    min[1] = Math.min(min[1], pos[1]);
    max[0] = Math.max(max[0], pos[0]);
    max[1] = Math.max(max[1], pos[1]);
  }
  console.log([min, max]);
  return [min, max];
}

export async function parse(filepath: string): Promise<Vec2[]> {
  const positions: Vec2[] = [];
  let y = 0;
  for (const line of (await collect(lines(filepath))).toReversed()) {
    let x = 0;
    for (const c of line) {
      if (c === "#") {
        positions.push([x, y]);
      }
      ++x;
    }
    ++y;
  }
  return positions;
}

export function render(state: State) {
  const ext = extent(state);
  const [xoffs, yoffs] = ext[0];
  const scr: string[][] = [];
  for (const pos of extentIter(ext)) {
    const [x, y] = pos;
    const sx = x - xoffs;
    const sy = ext[1][1] - yoffs - (y - yoffs);

    const row = scr[sy] ?? [];
    row[sx] = state.elves.has(toKey(pos)) ? "#" : ".";
    scr[sy] = row;
  }
  for (const row of scr) {
    console.log(row.join(""));
  }
}
