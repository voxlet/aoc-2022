#!/usr/bin/env -S deno run --allow-read=input.txt

import {
  filepath,
  groupByName,
  listen,
  NumberMonkey,
  OpMonkey,
  parse,
} from "./monkey.ts";

function rootNumber(monkeys: (OpMonkey | NumberMonkey)[]) {
  const byName = groupByName(monkeys);
  return listen("root", byName);
}

console.log(rootNumber(await parse(filepath)));
