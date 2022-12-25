import { last, lowerBoundWith } from "../util.ts";

export const filepath = "input.txt";

const shapes = [
  [[1, 1, 1, 1]],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  [[1], [1], [1], [1]],
  [
    [1, 1],
    [1, 1],
  ],
];

const shapeCount = shapes.length;

export type Point = [number, number];

export interface Rocks {
  origins: Point[];
  ascTopIndexes: number[];
}

export function add(rocks: Rocks, origin: Point) {
  const { origins, ascTopIndexes } = rocks;
  const added = origins.length;
  origins.push(origin);

  const at = lowerBoundWith(
    ascTopIndexes,
    (i) => heightOf(rocks, i) < heightOf(rocks, added)
  );
  ascTopIndexes.splice(at, 0, added);
}

export function count(rocks: Rocks) {
  return rocks.origins.length;
}

export function shapeFor(i: number) {
  return i % shapeCount;
}

function shapeHeight(shape: number) {
  return shapes[shape].length;
}

function shapeWidth(shape: number) {
  return shapes[shape][0].length;
}

function heightOf(rocks: Rocks, i: number) {
  const [_, y] = rocks.origins[i];
  const h = shapeHeight(shapeFor(i));
  return y + h;
}

export function height(rocks: Rocks) {
  if (rocks.origins.length === 0) {
    return 0;
  }
  return heightOf(rocks, last(rocks.ascTopIndexes));
}

function next(jets: Iterator<string>): -1 | 1 {
  const jet = jets.next().value;
  if (jet === ">") {
    return 1;
  }
  if (jet === "<") {
    return -1;
  }
  throw Error(`bad input: ${jet}`);
}

interface Rock {
  origin: Point;
  shape: number;
}

function broadPhase(a: Rock, b: Rock) {
  const [ax, ay] = a.origin;
  const [bx, by] = b.origin;
  return (
    ay + shapeHeight(a.shape) >= by &&
    by + shapeHeight(b.shape) >= ay &&
    ax + shapeWidth(a.shape) >= bx &&
    bx + shapeWidth(b.shape) >= ax
  );
}

function narrowPhase(a: Rock, b: Rock) {
  const [ax, ay] = a.origin;
  const [bx, by] = b.origin;
  const left = bx - ax;
  const bottom = by - ay;

  const iLeft = Math.max(0, left);
  const iBottom = Math.max(0, bottom);
  const iRight = Math.min(shapeWidth(a.shape), left + shapeWidth(b.shape));
  const iTop = Math.min(shapeHeight(a.shape), bottom + shapeHeight(b.shape));

  const dx = bx - ax;
  const dy = by - ay;

  for (let x = iLeft; x < iRight; ++x) {
    for (let y = iBottom; y < iTop; ++y) {
      const av = shapes[a.shape][y][x];
      if (av == undefined) {
        continue;
      }
      const bv = shapes[b.shape][y - dy][x - dx];
      if (bv == undefined) {
        continue;
      }
      if (av === 1 && bv === 1) {
        return true;
      }
    }
  }

  return false;
}

function collideRocks(a: Rock, b: Rock): boolean {
  if (!broadPhase(a, b)) {
    return false;
  }
  return narrowPhase(a, b);
}

function collide(rocks: Rocks, origin: Point, shape: number): boolean {
  const { ascTopIndexes, origins } = rocks;
  for (let j = ascTopIndexes.length - 1; j >= 0; --j) {
    const i = ascTopIndexes[j];
    if (
      collideRocks(
        { origin: origins[i], shape: shapeFor(i) },
        { origin, shape }
      )
    ) {
      return true;
    }
  }
  return false;
}

export function drop(
  startFrom: Point,
  shape: number,
  rocks: Rocks,
  jets: Iterator<string>
): Point {
  let restedAt = startFrom;
  while (restedAt[1] >= 0) {
    let [x, y] = restedAt;
    const dx = next(jets);
    if (
      x + dx >= 0 &&
      x + dx + shapeWidth(shape) <= 7 &&
      !collide(rocks, [x + dx, y], shape)
    ) {
      x += dx;
    }
    if (y - 1 < 0 || collide(rocks, [x, y - 1], shape)) {
      return [x, y];
    }
    restedAt = [x, y - 1];
  }
  return restedAt;
}

export function render(rocks: Rocks) {
  const h = 100;
  const data = [];
  for (let y = 0; y < h; ++y) {
    const row = [];
    for (let x = 0; x < 7; ++x) {
      row.push(".");
    }
    data.push(row);
  }
  for (let i = 0; i < rocks.origins.length; ++i) {
    const [ox, oy] = rocks.origins[i];
    const shape = shapes[shapeFor(i)];
    for (let y = oy; y < oy + shape.length; ++y) {
      if (y >= h) {
        break;
      }
      for (let x = ox; x < ox + shape[0].length; ++x) {
        const v = shape[y - oy][x - ox];
        if (v === 0) {
          continue;
        }
        data[y][x] = `${i % 10}`;
      }
    }
  }
  for (let y = h - 1; y >= 0; --y) {
    console.log(data[y].join(""));
  }
}
