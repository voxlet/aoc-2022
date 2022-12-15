export async function parse(ls) {
  const line = (await ls.next()).value;
  const [_, v] = line?.split(" ") ?? [];
  return v != undefined ? [0, Number(v)] : [1, 0];
}
