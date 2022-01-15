import { promises, readFileSync } from "fs";
import { join, relative } from "path";

const { readFile } = promises;

const defaultPathCgroup = "/proc/self/cgroup";
const defaultPathMountinfo = "/proc/self/mountinfo";

const cpuCfsQuotaUsParam = "cpu.cfs_quota_us";
const cpuCfsPeriodUsParam = "cpu.cfs_period_us";

export const findName = (cgroup: string) => cgroup.match(/^\d+:(?:(?:[^:]+,)?cpu(?:,[^:]+)?):(.+)$/m)?.[1];

export const getCpuDir = (cgroup: string, mountinfo: string) => {
  let name = findName(cgroup);
  if (!name) return;
  const matches = mountinfo.matchAll(
    /^(?:\d+ ){2}\d+:\d+ ([^ ]+) ([^ ]+).*? - cgroup [^ ]+ (?:[^ ]+,)?cpu(?:,[^ ]+)?$/gm
  );
  if (!matches) return;
  for (const match of matches) {
    const [, root, mountpoint] = match;
    const rel = relative(root, name);
    if (/^\.\.(?:$|[/\\])/.test(rel)) continue;
    return join(mountpoint, rel);
  }
};

export const parseCpuQuota = (quotaUs: string, periodUs: string) => {
  quotaUs = quotaUs.split("\n", 2)[0];
  periodUs = periodUs.split("\n", 2)[0];

  if (!(/^-?\d+$/.test(quotaUs) && /^\d+$/.test(periodUs))) return;

  const quotaUsValue = parseInt(quotaUs, 10);
  if (quotaUsValue <= 0) return;
  const periodUsValue = parseInt(periodUs, 10);
  return quotaUsValue / periodUsValue;
};

export const getCpuQuota = async (pathCgroup = defaultPathCgroup, pathMountinfo = defaultPathMountinfo) => {
  try {
    const [cgroup, mountinfo] = await Promise.all([readFile(pathCgroup, "utf-8"), readFile(pathMountinfo, "utf-8")]);
    const cpuDir = getCpuDir(cgroup, mountinfo);
    if (!cpuDir) return;
    const [quotaUs, periodUs] = await Promise.all([
      readFile(join(cpuDir, cpuCfsQuotaUsParam), "utf-8"),
      readFile(join(cpuDir, cpuCfsPeriodUsParam), "utf-8"),
    ]);
    return parseCpuQuota(quotaUs, periodUs);
  } catch {}
};

export const getCpuQuotaSync = (pathCgroup = defaultPathCgroup, pathMountinfo = defaultPathMountinfo) => {
  try {
    const [cgroup, mountinfo] = [readFileSync(pathCgroup, "utf-8"), readFileSync(pathMountinfo, "utf-8")];
    const cpuDir = getCpuDir(cgroup, mountinfo);
    if (!cpuDir) return;
    const [quotaUs, periodUs] = [
      readFileSync(join(cpuDir, cpuCfsQuotaUsParam), "utf-8"),
      readFileSync(join(cpuDir, cpuCfsPeriodUsParam), "utf-8"),
    ];
    return parseCpuQuota(quotaUs, periodUs);
  } catch {}
};
