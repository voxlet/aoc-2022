#!/usr/bin/env -S deno test --allow-read=input.txt

import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";

import { lines } from "../util.ts";

const filepath = "input.txt";

Deno.test("even number of lines", async () => {
  for await (const line of lines(filepath)) {
    if (line.length % 2 !== 0) {
      throw Error("odd");
    }
  }
});

const types = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

Deno.test("type sanity", () => {
  assertEquals(52, types.length);
});

const priorities = Object.fromEntries(
  types.split("").map((t, i) => [t, i + 1])
);

async function dupItemPrioritySum() {
  let sum = 0;
  for await (const line of lines(filepath)) {
    const dup = dupItem(line);
    const priority = priorities[dup];
    console.log(dup, priority);
    sum += priority;
  }
  return sum;
}

function dupItem(line) {
  const all = line.split("");
  const halfLength = all.length / 2;
  const first = new Set(all.slice(0, halfLength));
  for (const item of all.slice(halfLength)) {
    if (first.has(item)) {
      return item;
    }
  }
  throw Error("not found");
}

console.log(await dupItemPrioritySum());
