const { cpuCount, cpuCountSync } = require("../dist");

(async () => {
  console.log(await cpuCount());
  console.log(cpuCountSync());
})();
