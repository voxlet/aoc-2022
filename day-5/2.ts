#!/usr/bin/env -S deno test --allow-read=input.txt

import { lines } from "../util.ts";
import { parseMove, parseStacks } from "./parse.ts";

const filepath = "input.txt";

async function topStacks() {
  const ls = lines(filepath);
  const stacks = await parseStacks(ls);
  await rearrange(stacks, ls);

  return stacks.map((stack) => stack[stack.length - 1]).join("");
}

async function rearrange(stacks: string[][], ls: AsyncIterable<string>) {
  for await (const line of ls) {
    const { times, from, to } = parseMove(line);
    const vs = stacks[from - 1].slice(-times);
    stacks[from - 1].length -= times;
    stacks[to - 1].push(...vs);
  }
}

console.log(await topStacks());
