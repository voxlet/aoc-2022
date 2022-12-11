#!/usr/bin/env -S deno run --allow-read=input.txt

import { readLines } from "https://deno.land/std@0.167.0/io/mod.ts";

const scores = {
  A: 1,
  B: 2,
  C: 3,
  X: 0,
  Y: 3,
  Z: 6,
}


const rule = {
  X: {
    A: "C",
    B: "A",
    C: "B",
  },
  Y: {
    A: "A",
    B: "B",
    C: "C",
  },
  Z: {
    A: "B",
    B: "C",
    C: "A",
  },
}

async function score(filepath) {
  const inputFile = await Deno.open(filepath);

  let score = 0;
  for await (const line of readLines(inputFile)) {
    const [lhs, res] = line.split(" ");
    const rhs = rule[res][lhs];

    console.log(lhs, rhs, res, scores[res] + scores[rhs]);
    score += scores[res] + scores[rhs];
  }

  return score;
}

console.log(await score("./input.txt"))
