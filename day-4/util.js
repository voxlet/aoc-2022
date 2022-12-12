export function parseLine(line) {
  return line.split(",").map((s) => s.split("-").map((v) => Number(v)));
}

Deno.test("can parse line", () => {
  assertEquals(
    [
      [1, 2],
      [3, 4],
    ],
    parseLine("1-2,3-4")
  );
});

export function ascendingStart(a, b) {
  return a[0] - b[0];
}
