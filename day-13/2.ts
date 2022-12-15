#!/usr/bin/env -S deno test --allow-read=input.txt

import { collect, lines, lowerBound } from "../util.ts";
import { correctOrder, Value } from "./correctOrder.ts";

const filepath = "input.txt";

async function decoderKey() {
  const signal = (await collect(lines(filepath)))
    .filter((line) => line.length !== 0)
    .map((line) => JSON.parse(line) as Value);

  signal.sort((a, b) => {
    const res = correctOrder(a, b);
    return res == undefined ? 0 : res ? -1 : 1;
  });

  const twoIndex = lowerBound(signal, [[2]]) + 1;
  const sixIndex = lowerBound(signal, [[6]]) + 2;

  return twoIndex * sixIndex;
}

console.log(await decoderKey());
