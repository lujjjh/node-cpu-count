import { cpus } from "os";

export const normalizeQuota = (quota: number | undefined, min: number, max: number) => {
  if (quota === undefined || !Number.isFinite(quota)) return max;
  return Math.min(Math.max(min, Math.ceil(quota)), max);
};
