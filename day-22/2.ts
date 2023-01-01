#!/usr/bin/env -S deno test --allow-read=input.txt

import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import {
  Board,
  canMoveTo,
  Direction,
  dirs,
  down,
  filepath,
  left,
  parse,
  right,
  run,
  State,
  up,
  Vec2,
} from "./board.ts";

//   B A
//   C
// E D
// F
const faceSize = 50;
const faceCoords = {
  A: [2, 0],
  B: [1, 0],
  C: [1, 1],
  D: [1, 2],
  E: [0, 2],
  F: [0, 3],
} as const;
type Face = keyof typeof faceCoords;

type Edge = "left" | "top" | "right" | "bottom";

function dist(face: Face, edge: Edge): number {
  const [fx, fy] = faceCoords[face];
  switch (edge) {
    case "right": {
      return (fx + 1) * faceSize;
    }
    case "bottom": {
      return (fy + 1) * faceSize;
    }
    case "left": {
      return fx * faceSize + 1;
    }
    case "top": {
      return fy * faceSize + 1;
    }
  }
}

function offs(face: Face): Vec2 {
  const [fx, fy] = faceCoords[face];
  return [fx * faceSize, fy * faceSize];
}

function face(pos: Vec2): Face {
  const [x, y] = pos;

  if (x > offs("A")[0]) {
    return "A";
  }
  if (y > offs("F")[1]) {
    return "F";
  }
  if (y > offs("E")[1]) {
    if (x > offs("D")[0]) {
      return "D";
    }
    return "E";
  }
  if (y > offs("C")[1]) {
    return "C";
  }
  return "B";
}

//            F
//            ↕ ┌───┐
//            A ┘ D ┘
//    ┌ F ┌ C ┘ F ┘
//  ┌ B ┌ E
//  └───┘

const connections = {
  A: {
    top: ["F", "bottom"],
    right: ["D", "right"],
    bottom: ["C", "right"],
  },
  B: {
    top: ["F", "left"],
    left: ["E", "left"],
  },
  C: {
    left: ["E", "top"],
    right: ["A", "bottom"],
  },
  D: {
    right: ["A", "right"],
    bottom: ["F", "right"],
  },
  E: {
    top: ["C", "left"],
    left: ["B", "left"],
  },
  F: {
    left: ["B", "top"],
    right: ["D", "bottom"],
    bottom: ["A", "top"],
  },
} as const;

function fromEdgeFor(dir: Direction): Edge {
  return dir === up
    ? "top"
    : dir === left
    ? "left"
    : dir === down
    ? "bottom"
    : "right";
}

const dirsByToEdge = {
  top: down,
  left: right,
  bottom: up,
  right: left,
} as const;

function sub(a: Readonly<Vec2>, b: Readonly<Vec2>): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

function wrapFace(pos: Vec2, dir: Direction): [pos: Vec2, dir: Direction] {
  const fromPos = sub(pos, dir);
  const [x, y] = fromPos;
  const from = face(fromPos);
  const fromEdge = fromEdgeFor(dir);
  const conn = (connections as { [f in Face]: { [e in Edge]: [Face, Edge] } })[
    from
  ][fromEdge];

  if (!conn) {
    throw Error(
      `no connection: ${from}:${fromEdge} with ${fromPos} ${dir} ${pos}`
    );
  }
  const [to, toEdge] = conn;
  const d = dist(to, toEdge);
  const [ofx, ofy] = offs(from);
  const [otx, oty] = offs(to);
  console.log("offset", ofx, ofy, otx, oty);

  function yToY(): Vec2 {
    console.log("y to y", fromEdge, toEdge);
    if (fromEdge != toEdge) {
      return [d, y - ofy + oty];
    }
    return [d, ofy + faceSize + 1 - y + oty];
  }
  function xToX(): Vec2 {
    console.log("x to x", fromEdge, toEdge);
    if (fromEdge != toEdge) {
      return [x - ofx + otx, d];
    }
    return [ofx + faceSize + 1 - x + otx, d];
  }
  function xToY(): Vec2 {
    console.log("x to y");
    if (
      (fromEdge === "bottom" && toEdge === "right") ||
      (fromEdge === "top" && toEdge === "left")
    ) {
      return [d, x - ofx + oty];
    }
    return [d, ofx + faceSize + 1 - x + oty];
  }
  function yToX(): Vec2 {
    console.log("y to x");
    if (
      (fromEdge === "right" && toEdge === "bottom") ||
      (fromEdge === "left" && toEdge === "top")
    ) {
      return [y - ofy + otx, d];
    }
    return [ofy + faceSize - y + 1 + otx, d];
  }

  function wrapPos(): Vec2 {
    if (fromEdge === "top" || fromEdge === "bottom") {
      if (toEdge === "top" || toEdge === "bottom") {
        return xToX();
      }
      return xToY();
    }
    if (toEdge === "top" || toEdge === "bottom") {
      return yToX();
    }
    return yToY();
  }

  const wrapDir = dirsByToEdge[toEdge];

  console.log(
    "wrapFace",
    fromPos,
    dir,
    "->",
    wrapPos(),
    wrapDir,
    "with",
    from,
    fromEdge,
    to,
    toEdge
  );

  return [wrapPos(), dirsByToEdge[toEdge]];
}

Deno.test("wrapFace", () => {
  assertEquals(wrapFace([101, 50], down), [[100, 51], left]);
  assertEquals(wrapFace([101, 51], right), [[101, 50], up]);

  assertEquals(wrapFace([101, 1], up), [[1, 200], up]);
  assertEquals(wrapFace([1, 200], down), [[101, 1], down]);

  assertEquals(wrapFace([150, 1], right), [[100, 150], left]);
  assertEquals(wrapFace([100, 150], right), [[150, 1], left]);

  assertEquals(wrapFace([51, 100], left), [[50, 101], down]);
  assertEquals(wrapFace([50, 101], up), [[51, 100], right]);

  assertEquals(wrapFace([51, 1], up), [[1, 151], right]);
  assertEquals(wrapFace([1, 151], left), [[51, 1], down]);
});

export function wrap(state: State, board: Board): boolean {
  const { pos, dir } = state;
  console.log("wrap", pos, dir);

  const [wrapPos, wrapDir] = wrapFace(pos, dir);

  const ok = canMoveTo(wrapPos, board);
  if (ok === undefined) {
    throw Error(`no wrap pos: ${wrapPos} with ${state.pos} ${state.dir}`);
  }
  state.pos = wrapPos;
  state.dir = wrapDir;
  return ok;
}

function password(board: Board): number {
  const state = run(board, (state: State) => wrap(state, board));

  const [col, row] = state.pos;
  return 1000 * row + 4 * col + dirs.indexOf(state.dir);
}

console.log(password(await parse(filepath)));
