import { lines } from "../util.ts";

export function bfs(grid, end, queue) {
  const visited = new Set();
  const order = (a, b) => euclidean(a, end) - euclidean(b, end);

  let steps = 0;
  while (queue.length !== 0) {
    const levelCount = queue.length;
    for (let i = 0; i < levelCount; ++i) {
      const node = queue.shift();
      if (isDestination(node, end)) {
        return steps;
      }
      const key = toKey(node);
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      queue.push(...neighbors(node, order, grid));
    }
    ++steps;
  }

  throw Error("not found");
}

function toKey(node) {
  return node.toString();
}

function isDestination(node, end) {
  return node[0] === end[0] && node[1] === end[1];
}

function neighbors(node, order, grid) {
  const [i, j] = node;
  const ns = [
    [i + 1, j],
    [i - 1, j],
    [i, j + 1],
    [i, j - 1],
  ].filter((n) => inGrid(n, grid) && canClimb(n, node, grid));

  ns.sort(order);
  return ns;
}

function euclidean(a, b) {
  const di = a[0] - b[0];
  const dj = a[1] - b[1];
  return di * di + dj * dj;
}

function inGrid(node, grid) {
  const [i, j] = node;
  return i >= 0 && i < grid.length && j >= 0 && j < grid[0].length;
}

function canClimb(to, from, grid) {
  const [ti, tj] = to;
  const toHeight = grid[ti][tj];
  const [fi, fj] = from;
  const fromHeight = grid[fi][fj];

  return toHeight < fromHeight || toHeight - fromHeight <= 1;
}

export async function parse(filename) {
  const heights = Object.fromEntries(
    "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, i])
  );
  console.log(heights);
  const grid = [];
  let start;
  let end;

  let i = 0;
  for await (const line of lines(filename)) {
    const row = line.split("").map((c, j) => {
      if (c === "S") {
        start = [i, j];
        return 0;
      } else if (c === "E") {
        end = [i, j];
        return Object.keys(heights).length - 1;
      }
      return heights[c];
    });
    grid.push(row);

    ++i;
  }

  console.log(grid);

  return [grid, start, end];
}
