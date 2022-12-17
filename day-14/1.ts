#!/usr/bin/env -S deno test --allow-read=input.txt

import {
  dropSand,
  Field,
  filepath,
  parse,
  render,
  sandEntrance,
} from "./sand.ts";

function restedSandCount(field: Field) {
  let count = 0;
  while (dropSand(field)[1] <= field.bottomRight[1]) {
    ++count;
  }
  return count;
}

const field = await parse(filepath, sandEntrance);
const count = restedSandCount(field);
render(field);
console.log(count);
