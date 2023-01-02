#!/usr/bin/env -S deno run --allow-read=input.txt

import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { collect, lines } from "../util.ts";

const filepath = "input.txt";

const decimals = {
  "=": -2,
  "-": -1,
  0: 0,
  1: 1,
  2: 2,
};

function fromSnafu(snafu) {
  let place = 1;
  let res = 0;
  for (const c of [...snafu].toReversed()) {
    const value = decimals[c];
    res += value * place;
    place *= 5;
  }
  return res;
}

const snafus = {
  [-2]: "=",
  [-1]: "-",
  0: "0",
  1: "1",
  2: "2",
};

function toSnafu(n) {
  let snafu = "";
  let place = 1;
  while (n !== 0) {
    let v = Math.trunc(n / place) % 5;
    if (v > 2) {
      v -= 5;
    }
    snafu = snafus[v] + snafu;
    n -= v * place;
    place *= 5;
  }
  return snafu;
}

Deno.test("snafu", () => {
  const cases = [
    [1, "1"],
    [2, "2"],
    [3, "1="],
    [4, "1-"],
    [5, "10"],
    [6, "11"],
    [7, "12"],
    [8, "2="],
    [9, "2-"],
    [10, "20"],
    [12, "22"],
    [13, "1=="],
    [15, "1=0"],
    [20, "1-0"],
    [62, "222"],
    [63, "1==="],
    [2022, "1=11-2"],
    [12345, "1-0---0"],
    [314159265, "1121-1110-1=0"],
  ];

  for (const [n, snafu] of cases) {
    assertEquals(fromSnafu(snafu), n);
    assertEquals(toSnafu(n), snafu);
  }
});

function sum(snafus) {
  return toSnafu(snafus.map(fromSnafu).reduce((z, n) => z + n));
}

console.log(sum(await collect(lines(filepath))));
