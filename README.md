![example workflow](https://github.com/tsl-tuertscher/hgt-elevation/actions/workflows/main.yml/badge.svg)
![example workflow](https://github.com/tsl-tuertscher/hgt-elevation/actions/workflows/npm.yml/badge.svg)
# hgt-elevation
Get elevation from a hgt file

## Usage
The files need to be provided as tiles. The tile grid starts at the prime meridian on the south pole (0, -90). The tessellation describes the number of tiles from the south (-90°) to the north (90°) pole. 180 means that the tile size is 1°x 1°.

```
import { Hgt } from '@tsl-tuertscher/hgt-elevation';

...

const hgt = new Hgt({
  tessellation: 180,
  gridSize: 1201,
  filePath: './test/1201/',
});

const ele = await hgt.getElevationFromCoordinate([
    9.47,
    47.43
]);

```
