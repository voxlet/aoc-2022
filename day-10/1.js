#!/usr/bin/env -S deno test --allow-read=input.txt

import { lines } from "../util.ts";
import { parse } from "./parse.js";

const filepath = "input.txt";

async function signalStrengthSum() {
  const ls = lines(filepath);
  let sum = 0;
  let op = undefined;
  let x = 1;
  for (let cycle = 1; cycle <= 220; ++cycle) {
    if (!op) {
      op = await parse(ls);
    }

    console.log(cycle, x, op);
    if ((cycle - 20) % 40 === 0) {
      sum += x * cycle;
      console.log("---", cycle, x, sum);
    }

    if (op) {
      ++op[0];
      if (op[0] === 2) {
        x += op[1];
        op = undefined;
      }
    }
  }

  return sum;
}

console.log(await signalStrengthSum());
