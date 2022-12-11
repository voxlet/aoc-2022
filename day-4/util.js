export function parseLine(line) {
  return line.split(",").map(s => s.split("-").map(v => Number(v)));
}

export function ascendingStart(a, b) {
  return a[0] - b[0];
}
