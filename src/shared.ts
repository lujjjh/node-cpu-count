import { cpus } from "os";

export const normalizeQuota = (quota: number | undefined, min: number, max: number, ceiling: boolean = true) => {
  if (quota === undefined || !Number.isFinite(quota)) return max;
  return Math.min(Math.max(min, ceiling ? Math.ceil(quota) : quota), max);
};
