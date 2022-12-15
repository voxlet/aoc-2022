#!/usr/bin/env -S deno test --allow-read=input.txt

import { parse, monkeyTurn } from "./monkey.js";

const filepath = "input.txt";

function monkeyBusiness(monkeys) {
  const lcm = monkeys.map((m) => m.test).reduce((z, m) => z * m);
  const reliefFn = (item) => item % lcm;

  for (let round = 0; round < 10000; ++round) {
    for (const monkey of monkeys) {
      monkeyTurn(monkey, monkeys, reliefFn);
    }
  }
  console.log(monkeys);

  monkeys.sort((a, b) => b.inspections - a.inspections);
  return monkeys[0].inspections * monkeys[1].inspections;
}

console.log(monkeyBusiness(await parse(filepath)));
