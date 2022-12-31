#!/usr/bin/env -S deno run --allow-read=input.txt

import {
  filepath,
  groupByName,
  isOpMonkey,
  listen,
  NumberMonkey,
  Op,
  OpMonkey,
  parse,
} from "./monkey.ts";

function solve(
  op: Op,
  res: number,
  [a, b]: [number, undefined] | [undefined, number]
): number {
  switch (op) {
    case "+": {
      return res - (a ?? b);
    }
    case "*": {
      return res / (a ?? b);
    }
    case "-": {
      if (a == undefined) {
        return res + b;
      }
      return a - res;
    }
    case "/": {
      if (a == undefined) {
        return res * b;
      }
      return a / res;
    }
  }
}

function myNumber(monkeys: (OpMonkey | NumberMonkey)[]) {
  const byName = groupByName(monkeys);

  const listeners: { [name: string]: OpMonkey } = {};
  for (const m of monkeys) {
    if (!isOpMonkey(m)) {
      continue;
    }
    for (const l of m.listen) {
      listeners[l] = m;
    }
  }

  function numberFor(name: string): number {
    const listener = listeners[name];
    const ls = listener.listen;

    if (listener.name === "root") {
      const otherName = ls[0] === name ? ls[1] : ls[0];
      return listen(otherName, byName);
    }

    const values = listener.listen.map((n) =>
      n === name ? undefined : listen(n, byName)
    ) as [number, undefined] | [undefined, number];

    return solve(listener.op, numberFor(listener.name), values);
  }

  return numberFor("humn");
}

console.log(myNumber(await parse(filepath)));
