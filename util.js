import { readLines } from "https://deno.land/std@0.167.0/io/mod.ts";
import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";

export async function* lines(filepath) {
  const inputFile = await Deno.open(filepath);
  const ls = readLines(inputFile);
  for await (const l of ls) {
    yield l;
  }
  inputFile.close();
}

export async function collect(asyncIterable) {
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
  assertEquals([0,1,2,3,4,5,6,7,8,9], await collect(gen()));
})
