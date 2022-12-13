#!/usr/bin/env -S deno test --allow-read=input.txt

import { parse } from "./parse.js";
import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";

const filepath = "input.txt";

function* row(mat, i) {
  for (let j = 0; j < mat[0].length; ++j) {
    yield mat[i][j];
  }
}

function* rowRev(mat, i) {
  for (let j = mat[0].length - 1; j >= 0; --j) {
    yield mat[i][j];
  }
}

function* col(mat, j) {
  for (let i = 0; i < mat.length; ++i) {
    yield mat[i][j];
  }
}

function* colRev(mat, j) {
  for (let i = mat.length - 1; i >= 0; --i) {
    yield mat[i][j];
  }
}

Deno.test("iterators", async (t) => {
  const mat = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];
  await t.step("row", () => {
    assertEquals([3, 4, 5], [...row(mat, 1)]);
  });
  await t.step("rowRev", () => {
    assertEquals([8, 7, 6], [...rowRev(mat, 2)]);
  });
  await t.step("col", () => {
    assertEquals([0, 3, 6], [...col(mat, 0)]);
  });
  await t.step("colRev", () => {
    assertEquals([7, 4, 1], [...colRev(mat, 1)]);
  });
});

function maxScenicScore(trees) {
  for (let i = 0; i < trees.length; ++i) {
    for (let j = 0; j < trees[0].length; ++j) {
      trees[i][j] = {
        height: trees[i][j],
      };
    }
  }

  for (let i = 0; i < trees.length; ++i) {
    setScenicScores(row(trees, i), "left");
    setScenicScores(rowRev(trees, i), "right");
  }
  for (let j = 0; j < trees[0].length; ++j) {
    setScenicScores(col(trees, j), "up");
    setScenicScores(colRev(trees, j), "down");
  }

  let max = 0;
  for (let i = 0; i < trees.length; ++i) {
    for (let j = 0; j < trees[0].length; ++j) {
      const { left, right, up, down } = trees[i][j];
      const score = left * right * up * down;
      max = Math.max(max, score);
      trees[i][j].score = score;
      console.log(trees[i][j]);
    }
  }
  return max;
}

function setScenicScores(it, dir) {
  const first = it.next().value;
  first[dir] = 0;

  let score = 0;
  let prevHeight = first.height;
  const maxScores = [];
  for (const tree of it) {
    const h = tree.height;
    if (h <= prevHeight) {
      maxScores.push([prevHeight, score]);
      score = 1;
    } else {
      ++score;
      while (h > maxScores[maxScores.length - 1]?.[0]) {
        score += maxScores.pop()[1];
      }
    }
    tree[dir] = score;
    prevHeight = h;
  }
}

console.log(maxScenicScore(await parse(filepath)));
