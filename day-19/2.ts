#!/usr/bin/env -S deno run --allow-read=input.txt,worker.js

import { take } from "../util.ts";
import { Blueprint, parse, filepath } from "./mining.ts";

async function maxGeodeProduct(
  blueprints: Blueprint[],
  forMinutes: number
): Promise<number> {
  const intacts = take(blueprints, 3);
  console.log(intacts);

  let product = 1;

  const workerCount = Math.min(intacts.length, 12);
  const workers = [];
  for (let i = 0; i < workerCount; ++i) {
    const worker = new Worker(new URL("./worker.js", import.meta.url).href, {
      type: "module",
    });

    const done = new Promise<void>((resolve) => {
      worker.onmessage = ({ data }) => {
        console.log(data);

        const { geodes } = data;
        product *= geodes;

        const blueprint = intacts.pop();
        if (!blueprint) {
          worker.terminate();
          resolve();
          return;
        }
        worker.postMessage({ blueprint, forMinutes });
      };
    });

    const blueprint = intacts.pop()!;
    worker.postMessage({ blueprint, forMinutes });
    console.log("started:", blueprint.id);
    workers.push(done);
  }

  await Promise.all(workers);
  return product;
}

console.log(await maxGeodeProduct(await parse(filepath), 32));
