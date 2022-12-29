#!/usr/bin/env -S deno run --allow-read=input.txt,worker.js

import { Blueprint, parse, filepath } from "./mining.ts";

async function qualityLevelSum(
  blueprints: Blueprint[],
  forMinutes: number
): Promise<number> {
  console.log(blueprints);

  let sum = 0;

  const workerCount = Math.min(blueprints.length, 12);
  const workers = [];
  for (let i = 0; i < workerCount; ++i) {
    const worker = new Worker(new URL("./worker.js", import.meta.url).href, {
      type: "module",
    });

    const done = new Promise<void>((resolve) => {
      worker.onmessage = ({ data }) => {
        console.log(data);

        const { id, geodes } = data;
        sum += id * geodes;

        const blueprint = blueprints.pop();
        if (!blueprint) {
          worker.terminate();
          resolve();
          return;
        }
        worker.postMessage({ blueprint, forMinutes });
      };
    });

    worker.postMessage({ blueprint: blueprints.pop(), forMinutes });
    workers.push(done);
  }

  await Promise.all(workers);
  return sum;
}

console.log(await qualityLevelSum(await parse(filepath), 24));
