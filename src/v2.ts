import { promises, readFileSync } from "fs";
import { join, relative } from "path";

const { readFile } = promises;

const defaultPathMountinfo = "/proc/self/mountinfo";

const cpuMaxParam = "cpu.max";

export const getDir = (mountinfo: string) =>
  mountinfo.match(/^(?:\d+ ){2}\d+:\d+ [^ ]+ ([^ ]+).*? - cgroup2 [^ ]+ [^ ]+$/m)?.[1];

export const parseCpuQuota = (cpuMax: string) => {
  cpuMax = cpuMax.split("\n", 2)[0];

  const match = cpuMax.match(/^(\d+) (\d+)$/);
  if (!match) return;

  const [, quotaUs, periodUs] = match;
  const quotaUsValue = parseInt(quotaUs, 10);
  const periodUsValue = parseInt(periodUs, 10);
  return quotaUsValue / periodUsValue;
};

export const isV2 = async (pathMountinfo = defaultPathMountinfo) => {
  try {
    const mountinfo = await readFile(pathMountinfo, "utf-8");
    return !!getDir(mountinfo);
  } catch {
    return false;
  }
};

export const isV2Sync = (pathMountinfo = defaultPathMountinfo) => {
  try {
    const mountinfo = readFileSync(pathMountinfo, "utf-8");
    return !!getDir(mountinfo);
  } catch {
    return false;
  }
};

export const getCpuQuota = async (pathMountinfo = defaultPathMountinfo) => {
  try {
    const mountinfo = await readFile(pathMountinfo, "utf-8");
    const dir = getDir(mountinfo);
    if (!dir) return;
    const cpuMax = await readFile(join(dir, cpuMaxParam), "utf-8");
    return parseCpuQuota(cpuMax);
  } catch {}
};

export const getCpuQuotaSync = (pathMountinfo = defaultPathMountinfo) => {
  try {
    const mountinfo = readFileSync(pathMountinfo, "utf-8");
    const dir = getDir(mountinfo);
    if (!dir) return;
    const cpuMax = readFileSync(join(dir, cpuMaxParam), "utf-8");
    return parseCpuQuota(cpuMax);
  } catch {}
};
