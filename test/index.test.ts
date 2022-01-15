import { readFileSync } from "fs";
import { resolve } from "path";
import { normalizeQuota } from "../src/shared";
import * as v1 from "../src/v1";
import * as v2 from "../src/v2";

const fixture = (path: string) => readFileSync(resolve(__dirname, "fixtures", path), "utf-8");

describe("cgroups v1", () => {
  test("findName", () => {
    expect(v1.findName(fixture("v1/00-cgroup"))).toStrictEqual(
      "/docker/f5492bfdc01b43e1e9074923dff16b2af0c95ce76ac40e560e8875a7b3b56c9b"
    );
    expect(v1.findName(fixture("v2/00-cgroup"))).toBeUndefined();
  });

  test("getCpuDir", () => {
    expect(v1.getCpuDir(fixture("v1/00-cgroup"), fixture("v1/00-mountinfo"))).toStrictEqual(
      "/sys/fs/cgroup/cpu,cpuacct"
    );
    expect(v1.getCpuDir(fixture("v2/00-cgroup"), fixture("v2/00-mountinfo"))).toBeUndefined();
    expect(v1.getCpuDir(fixture("v1/01-cgroup"), fixture("v1/01-mountinfo"))).toStrictEqual(
      "/sys/fs/cgroup/cpu,cpuacct/foo/bar"
    );
    expect(v1.getCpuDir(fixture("v1/02-cgroup"), fixture("v1/02-mountinfo"))).toBeUndefined();
  });

  test("parseCpuQuota", () => {
    expect(v1.parseCpuQuota("10000\n", "100000\n")).toStrictEqual(0.1);
    expect(v1.parseCpuQuota("10000\n100000\n", "100000")).toStrictEqual(0.1);
    expect(v1.parseCpuQuota("-1\n", "100000\n")).toBeUndefined();
    expect(v1.parseCpuQuota("1e4\n", "100000\n")).toBeUndefined();
    expect(v1.parseCpuQuota("", "100000\n")).toBeUndefined();
  });
});

describe("cgroups v2", () => {
  test("getDir", () => {
    expect(v2.getDir(fixture("v2/00-mountinfo"))).toStrictEqual("/sys/fs/cgroup");
    expect(v2.getDir(fixture("v1/00-mountinfo"))).toBeUndefined();
  });

  test("parseCpuQuota", () => {
    expect(v2.parseCpuQuota("10000 100000\n")).toStrictEqual(0.1);
    expect(v2.parseCpuQuota("10000 100000")).toStrictEqual(0.1);
    expect(v2.parseCpuQuota("max 100000\n")).toBeUndefined();
    expect(v2.parseCpuQuota("10000 100000\n100000 100000\n")).toStrictEqual(0.1);
    expect(v2.parseCpuQuota("10000\n")).toBeUndefined();
    expect(v2.parseCpuQuota("")).toBeUndefined();
  });
});

describe("shared", () => {
  test("normalizeQuota", () => {
    expect(normalizeQuota(1.1, 1, 8)).toStrictEqual(2);
    expect(normalizeQuota(0.1, 2, 8)).toStrictEqual(2);
    expect(normalizeQuota(-1, 2, 8)).toStrictEqual(2);
    expect(normalizeQuota(16, 2, 8)).toStrictEqual(8);
    expect(normalizeQuota(undefined, 1, 8)).toStrictEqual(8);
    expect(normalizeQuota(NaN, 1, 8)).toStrictEqual(8);
    expect(normalizeQuota(Infinity, 1, 8)).toStrictEqual(8);
    expect(normalizeQuota(-Infinity, 1, 8)).toStrictEqual(8);
  });
});
