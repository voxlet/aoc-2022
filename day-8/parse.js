import { lines } from "../util.ts";

export async function parse(filepath) {
  const trees = [];
  for await (const line of lines(filepath)) {
    const row = line.split("").map((c) => Number(c));
    trees.push(row);
  }
  return trees;
}
