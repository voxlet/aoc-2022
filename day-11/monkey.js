import { lines } from "../util.ts";

export async function parse(filepath) {
  const monkeys = [];

  const ls = lines(filepath);
  let line = (await ls.next()).value;
  while (line != undefined) {
    console.log("--", line);
    const items = (await ls.next()).value
      .split(": ")[1]
      .split(", ")
      .map((s) => Number(s));

    const ops = (await ls.next()).value.split(" ");
    let arg = ops.pop();
    arg = arg === "old" ? undefined : Number(arg);

    const op = ops.pop();

    const test = Number((await ls.next()).value.split(" ").pop());
    const trueDest = Number((await ls.next()).value.split(" ").pop());
    const falseDest = Number((await ls.next()).value.split(" ").pop());
    await ls.next();
    line = (await ls.next()).value;

    const monkey = {
      items,
      op,
      arg,
      test,
      trueDest,
      falseDest,
      inspections: 0,
    };
    console.log(monkey);
    monkeys.push(monkey);
  }

  return monkeys;
}

export function monkeyTurn(monkey, monkeys, reliefFn) {
  const { items, op, arg, test, trueDest, falseDest } = monkey;
  while (items.length) {
    let item = items.pop();

    switch (op) {
      case "+":
        item += arg ?? item;
        break;
      case "*":
        item *= arg ?? item;
        break;
    }

    item = reliefFn(item);

    const dest = item % test === 0 ? trueDest : falseDest;
    monkeys[dest].items.push(item);

    ++monkey.inspections;
  }
}
