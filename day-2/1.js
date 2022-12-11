#!/usr/bin/env -S deno run --allow-read=input.txt

import { readLines } from "https://deno.land/std@0.167.0/io/mod.ts";

const scores = {
  X: 1,
  Y: 2,
  Z: 3,
  lose: 0,
  draw: 3,
  win: 6,
}

const draws = {
  A: "X",
  B: "Y",
  C: "Z",
}

const wins = {
  A: "Y",
  B: "Z",
  C: "X",
}

async function score(filepath) {
  const inputFile = await Deno.open(filepath);

  let score = 0;
  for await (const line of readLines(inputFile)) {
    const [lhs, rhs] = line.split(" ");
    const res = result(lhs, rhs);
    console.log(lhs, rhs, res, scores[res] + scores[rhs]);
    score += scores[res] + scores[rhs];
  }

  return score;
}

function result(lhs, rhs) {
  return draws[lhs] === rhs ? "draw" : wins[lhs] === rhs ? "win" : "lose";
}

console.log(await score("./input.txt"))
