import { lines } from "../util.ts";

export const filepath = "input.txt";

export type Point = [x: number, y: number];

export interface Field {
  objects: { [x: number]: { [y: number]: string } };
  topLeft: Point;
  bottomRight: Point;
  floor: number;
  sandEntrance: Point;
}

export const sandEntrance: Point = [500, 0];

export function set(field: Pick<Field, "objects">, p: Point, kind: string) {
  const { objects } = field;
  const [x, y] = p;
  const ys = objects[x] ?? {};
  ys[y] = kind;
  objects[x] = ys;
}

export function renderLine(field: Field, y: number) {
  const { objects, topLeft, bottomRight } = field;
  let line = "";
  for (let x = topLeft[0]; x <= bottomRight[0]; ++x) {
    line +=
      x === sandEntrance[0] && y === sandEntrance[1]
        ? "+"
        : objects[x]?.[y] ?? ".";
  }
  console.log(line);
}

export function render(field: Field) {
  for (let y = 0; y < field.floor; ++y) {
    renderLine(field, y);
  }
  const { bottomRight, topLeft } = field;
  console.log("#".repeat(bottomRight[0] - topLeft[0] + 1));
}

export async function parse(
  filepath: string,
  sandEntrance: Point
): Promise<Field> {
  const objects: Field["objects"] = {};
  const topLeft = [
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
  ] satisfies Point;
  const bottomRight = [0, 0] satisfies Point;

  const field = { objects, topLeft, bottomRight, sandEntrance };

  function setStatic(p: Point) {
    set(field, p, "#");

    const { topLeft, bottomRight } = field;
    const [x, y] = p;

    topLeft[0] = Math.min(topLeft[0], x);
    topLeft[1] = Math.min(topLeft[1], y);
    bottomRight[0] = Math.max(bottomRight[0], x);
    bottomRight[1] = Math.max(bottomRight[1], y);
  }

  for await (const line of lines(filepath)) {
    const points: Point[] = line.split(" -> ").map((s) => {
      const [x, y] = s.split(",");
      return [Number(x), Number(y)];
    });

    let [prev, ...rest] = points;
    for (const p of rest) {
      if (p[0] !== prev[0] && p[1] === prev[1]) {
        const y = p[1];
        for (
          let x = Math.min(p[0], prev[0]);
          x <= Math.max(p[0], prev[0]);
          ++x
        ) {
          setStatic([x, y]);
        }
      } else if (p[0] === prev[0] && p[1] !== prev[1]) {
        const x = p[0];
        for (
          let y = Math.min(p[1], prev[1]);
          y <= Math.max(p[1], prev[1]);
          ++y
        ) {
          setStatic([x, y]);
        }
      } else {
        throw Error(`bad input: ${prev} -> ${p} in ${line}`);
      }
      prev = p;
    }
  }

  return {
    ...field,
    floor: field.bottomRight[1] + 2,
  };
}

export function dropSand(field: Field): Point {
  const { objects, floor, sandEntrance } = field;
  const sand: Point = [...sandEntrance];

  while (sand[1] < floor - 1) {
    ++sand[1];
    const [x, y] = sand;
    if (objects[x]?.[y] == undefined) {
      continue;
    }
    if (objects[x - 1]?.[y] == undefined) {
      --sand[0];
      continue;
    }
    if (objects[x + 1]?.[y] == undefined) {
      ++sand[0];
      continue;
    }
    set(field, [x, y - 1], "o");
    return [x, y - 1];
  }

  return sand;
}
