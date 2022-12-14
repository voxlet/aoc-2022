#!/usr/bin/env -S deno test --allow-read=input.txt

import { lines } from "../util.ts";
import { updateHead, updateLink } from "./update.js";

const filepath = "input.txt";

async function visitedCount() {
  const rope = [];
  for (let i = 0; i < 10; ++i) {
    rope.push([0,0]);
  }
  const visited = new Set();
  for await (const line of lines(filepath)) {
    const [dir, times] = line.split(" ");
    for (let i = 0; i < Number(times); ++i) {
      updateHead(rope[0], dir);
      for (let i = 1; i < 10; ++i) {
        updateLink(rope[i], rope[i - 1]);
      }
      visited.add(rope[rope.length - 1].toString());
    }
  }
  return visited.size;
}

console.log(await visitedCount());
