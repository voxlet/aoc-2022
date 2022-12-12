#!/usr/bin/env -S deno test --allow-read=input.txt

async function distinctCompletionCount(n: number) {
  const input = (await Deno.readTextFile("input.txt")).trim();

  const diff = n - 1;
  const window = new Set(input[0]);
  let start = 0;
  let end = 1;
  while (end != input.length) {
    if (!window.has(input[end])) {
      if (end - start === diff) {
        console.log(window, input[end]);
        return end + 1;
      }
      window.add(input[end]);
      ++end;
      continue;
    }

    while (window.has(input[end])) {
      window.delete(input[start]);
      ++start;
    }
  }

  throw Error("not found");
}

console.log(await distinctCompletionCount(4));
console.log(await distinctCompletionCount(14));
