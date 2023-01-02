import {
  add,
  collect,
  Extent,
  isEqual,
  isInside,
  lines,
  toKey,
  Vec2,
} from "../util.ts";

export const filepath = "input.txt";

const dir = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
} as const;

type Dir = typeof dir[keyof typeof dir];

interface Blizzard {
  pos: Vec2;
  direction: Dir;
}

export interface Valley {
  entrance: Vec2;
  exit: Vec2;
  extent: Extent;
  blizzards: Blizzard[];
}

function wrap(blizzard: Blizzard, extent: Extent): Vec2 {
  const [[minX, minY], [maxX, maxY]] = extent;

  const {
    pos: [x, y],
    direction,
  } = blizzard;

  switch (direction) {
    case dir.up:
      return [x, maxY];
    case dir.down:
      return [x, minY];
    case dir.left:
      return [maxX, y];
    case dir.right:
      return [minX, y];
  }

  throw Error("bad dir");
}

export function updateBlizzards(valley: Valley): Set<string> {
  const positions = new Set<string>();
  const { blizzards, extent } = valley;

  for (const b of blizzards) {
    b.pos = add(b.pos, b.direction);
    if (!isInside(extent, b.pos)) {
      b.pos = wrap(b, extent);
    }
    positions.add(toKey(b.pos));
  }
  return positions;
}

function canMoveTo(
  pos: Vec2,
  blizzardPositions: Set<string>,
  valley: Valley
): boolean {
  const { extent, entrance, exit } = valley;
  const posKey = toKey(pos);

  return (
    !blizzardPositions.has(posKey) &&
    (isInside(extent, pos) || isEqual(pos, entrance) || isEqual(pos, exit))
  );
}

export function candidates(
  pos: Vec2,
  blizzardPositions: Set<string>,
  valley: Valley
): Vec2[] {
  const dps: Readonly<Vec2>[] = [dir.up, dir.down, dir.left, dir.right, [0, 0]];
  return dps
    .map((dp) => add(pos, dp))
    .filter((p) => canMoveTo(p, blizzardPositions, valley));
}

export async function parse(filepath: string): Promise<Valley> {
  const ls = await collect(lines(filepath));
  const lineCount = ls.length;

  const blizzardDirections: { [c: string]: Dir } = {
    "^": dir.up,
    v: dir.down,
    "<": dir.left,
    ">": dir.right,
  };

  let entrance: Valley["entrance"];
  let exit: Valley["exit"];
  const blizzards: Valley["blizzards"] = [];

  for (let y = 0; y < lineCount; ++y) {
    const line = ls[y];
    for (let x = 0; x < line.length; ++x) {
      const c = line[x];
      if (y === 0 || y === lineCount - 1) {
        if (c !== ".") {
          continue;
        }
        if (y === 0) {
          entrance = [x, y];
        } else {
          exit = [x, y];
        }
        break;
      }

      const direction = blizzardDirections[c];
      if (!direction) {
        continue;
      }
      blizzards.push({ pos: [x, y], direction });
    }
  }

  return {
    entrance: entrance!,
    exit: exit!,
    extent: [
      [1, 1],
      [ls[0].length - 2, ls.length - 2],
    ],
    blizzards,
  };
}

function swap(valley: Valley) {
  const entrance = valley.entrance;
  valley.entrance = valley.exit;
  valley.exit = entrance;
}

export function* fewestMinutes(valley: Valley): Generator<number> {
  let minutes = 0;

  let queue = [valley.entrance];

  while (queue.length > 0) {
    const blizzardPositions = updateBlizzards(valley);

    const visited = new Set<string>();
    const len = queue.length;
    for (let i = 0; i < len; ++i) {
      const pos = queue.shift()!;
      if (isEqual(pos, valley.exit)) {
        yield minutes;
        minutes = 0;

        swap(valley);
        queue = [pos];
        break;
      }
      const posKey = toKey(pos);
      if (visited.has(posKey)) {
        continue;
      }
      visited.add(posKey);
      queue.push(...candidates(pos, blizzardPositions, valley));
    }
    ++minutes;
  }
}
