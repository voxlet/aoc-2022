import {
  assert,
  assertFalse,
} from "https://deno.land/std@0.167.0/testing/asserts.ts";

export type Value = Array<Value | number>;

export function correctOrder(left: Value, right: Value): boolean | undefined {
  for (let i = 0; i < left.length; ++i) {
    if (i >= right.length) {
      return false;
    }
    let lv = left[i];
    let rv = right[i];
    if (typeof lv === "number" && typeof rv === "number") {
      if (lv === rv) {
        continue;
      }
      return lv < rv;
    }
    if (typeof lv === "number") {
      lv = [lv];
    }
    if (typeof rv === "number") {
      rv = [rv];
    }
    const res = correctOrder(lv, rv);
    if (res == undefined) {
      continue;
    }
    return res;
  }

  if (left.length === right.length) {
    return undefined;
  }
  return left.length < right.length;
}

Deno.test("can determine correct order", () => {
  assert(correctOrder([1, 1, 3, 1, 1], [1, 1, 5, 1, 1]));
  assert(correctOrder([[1], [2, 3, 4]], [[1], 4]));
  assertFalse(correctOrder([9], [[8, 7, 6]]));
  assert(correctOrder([[4, 4], 4, 4], [[4, 4], 4, 4, 4]));
  assertFalse(correctOrder([7, 7, 7, 7], [7, 7, 7]));
  assert(correctOrder([], [3]));
  assertFalse(correctOrder([[[]]], [[]]));
  assertFalse(
    correctOrder(
      [1, [2, [3, [4, [5, 6, 7]]]], 8, 9],
      [1, [2, [3, [4, [5, 6, 0]]]], 8, 9]
    )
  );
});
