export function updateHead(head, dir) {
  switch (dir) {
    case "L":
      head[0] -= 1;
      break;
    case "R":
      head[0] += 1;
      break;
    case "D":
      head[1] -= 1;
      break;
    case "U":
      head[1] += 1;
      break;
  }
}
export function updateLink(tail, head) {
  const dx = head[0] - tail[0];
  const dy = head[1] - tail[1];
  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
    tail[0] += dx === 0 ? 0 : dx > 0 ? 1 : -1;
    tail[1] += dy === 0 ? 0 : dy > 0 ? 1 : -1;
  }
}
