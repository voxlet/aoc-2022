#!/usr/bin/env -S deno test --allow-read=input.txt

import { parse, monkeyTurn } from "./monkey.js";

const filepath = "input.txt";

function monkeyBusiness(monkeys) {
  const reliefFn = (item) => Math.trunc(item / 3);

  for (let round = 0; round < 20; ++round) {
    for (const monkey of monkeys) {
      monkeyTurn(monkey, monkeys, reliefFn);
    }
    console.log("round", round, monkeys);
  }

  monkeys.sort((a, b) => b.inspections - a.inspections);
  return monkeys[0].inspections * monkeys[1].inspections;
}

console.log(monkeyBusiness(await parse(filepath)));
