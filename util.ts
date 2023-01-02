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

export function* window<T>(a: Iterable<T>, size: number, step: number) {
  const w = [];
  for (const v of a) {
    w.push(v);
    if (w.length === size) {
      yield [...w];
      w.splice(0, step);
    }
  }
  if (w.length > 0) {
    yield w;
  }
}

Deno.test("window", () => {
  assertEquals(take(window([], 100, 100), 1), []);
  assertEquals(take(window([1, 2, 3], 1, 1), 3), [[1], [2], [3]]);
  assertEquals(take(window([1, 2], 2, 1), 3), [[1, 2], [2]]);
  assertEquals(take(window(repeat([1, 2, 3, 4, 5, 6, 7, 8]), 3, 2), 4), [
    [1, 2, 3],
    [3, 4, 5],
    [5, 6, 7],
    [7, 8, 1],
  ]);
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

export type Vec2 = [x: number, y: number];

export function isEqual(a: Readonly<Vec2>, b: Readonly<Vec2>): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

export function add(a: Readonly<Vec2>, b: Readonly<Vec2>): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export function toKey(v: Readonly<Vec2>): string {
  return JSON.stringify(v);
}

export function fromKey(k: string): Vec2 {
  return JSON.parse(k);
}

export type Extent = [Vec2, Vec2];

export function* extentIter(ext: Extent): Generator<Vec2> {
  const [min, max] = ext;
  for (let y = min[1]; y <= max[1]; ++y) {
    for (let x = min[0]; x <= max[0]; ++x) {
      yield [x, y];
    }
  }
}

export function isInside(ext: Extent, v: Vec2): boolean {
  const [min, max] = ext;
  return v[0] >= min[0] && v[0] <= max[0] && v[1] >= min[1] && v[1] <= max[1];
}
