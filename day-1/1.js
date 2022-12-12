#!/usr/bin/env -S deno run --allow-read=input.txt

import { calories } from "./calories.js";

async function maxCalories(filepath) {
  const inputFile = await Deno.open(filepath);

  let max = 0;
  for await (const c of calories(inputFile)) {
    max = Math.max(max, c);
  }
  return max;
}

console.log(await maxCalories("./input.txt"));
