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

export function last<T>(a: T[]): T {
  return a[a.length - 1];
}

export function take<T>(iterable: Iterable<T>, count: number): T[] {
  const res = [];
  const it = iterable[Symbol.iterator]();
  for (let i = 0; i < count; ++i) {
    const r = it.next();
    if (r.done) {
      break;
    }
    res.push(r.value);
  }
  return res;
}

Deno.test("take", () => {
  assertEquals(take([], 5), []);
  assertEquals(take([1], 0), []);
  assertEquals(take([1], 2), [1]);
  assertEquals(take([1, 2, 3], 2), [1, 2]);
});

export function* repeat<T>(a: T[]): Generator<T> {
  let i = 0;
  while (true) {
    yield a[i % a.length];
    ++i;
  }
}

Deno.test("repeat", () => {
  assertEquals(take(repeat([1, 2]), 5), [1, 2, 1, 2, 1]);
  assertEquals(take(repeat([1, 2, 3, 4]), 5), [1, 2, 3, 4, 1]);
});

export async function collect<T>(
  asyncIterable: AsyncIterable<T>
): Promise<T[]> {
  const res = [];
  for await (const v of asyncIterable) {
    res.push(v);
  }
  return res;
}

async function* gen(n: number) {
  for await (const v of [...Array(n)].map((_, i) => Promise.resolve(i))) {
    yield v;
  }
}

Deno.test("can collect async iterable into array", async () => {
  assertEquals([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], await collect(gen(10)));
});

export async function* partition<T>(
  length: number,
  asyncIterable: AsyncIterable<T>
) {
  let p = [];
  for await (const v of asyncIterable) {
    p.push(v);
    if (p.length === length) {
      yield p;
      p = [];
    }
  }
}

Deno.test("can partition async iterable", async () => {
  assertEquals(
    [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
    ],
    await collect(partition(3, gen(10)))
  );
});

export async function* mapAsync<T, U>(
  asyncIterable: AsyncIterable<T>,
  xf: (v: T) => U | Promise<U>
) {
  for await (const v of asyncIterable) {
    yield await xf(v);
  }
}

Deno.test("can map async iterable", async () => {
  assertEquals(
    await collect(mapAsync(gen(10), (v) => v * v)),
    [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
  );
});

export function lowerBound<T>(sortedArray: T[], target: T): number {
  return lowerBoundWith(sortedArray, (t: T) => t < target);
}

export function lowerBoundWith<T>(
  sortedArray: T[],
  comp: (element: T) => boolean
): number {
  let lo = 0;
  let hi = sortedArray.length;
  while (lo != hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (comp(sortedArray[mid])) {
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

export function* powerSet<T>(s: Set<T>) {
  const vs = [...s];
  const res: T[] = [];
  function* find(i: number): Generator<Set<T>> {
    if (i === 0) {
      yield new Set(res);
    } else {
      const next = i - 1;

      res.push(vs[next]);
      yield* find(next);

      res.pop();
      yield* find(next);
    }
  }

  yield* find(s.size);
}

Deno.test("power set", () => {
  assertEquals(
    [...powerSet(new Set([1, 2]))],
    [new Set([1, 2]), new Set([2]), new Set([1]), new Set()]
  );
});

export function difference<T>(a: Set<T>, b: Set<T>) {
  const res = new Set(a);
  for (const v of b) {
    res.delete(v);
  }
  return res;
}

Deno.test("difference", () => {
  assertEquals(difference(new Set([]), new Set([1, 2, 3, 4])), new Set([]));

  assertEquals(
    difference(new Set([1, 2, 3, 4]), new Set([])),
    new Set([1, 2, 3, 4])
  );

  assertEquals(
    difference(new Set([1, 2, 3, 4]), new Set([2, 4])),
    new Set([1, 3])
  );
});
