# node-cpu-count

A container-friendly alternative to os.cpus().length. Both cgroups v1 and cgroups v2 are supported.

## Installation

```sh
$ npm install node-cpu-count
```

## Usage

#### `cpuCount(min = 1, max = os.cpus().length): Promise<number>`

Get available logical CPU count (CPU quota / CPU period for cgroups, fallback to `os.cpus().length`).

It always returns an integer by ceiling the result. The result can be used as the number of cluster workers.

`min` or `max` can be specified to determine the minimal and the maximum CPU count (which also overrides the fallback value).

#### `cpuCountSync(min = 1, max = os.cpus().length): number`

A synchronous version of `cpuCount`.

## Examples

```sh
$ git clone https://github.com/lujjjh/node-cpu-count.git && cd node-cpu-count

$ docker run --rm -it -v $(pwd):/app node node /app/examples
8
8

$ docker run --rm -it -v $(pwd):/app --cpus=2 node node /app/examples
2
2

$ docker run --rm -it -v $(pwd):/app --cpus=2.1 node node /app/examples
3
3
```
