import { lines } from "../util.ts";

export const filepath = "input.txt";

export type Point = [x: number, y: number, z: number];

export const directions: Point[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

export interface Cubes {
  grid: {
    [x: number]: {
      [y: number]: {
        [z: number]: number;
      };
    };
  };
  coords: Point[];
}

export function add(grid: Cubes["grid"], point: Point, i: number) {
  const [x, y, z] = point;
  const vx = grid[x] ?? {};
  const vy = vx[y] ?? {};
  vy[z] = i;
  vx[y] = vy;
  grid[x] = vx;
}

export async function parse(filepath: string): Promise<Cubes> {
  const grid: Cubes["grid"] = {};
  const coords: Point[] = [];
  for await (const line of lines(filepath)) {
    const point = JSON.parse(`[${line}]`);
    const i = coords.length;
    coords.push(point);
    add(grid, point, i);
  }
  return { grid, coords };
}
