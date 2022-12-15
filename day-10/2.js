#!/usr/bin/env -S deno test --allow-read=input.txt

import { lines } from "../util.ts";
import { parse } from "./parse.js";

const filepath = "input.txt";

async function render() {
  const ls = lines(filepath);
  const crt = [];

  let op = undefined;
  let x = 1;

  for (let y = 0; y < 6; ++y) {
    let scanLine = "";
    for (let pos = 0; pos < 40; ++pos) {
      if (!op) {
        op = await parse(ls, op);
      }

      scanLine += Math.abs(pos - x) <= 1 ? "█" : " ";

      if (op) {
        ++op[0];
        if (op[0] === 2) {
          x += op[1];
          op = undefined;
        }
      }
    }

    crt.push(scanLine);
  }

  return crt;
}

(await render()).forEach((l) => console.log(l));
