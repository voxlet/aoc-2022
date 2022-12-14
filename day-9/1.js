#!/usr/bin/env -S deno test --allow-read=input.txt

import { lines } from "../util.ts";
import { updateHead, updateLink } from "./update.js";

const filepath = "input.txt";

async function visitedCount() {
  const head = [0, 0];
  const tail = [0, 0];
  const visited = new Set();
  for await (const line of lines(filepath)) {
    const [dir, times] = line.split(" ");
    for (let i = 0; i < Number(times); ++i) {
      updateHead(head, dir);
      updateLink(tail, head);
      console.log(head, tail, dir);
      visited.add(tail.toString());
    }
  }
  return visited.size;
}

console.log(await visitedCount());
