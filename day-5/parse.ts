import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";

function parseChunk(s: string) {
  return s.replaceAll(/\[|\]| /g, "");
}

Deno.test("can parse chunk", () => {
  assertEquals("G", parseChunk("[G] "));
  assertEquals("", parseChunk("    "));
});

export async function parseStacks(ls: AsyncIterator<string>) {
  const parseChunkSize = 4;

  const stacks: string[][] = [];
  let it = await ls.next();
  while (!it.done) {
    // for await (const line of ls) {
    const line = it.value;
    if (line === "") {
      break;
    }
    it = await ls.next();
    if (line === " 1   2   3   4   5   6   7   8   9") {
      continue;
    }

    let start = 0;
    let index = 0;
    while (start < line.length) {
      const val = parseChunk(line.substring(start, start + parseChunkSize));
      if (val.length > 0) {
        const stack = stacks[index] ?? [];
        stack.unshift(val);
        stacks[index] = stack;
      }
      ++index;
      start += parseChunkSize;
    }
  }

  if (stacks.length !== 9) {
    throw Error("bad stack count");
  }

  return stacks;
}

export function parseMove(line: string) {
  const matches = line.matchAll(
    /^move (?<times>\d+) from (?<from>\d+) to (?<to>\d+)$/g
  );

  let result;
  for (const match of matches) {
    if (match?.groups == undefined) {
      throw Error("malformed");
    }
    result = Object.fromEntries(
      Object.entries(match.groups).map(([k, v]) => [k, Number(v)])
    ) as { times: number; from: number; to: number };
  }

  if (!result) {
    throw Error("malformed");
  }

  return result;
}

Deno.test("can parse move", () => {
  assertEquals({ times: 1, from: 6, to: 8 }, parseMove("move 1 from 6 to 8"));
  assertEquals(
    { times: 100, from: 600, to: 800 },
    parseMove("move 100 from 600 to 800")
  );
});
