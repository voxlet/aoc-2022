#!/usr/bin/env -S deno test --allow-read=input.txt

import {
  dropSand,
  Field,
  filepath,
  parse,
  Point,
  render,
  sandEntrance,
  set,
} from "./sand.ts";

function dropSandWithFloor(field: Field): Point {
  const p = dropSand(field);
  if (p[1] === field.floor - 1) {
    set(field, p, "o");
  }
  return p;
}

function restedSandCount(field: Field) {
  let count = 0;
  while (true) {
    ++count;
    const p = dropSandWithFloor(field);
    if (p[0] === field.sandEntrance[0] && p[1] === field.sandEntrance[1]) {
      return count;
    }
  }
}

const field = await parse(filepath, sandEntrance);
const count = restedSandCount(field);
render(field);
console.log(count);
