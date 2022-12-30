#!/usr/bin/env -S deno test --allow-read=input.txt

import { move, parse, filepath } from "./move.js";

function mixedSum(crypt) {
  const decryptionKey = 811589153;
  const xs = crypt.map((v) => v * decryptionKey);
  const indexed = xs.map((v, i) => ({ index: i, value: v }));

  for (let j = 0; j < 10; ++j) {
    for (let i = 0; i < xs.length; ++i) {
      const index = indexed.findIndex((o) => {
        return o.index === i;
      });
      move(indexed, index, indexed[index].value);
    }
  }

  const zeroIndex = indexed.findIndex((o) => o.value === 0);
  return [1000, 2000, 3000]
    .map((i) => indexed[(zeroIndex + i) % indexed.length].value)
    .reduce((z, v) => z + v);
}

console.log(mixedSum(await parse(filepath)));
