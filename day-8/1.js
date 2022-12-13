#!/usr/bin/env -S deno test --allow-read=input.txt

import { parse } from "./parse.js";

const filepath = "input.txt";

function visibleTreeCount(trees) {
  const visible = new Set();

  const rowCount = trees.length;
  const lastRow = rowCount - 1;
  const colCount = trees[0].length;
  const lastCol = colCount - 1;

  function updateVisibility(i, j, max) {
    const height = trees[i][j];
    if (height > max) {
      visible.add(i * colCount + j);
    }
    return Math.max(max, height);
  }

  for (let i = 1; i < lastRow; ++i) {
    let leftMax = trees[i][0];
    let rightMax = trees[i][lastCol];

    let left = 1;
    let right = lastCol - 1;
    while (left != right) {
      if (leftMax < rightMax) {
        leftMax = updateVisibility(i, left, leftMax);
        ++left;
      } else {
        rightMax = updateVisibility(i, right, rightMax);
        --right;
      }
    }
  }

  for (let j = 1; j < lastCol; ++j) {
    let topMax = trees[0][j];
    let bottomMax = trees[lastRow][j];

    let top = 1;
    let bottom = lastRow - 1;
    while (top != bottom) {
      if (topMax < bottomMax) {
        topMax = updateVisibility(top, j, topMax);
        ++top;
      } else {
        bottomMax = updateVisibility(bottom, j, bottomMax);
        --bottom;
      }
    }
  }

  return visible.size + rowCount * 2 + colCount * 2 - 4;
}

console.log(visibleTreeCount(await parse(filepath)));
