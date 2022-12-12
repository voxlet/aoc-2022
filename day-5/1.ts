#!/usr/bin/env -S deno test --allow-read=input.txt

import { lines } from "../util.js";
import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";

const filepath = "input.txt";

async function topStacks() {
  const ls = lines(filepath);
  const stacks = await parseStacks(ls);
  console.log("start", stacks.map((stack) => stack[stack.length - 1]).join(""));
  await rearrange(stacks, ls);

  return stacks.map((stack) => stack[stack.length - 1]).join("");
}

async function parseStacks(ls: AsyncIterator<string>) {
  const parseChunkSize = 4;

  const stacks: string[][] = [];
  let it = await ls.next();
  while (!it.done) {
    // for await (const line of ls) {
    const line = it.value;
    if (line === "") {
      break;
    }
    it = await ls.next();
    if (line === " 1   2   3   4   5   6   7   8   9") {
      continue;
    }

    let start = 0;
    let index = 0;
    while (start < line.length) {
      const val = parseChunk(line.substring(start, start + parseChunkSize));
      if (val.length > 0) {
        const stack = stacks[index] ?? [];
        stack.unshift(val);
        stacks[index] = stack;
      }
      ++index;
      start += parseChunkSize;
    }
  }

  if (stacks.length !== 9) {
    throw Error("bad stack count");
  }

  return stacks;
}

function parseChunk(s: string) {
  return s.replaceAll(/\[|\]| /g, "");
}

Deno.test("can parse chunk", () => {
  assertEquals("G", parseChunk("[G] "));
  assertEquals("", parseChunk("    "));
});

async function rearrange(stacks: string[][], ls: AsyncIterable<string>) {
  for await (const line of ls) {
    const { times, from, to } = parseMove(line);
    for (let i = 0; i < times; ++i) {
      const v = stacks[from - 1].pop();
      if (!v) {
        throw Error("stack underflow");
      }
      stacks[to - 1].push(v);
    }
  }
}

function parseMove(line: string) {
  const matches = line.matchAll(
    /^move (?<times>\d+) from (?<from>\d+) to (?<to>\d+)$/g
  );

  let result;
  for (const match of matches) {
    if (match?.groups == undefined) {
      throw Error("malformed");
    }
    result = Object.fromEntries(
      Object.entries(match.groups).map(([k, v]) => [k, Number(v)])
    ) as { times: number; from: number; to: number };
  }

  if (!result) {
    throw Error("malformed");
  }

  return result;
}

Deno.test("can parse move", () => {
  assertEquals({ times: 1, from: 6, to: 8 }, parseMove("move 1 from 6 to 8"));
  assertEquals(
    { times: 100, from: 600, to: 800 },
    parseMove("move 100 from 600 to 800")
  );
});

console.log("done", await topStacks());
