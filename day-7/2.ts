#!/usr/bin/env -S deno test --allow-read=input.txt

import { lowerBound } from "../util.ts";
import { parse, File, Directory, isFile, Root } from "./parse.ts";

const filename = "input.txt";

function sizes(root: Root): number[] {
  const res: number[] = [];
  function size(node: Root | File | Directory): number {
    if (isFile(node)) {
      return node.size;
    }
    const dirSize = Object.values(node.children)
      .map((n) => size(n))
      .reduce((z, s) => z + s);

    res.push(dirSize);
    return dirSize;
  }

  size(root);
  return res;
}

async function smallestSufficientDirectorySize() {
  const root = await parse(filename);
  const res = sizes(root);
  res.sort((a, b) => a - b);

  const total = 70000000;
  const used = res[res.length - 1];
  const available = total - used;
  const needed = 30000000 - available;

  return res[lowerBound(res, needed)];
}

console.log(await smallestSufficientDirectorySize());
