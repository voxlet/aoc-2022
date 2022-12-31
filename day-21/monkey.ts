import { collect, lines, mapAsync } from "../util.ts";

export const filepath = "input.txt";

export interface NamedMonkey {
  name: string;
}

const ops = ["+", "-", "*", "/"] as const;
export type Op = typeof ops[number];

function isOp(s: string): s is Op {
  return ops.includes(s as Op);
}

export function exec(op: Op, a: number, b: number): number {
  return op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b;
}

export interface OpMonkey extends NamedMonkey {
  op: Op;
  listen: [nameA: string, nameB: string];
}

export function isOpMonkey(m: unknown): m is OpMonkey {
  return (m as { op: unknown }).op != undefined;
}

export interface NumberMonkey extends NamedMonkey {
  value: number;
}

export type Monkey = OpMonkey | NumberMonkey;

export type ByName = { [name: string]: Monkey };

export function groupByName(monkeys: Monkey[]): ByName {
  const byName: ByName = {};
  for (const m of monkeys) {
    byName[m.name] = m;
  }
  return byName;
}

export function listen(name: string, byName: ByName): number {
  const m = byName[name];
  if (!isOpMonkey(m)) {
    return m.value;
  }
  return m.listen
    .map((n) => listen(n, byName))
    .reduce((a, b) => exec(m.op, a, b));
}

export function parse(filepath: string): Promise<Monkey[]> {
  return collect(
    mapAsync(lines(filepath), (line) => {
      const [name, data] = line.split(": ");
      const value = Number(data);
      if (!Number.isNaN(value)) {
        return { name, value };
      }

      const [nameA, op, nameB] = data.split(" ");
      if (!isOp(op)) {
        throw Error(`bad input: ${nameA} ${op} ${nameB} <- ${line}`);
      }

      return { name, op, listen: [nameA, nameB] };
    })
  );
}
