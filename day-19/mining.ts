import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { collect, lines, mapAsync } from "../util.ts";

export const filepath = "input.txt";

const resourceTypes = ["ore", "clay", "obsidian", "geode"] as const;

type ResourceType = typeof resourceTypes[number];

type RobotType = ResourceType;

export interface Blueprint {
  id: number;
  costs: {
    ore: { ore: number };
    clay: { ore: number };
    obsidian: { ore: number; clay: number };
    geode: { ore: number; obsidian: number };
  };
  maxOre: number;
}

function maxOre(costs: Blueprint["costs"]): number {
  return Object.values(costs).reduce((z, { ore }) => Math.max(z, ore), 0);
}

function parseLine(line: string): Blueprint {
  const res =
    /^Blueprint (?<id>\d+): Each ore robot costs (?<oreOre>\d+) ore. Each clay robot costs (?<clayOre>\d+) ore. Each obsidian robot costs (?<obsOre>\d+) ore and (?<obsClay>\d+) clay. Each geode robot costs (?<geodeOre>\d+) ore and (?<geodeObs>\d+) obsidian.$/.exec(
      line
    );
  if (!res?.groups) {
    throw "bad input";
  }

  const { id, oreOre, clayOre, obsOre, obsClay, geodeOre, geodeObs } =
    res.groups;

  const costs = {
    ore: { ore: Number(oreOre) },
    clay: { ore: Number(clayOre) },
    obsidian: { ore: Number(obsOre), clay: Number(obsClay) },
    geode: { ore: Number(geodeOre), obsidian: Number(geodeObs) },
  };

  return {
    id: Number(id),
    costs,
    maxOre: maxOre(costs),
  };
}

export function parse(filepath: string): Promise<Blueprint[]> {
  return collect(mapAsync(lines(filepath), parseLine));
}

interface State {
  minute: number;
  resources: Record<ResourceType, number>;
  robots: Record<RobotType, number>;
}

function sortedObjectValues<T>(o: Record<string, T>): T[] {
  return resourceTypes.map((r) => o[r]);
}

function toKey(s: State): string {
  return [
    s.minute,
    sortedObjectValues(s.resources),
    sortedObjectValues(s.robots),
  ].toString();
}

Deno.test("toKey", () => {
  assertEquals(
    toKey({
      minute: 1,
      resources: {
        ore: 2,
        clay: 3,
        obsidian: 4,
        geode: 5,
      },
      robots: {
        ore: 6,
        clay: 7,
        obsidian: 8,
        geode: 9,
      },
    }),
    toKey({
      robots: {
        obsidian: 8,
        ore: 6,
        geode: 9,
        clay: 7,
      },
      minute: 1,
      resources: {
        geode: 5,
        ore: 2,
        obsidian: 4,
        clay: 3,
      },
    })
  );
});

function gatherResources(
  state: Pick<State, "robots" | "resources">,
  minutes: number
): State["resources"] {
  const { robots, resources } = state;
  for (const r of Object.keys(robots) as RobotType[]) {
    resources[r] += robots[r] * minutes;
  }
  return resources;
}

Deno.test("gatherResources", () => {
  const robots = {
    ore: 6,
    clay: 7,
    obsidian: 8,
    geode: 9,
  };

  assertEquals(
    gatherResources(
      {
        resources: {
          ore: 2,
          clay: 3,
          obsidian: 4,
          geode: 5,
        },
        robots,
      },
      2
    ),
    {
      ore: 14,
      clay: 17,
      obsidian: 20,
      geode: 23,
    }
  );
});

type Bom<R extends RobotType> = (keyof Blueprint["costs"][R])[];
function bom<R extends RobotType>(
  robot: R,
  blueprint: Pick<Blueprint, "costs">
): Bom<R> {
  const cost = blueprint.costs[robot];
  return Object.keys(cost) as (keyof Blueprint["costs"][R])[];
}

function build<T extends RobotType>(
  robot: T,
  state: Pick<State, "resources" | "robots">,
  blueprint: Pick<Blueprint, "costs" | "maxOre">
): Pick<State, "resources" | "robots"> {
  const { resources } = state;
  const cost = blueprint.costs[robot];
  for (const b of bom(robot, blueprint)) {
    resources[b as ResourceType] =
      resources[b as ResourceType] - (cost[b] as number);
  }

  return {
    resources,
    robots: {
      ...state.robots,
      [robot]: state.robots[robot] + 1,
    },
  };
}

Deno.test("build", () => {
  const resources = {
    ore: 10,
    clay: 10,
    obsidian: 10,
    geode: 10,
  };
  const robots = {
    ore: 0,
    clay: 0,
    obsidian: 0,
    geode: 0,
  };

  const state = {
    resources,
    robots,
  };

  const costs = {
    ore: { ore: 1 },
    clay: { ore: 2 },
    obsidian: {
      ore: 3,
      clay: 1,
    },
    geode: {
      ore: 4,
      obsidian: 1,
    },
  };

  const blueprint = {
    costs,
    maxOre: maxOre(costs),
  };

  assertEquals(build("ore", state, blueprint), {
    resources: {
      ...resources,
      ore: 9,
    },
    robots: {
      ...robots,
      ore: 1,
    },
  });

  assertEquals(build("geode", state, blueprint), {
    resources: {
      ...resources,
      ore: 5,
      obsidian: 9,
    },
    robots: {
      ...robots,
      geode: 1,
    },
  });
});

function buildableAfter(
  robot: RobotType,
  state: State,
  blueprint: Pick<Blueprint, "costs" | "maxOre">
): number | undefined {
  if (robot === "ore" && state.robots["ore"] >= blueprint.maxOre) {
    return undefined;
  }

  const { robots, resources } = state;
  const { costs } = blueprint;

  if (robot === "clay" && state.robots.clay >= costs.obsidian.clay) {
    return undefined;
  }

  if (
    robot === "obsidian" &&
    (state.robots.obsidian >= costs.geode.obsidian || robots["clay"] === 0)
  ) {
    return undefined;
  }

  if (robot === "geode" && robots.obsidian === 0) {
    return undefined;
  }

  const cost = costs[robot];
  function get(r: ResourceType) {
    return (
      Math.max(0, (cost as { [r: string]: number })[r] - resources[r]) /
      robots[r]
    );
  }
  let after = get("ore");

  if (robot === "obsidian") {
    after = Math.max(after, get("clay"));
  }

  if (robot === "geode") {
    after = Math.max(after, get("obsidian"));
  }

  return Math.ceil(after);
}

export function maxGeodes(blueprint: Blueprint, forMinutes: number): number {
  const visited: { [stateKey: string]: number } = {};
  const known: { [minute: number]: number } = {};

  const rs = resourceTypes.toReversed();

  function find(state: State): number {
    if (state.minute > forMinutes) {
      return state.resources.geode;
    }

    for (const [m, v] of Object.entries(known)) {
      const minute = Number(m);
      if (minute < state.minute && v > state.resources.geode) {
        return -1;
      }
    }
    known[state.minute + 1] = Math.max(state.resources.geode, known[state.minute + 1] ?? 0);

    const key = toKey(state);
    if (visited[key]) {
      return visited[key];
    }

    const { minute, robots, resources } = state;

    function findFor(r: RobotType) {
      const after = buildableAfter(r, state, blueprint);
      if (after == undefined) {
        return undefined;
      }
      const ns = {
        resources: { ...resources },
        robots,
      };

      if (after >= forMinutes - state.minute) {
        const lapse = forMinutes - state.minute + 1;
        const nextResources = gatherResources(ns, lapse);
        return find({
          minute: minute + lapse,
          resources: nextResources,
          robots,
        });
      }

      const lapse = after + 1;
      const nextResources = gatherResources(ns, lapse);
      return find({
        minute: minute + lapse,
        ...build(r, { resources: nextResources, robots }, blueprint),
      });
    }

    let max = 0;
    for (const r of rs) {
      const geodes = findFor(r);
      if (geodes == undefined) {
        continue;
      }
      max = Math.max(max, geodes);
    }

    visited[key] = max;
    return max;
  }

  const empty = {
    ore: 0,
    clay: 0,
    obsidian: 0,
    geode: 0,
  };

  const res = find({
    minute: 1,
    robots: {
      ...empty,
      ore: 1,
    },
    resources: empty,
  });

  return res;
}
