import { maxGeodes } from "./mining.ts";

self.onmessage = ({ data }) => {
  const { blueprint, forMinutes } = data;
  const geodes = maxGeodes(blueprint, forMinutes);
  self.postMessage({ id: blueprint.id, geodes });
};
