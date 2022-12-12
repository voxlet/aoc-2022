#!/usr/bin/env -S deno test --allow-read=input.txt

import { parse, File, Directory, isFile, Root } from "./parse.ts";

const filename = "input.txt";

async function sumOfDirectorySizes(maxSize: number) {
  const root = await parse(filename);

  let sum = 0;
  function size(node: Root | File | Directory): number {
    if (isFile(node)) {
      return node.size;
    }
    const dirSize = Object.values(node.children)
      .map((n) => size(n))
      .reduce((z, s) => z + s);

    if (dirSize <= maxSize) {
      console.log(dirSize, node.name, node.children);
      sum += dirSize;
    }

    return dirSize;
  }

  size(root);

  return sum;
}

console.log(await sumOfDirectorySizes(100000));
