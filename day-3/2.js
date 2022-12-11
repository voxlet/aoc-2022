#!/usr/bin/env -S deno run --allow-read=input.txt

import { lines } from "../util.js";

const filepath = "input.txt";

for await (const line of lines(filepath)) {
  if (line.length % 2 !== 0) {
    throw Error("odd");
  }
}

const types = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
if (types.length !== 52) {
  throw Error("typo");
}

const priorities = Object.fromEntries(types.split("").map((t, i) => [t, i + 1]));

async function badgePrioritySum() {
  let sum = 0;
  for await (const group of groups(filepath)) {
    const item = badgeItem(group);
    const priority = priorities[item];
    console.log(item, priority);
    sum += priority;
  }

  return sum;
}

async function* groups(filepath) {
  let group = [];
  for await (const line of lines(filepath)) {
    group.push(line);
    if (group.length === 3) {
      yield group;
      group = [];
    }
  }
}

function badgeItem(group) {
  const [firstLine, secondLine, thirdLine] = group;
  const [first, second] = [firstLine, secondLine].map(line => new Set(line.split("")));
  for (const t of thirdLine) {
    if (first.has(t) && second.has(t)) {
      console.log(t);
      console.log(firstLine);
      console.log(secondLine);
      console.log(thirdLine);
      return t;
    }
  }

  console.log(firstLine, secondLine, thirdLine);
  throw Error("not found");
}

console.log(await badgePrioritySum());
