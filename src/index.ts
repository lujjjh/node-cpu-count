import { cpus, platform } from "os";
import { normalizeQuota } from "./shared";
import * as v1 from "./v1";
import * as v2 from "./v2";

export const cpuCount = async (min = 1, max = cpus().length) => {
  if (platform() !== "linux") return max;
  if (await v2.isV2()) {
    return normalizeQuota(await v2.getCpuQuota(), min, max);
  } else {
    return normalizeQuota(await v1.getCpuQuota(), min, max);
  }
};

export const cpuCountSync = (min = 1, max = cpus().length) => {
  if (platform() !== "linux") return max;
  if (v2.isV2Sync()) {
    return normalizeQuota(v2.getCpuQuotaSync(), min, max);
  } else {
    return normalizeQuota(v1.getCpuQuotaSync(), min, max);
  }
};
