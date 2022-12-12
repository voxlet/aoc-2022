import { lines } from "../util.ts";

interface Node {
  type: string;
  name: string;
  parent: Directory | undefined;
}

export interface Root extends Node {
  type: "d";
  parent: undefined;
  children: Record<string, Directory | File>;
}

export interface Directory extends Node {
  type: "d";
  parent: Directory;
  children: Record<string, Directory | File>;
}

function isDirectory(node: Node | undefined): node is Directory {
  return node?.type === "d";
}

export interface File extends Node {
  type: "f";
  size: number;
  parent: Directory;
}

export function isFile(node: Node | undefined): node is File {
  return node?.type === "f";
}

export async function parse(filename: string): Promise<Root> {
  const root: Root = {
    type: "d",
    name: "/",
    children: {},
    parent: undefined,
  };
  const ls = lines(filename);
  await ls.next();
  let pwd: Directory = root as unknown as Directory;

  for await (const line of ls) {
    if (line.startsWith("$ cd")) {
      pwd = parseCd(line, pwd);
    } else if (line.startsWith("$ ls")) {
      continue;
    } else if (line.startsWith("dir")) {
      const dir = parseNewDirectory(line, pwd);
      pwd.children[dir.name] = dir;
    } else {
      const file = parseNewFile(line, pwd);
      pwd.children[file.name] = file;
    }
  }

  return root;
}

function parseNewDirectory(line: string, parent: Directory): Directory {
  return {
    type: "d",
    name: line.replace("dir ", ""),
    children: {},
    parent,
  };
}

function parseCd(line: string, pwd: Directory): Directory {
  const name = line.replace("$ cd ", "");
  if (name === "..") {
    return pwd.parent;
  }
  const child = pwd.children[name];
  if (!isDirectory(child)) {
    throw Error(`not a directory: ${child}`);
  }
  return child;
}

function parseNewFile(line: string, parent: Directory): File {
  const [size, name] = line.split(" ");
  return {
    type: "f",
    name,
    size: Number(size),
    parent,
  };
}
