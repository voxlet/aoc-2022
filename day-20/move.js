import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { collect, lines, mapAsync } from "../util.ts";

export const filepath = "input.txt";

export function parse(filepath) {
  return collect(mapAsync(lines(filepath), (line) => Number(line)));
}
export function move(xs, index, offset) {
  if (offset === 0) {
    return;
  }

  const wrapLen = xs.length - 1;

  let dest = (index + offset) % wrapLen;
  if (dest <= 0) {
    dest = wrapLen + dest;
  }
  if (dest === index) {
    return;
  }

  const v = xs[index];
  if (dest > index) {
    for (let i = index; i < dest; ++i) {
      xs[i] = xs[i + 1];
    }
  } else {
    for (let i = index; i > dest; --i) {
      xs[i] = xs[i - 1];
    }
  }
  xs[dest] = v;
}

Deno.test("move", () => {
  const xs = [1, 2, -3, 3, -2, 0, 4];

  move(xs, 0, 1);
  assertEquals(xs, [2, 1, -3, 3, -2, 0, 4]);

  move(xs, 0, 2);
  assertEquals(xs, [1, -3, 2, 3, -2, 0, 4]);

  move(xs, 1, -3);
  assertEquals(xs, [1, 2, 3, -2, -3, 0, 4]);

  move(xs, 2, 3);
  assertEquals(xs, [1, 2, -2, -3, 0, 3, 4]);

  move(xs, 2, -2);
  assertEquals(xs, [1, 2, -3, 0, 3, 4, -2]);

  move(xs, 5, 4);
  assertEquals(xs, [1, 2, -3, 4, 0, 3, -2]);

  const before = [...xs];

  move(xs, 3, 14);
  assertEquals(xs, [1, 2, -3, 0, 3, 4, -2]);

  move(xs, 5, -14);
  assertEquals(xs, before);
});
