import { readLines } from "https://deno.land/std@0.167.0/io/mod.ts";
import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";

export async function* lines(filepath: string) {
  const inputFile = await Deno.open(filepath);
  const ls = readLines(inputFile);
  for await (const l of ls) {
    yield l;
  }
  inputFile.close();
}

export async function collect<T>(
  asyncIterable: AsyncIterable<T>
): Promise<T[]> {
  const res = [];
  for await (const v of asyncIterable) {
    res.push(v);
  }
  return res;
}

Deno.test("can collect async iterable into array", async () => {
  async function* gen() {
    for await (const v of [...Array(10)].map((_, i) => Promise.resolve(i))) {
      yield v;
    }
  }
  assertEquals([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], await collect(gen()));
});

export function lowerBound<T>(sortedArray: T[], target: T): number {
  let lo = 0;
  let hi = sortedArray.length;
  while (lo != hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (sortedArray[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

Deno.test("can find lower bound", () => {
  assertEquals(0, lowerBound([1, 2, 3, 4], -1));
  assertEquals(0, lowerBound([1, 2, 3, 4], 0));
  assertEquals(0, lowerBound([1, 2, 3, 4], 1));
  assertEquals(1, lowerBound([1, 2, 3, 4], 2));
  assertEquals(2, lowerBound([1, 2, 3, 4], 3));
  assertEquals(3, lowerBound([1, 2, 3, 4], 4));
  assertEquals(4, lowerBound([1, 2, 3, 4], 5));
  assertEquals(4, lowerBound([1, 2, 3, 4], 6));
});
