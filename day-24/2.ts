#!/usr/bin/env -S deno run --allow-read=input.txt

import { take } from "../util.ts";
import { parse, filepath, fewestMinutes } from "./valley.ts";

console.log(
  take(fewestMinutes(await parse(filepath)), 3).reduce((z, m) => z + m)
);
