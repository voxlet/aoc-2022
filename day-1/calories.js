import { readLines } from "https://deno.land/std@0.167.0/io/mod.ts";

export async function* calories(reader) {
  let calories = undefined;
  for await (const line of readLines(reader)) {
    if (line.length === 0) {
      yield calories;
      calories = undefined;
    } else {
      calories = (calories ?? 0) + Number(line);
    }
  }

  if (calories != undefined) {
    yield calories;
  }
}
